import { Bool, OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { validateEmail } from "utils/email-validator";
import { sanitizeEmail } from "utils/sanitize";
import { z } from "zod";

export class BulkEmailValidation extends OpenAPIRoute {
  schema = {
    tags: ["Email Validation"],
    summary: "Validate multiple email addresses in batch",
    description:
      "Process multiple email validations in a single request. " +
      "Validates syntax, deliverability, and detects disposable email patterns for each address.",
    security: [{ APIKeyHeader: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              emails: z
                .array(
                  z
                    .string({
                      required_error: "Email is required",
                      invalid_type_error: "Email must be a string",
                    })
                    .trim()
                    .toLowerCase()
                    .transform(sanitizeEmail),
                  {
                    description: "List of emails to validate (max 1000)",
                  }
                )
                .min(1, {
                  message: "At least one email is required",
                })
                .max(1000, {
                  message: "Maximum 1000 emails per request",
                }),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns validation results for multiple emails",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              results: z.array(
                z.object({
                  email: z.string(),
                  is_valid: Bool(),
                  score: z.number().min(0).max(1),
                  suggested_correction: z.string().optional(),
                  checks: z.object({
                    syntax: Bool(),
                    mx_records: Bool(),
                    disposable: Bool(),
                    role_account: Bool(),
                    free_provider: Bool(),
                  }),
                })
              ),
            }),
          },
        },
      },
      "400": {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.string(),
            }),
          },
        },
      },
      "500": {
        description: "Server error during validation",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const data = await this.getValidatedData<typeof this.schema>();
      const { emails } = data.body;

      // Deduplicate emails for efficiency
      const uniqueEmails = [
        ...new Set(emails.map((email) => email.trim().toLowerCase())),
      ];

      // Prepare cache lookup map
      const cacheResults = new Map();

      // Check cache for all emails in a single batch operation
      const cachePromises = uniqueEmails.map(async (email) => {
        const cached = await c.env.EMAIL_RESULTS.get(email);
        if (cached) {
          cacheResults.set(email, JSON.parse(cached));
        }
      });

      await Promise.all(cachePromises);

      // Process uncached emails
      const emailsToProcess = uniqueEmails.filter(
        (email) => !cacheResults.has(email)
      );

      // Process in batches of 50 to prevent overwhelming resources
      const BATCH_SIZE = 50;
      const validationResults = [];

      for (let i = 0; i < emailsToProcess.length; i += BATCH_SIZE) {
        const batch = emailsToProcess.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (email) => {
            // Validate
            const result = await validateEmail(email);

            // Cache result
            await c.env.EMAIL_RESULTS.put(email, JSON.stringify(result), {
              expirationTtl: 86400, // 24 hours
            });

            return result;
          })
        );

        validationResults.push(...batchResults);
      }

      // Combine cached and new results in original order
      const results = emails.map((email) => {
        const normalizedEmail = email.trim().toLowerCase();
        return (
          cacheResults.get(normalizedEmail) ||
          validationResults.find((r) => r.email === normalizedEmail)
        );
      });

      return c.json(
        {
          success: true,
          results,
        },
        200
      );
    } catch (error) {
      console.error("Bulk email validation error:", error);

      // Determine status code based on error type
      const statusCode =
        error.status ||
        (error.issues?.some(
          (i) => i.code === "invalid_type" || i.code === "invalid_string"
        )
          ? 400
          : 500);

      return c.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown validation error",
        },
        statusCode
      );
    }
  }
}

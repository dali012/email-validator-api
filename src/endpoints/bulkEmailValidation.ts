import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { bulkEmailValidationSchema } from "schemas/bulkEmailValidation";
import { createErrorResponse } from "utils/createErrorResponse";
import { validateEmail } from "utils/email-validator";

export class BulkEmailValidation extends OpenAPIRoute {
  schema = bulkEmailValidationSchema;

  async handle(c: Context) {
    try {
      // Get API key data (set by middleware)
      const apiKeyData = c.get("apiKey");

      if (!apiKeyData || !apiKeyData.email) {
        return createErrorResponse("Unauthorized: Valid API key required", 401);
      }

      const data = await this.getValidatedData<typeof this.schema>();
      const { emails } = data.body;

      // Deduplicate emails for efficiency
      const uniqueEmails = [
        ...new Set(emails.map((email) => email.trim().toLowerCase())),
      ];

      // Check rate limit - this is in addition to the per-request limit in middleware
      // For bulk operations, we count each email as one request
      // If there are too many emails for the remaining quota, return an error
      const currentHour = new Date().toISOString().slice(0, 13); // Format: YYYY-MM-DDTHH
      const rateLimitKey = `rate_limit:${apiKeyData.key_value}:${currentHour}`;
      const currentUsage = await c.env.API_USAGE.get(rateLimitKey);
      const usageCount = currentUsage ? parseInt(currentUsage) : 0;

      if (usageCount + uniqueEmails.length > apiKeyData.rate_limit) {
        return createErrorResponse(
          `Rate limit would be exceeded. You have ${
            apiKeyData.rate_limit - usageCount
          } requests remaining this hour, but this operation requires ${
            uniqueEmails.length
          } requests.`,
          429
        );
      }

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

      // Update API usage - count each email as one request
      // This is just for non-cached emails to be fair to users
      if (emailsToProcess.length > 0) {
        await c.env.API_USAGE.put(
          rateLimitKey,
          (usageCount + emailsToProcess.length).toString(),
          { expirationTtl: 3600 }
        );

        // Update total usage in the database
        await c.env.DB.prepare(
          "UPDATE api_keys SET total_requests = total_requests + ? WHERE key_value = ?"
        )
          .bind(emailsToProcess.length, apiKeyData.key_value)
          .run();
      }

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

      return createErrorResponse(
        error instanceof Error ? error.message : "Unknown validation error",
        statusCode
      );
    }
  }
}

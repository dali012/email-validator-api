import { Bool, OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { validateEmail } from "utils/email-validator";
import { sanitizeEmail } from "utils/sanitize";
import { z } from "zod";

export class ValidateEmail extends OpenAPIRoute {
  schema = {
    tags: ["Email Validation"],
    summary: "Validate an email address",
    description:
      "Validates email address format, checks for deliverability, and detects disposable email patterns. " +
      "Returns a validation score and specific checks including syntax validity, mail server availability, " +
      "disposable email detection, and role-based account identification.",
    security: [{ APIKeyHeader: [] }],
    request: {
      query: z.object({
        email: z
          .string({
            description: "Email address to validate",
            required_error: "Email address is required",
            invalid_type_error: "Email must be a string",
          })
          .trim()
          .toLowerCase()
          .transform(sanitizeEmail),
      }),
    },
    responses: {
      "200": {
        description: "Returns email validation result",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
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
              }),
            }),
          },
        },
      },
      "304": {
        description: "Not Modified (content hasn't changed)",
      },
      "400": {
        description: "Missing or invalid email parameter",
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
      // Validate the request data
      const data = await this.getValidatedData<typeof this.schema>();
      const { email } = data.query;

      // Generate ETag for this request
      const etag = `"${email}-v1"`;

      // Check If-None-Match header for caching
      const ifNoneMatch = c.req.header("if-none-match");
      if (ifNoneMatch === etag) {
        return c.newResponse(null, 304, {
          ETag: etag,
          "Cache-Control": "public, max-age=86400",
        });
      }

      // Check cache first
      const cachedResult = await c.env.EMAIL_RESULTS.get(email);
      if (cachedResult) {
        return c.json(
          {
            success: true,
            result: JSON.parse(cachedResult),
          },
          200,
          {
            ETag: etag,
            "Cache-Control": "public, max-age=86400",
          }
        );
      }

      // Perform validation
      const result = await validateEmail(email);

      // Cache the result
      await c.env.EMAIL_RESULTS.put(email, JSON.stringify(result), {
        expirationTtl: 86400,
      });

      return c.json(
        {
          success: true,
          result,
        },
        200,
        {
          ETag: etag,
          "Cache-Control": "public, max-age=86400",
        }
      );
    } catch (error) {
      console.error("Email validation error:", error);

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

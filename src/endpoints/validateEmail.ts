import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { validateEmailSchema } from "schemas/validateEmail";
import { createErrorResponse } from "utils/createErrorResponse";
import { createSuccessResponse } from "utils/createSuccessResponse";
import { validateEmail } from "utils/email-validator";

export class ValidateEmail extends OpenAPIRoute {
  schema = validateEmailSchema;

  async handle(c: Context) {
    try {
      // Get API key data (set by middleware)
      const apiKeyData = c.get("apiKey");

      if (!apiKeyData || !apiKeyData.email) {
        return createErrorResponse("Unauthorized: Valid API key required", 401);
      }

      // Validate the request data
      const data = await this.getValidatedData<typeof this.schema>();
      const { email } = data.query;

      // Generate ETag for this request
      const etag = `"${email}-v1"`;
      const cacheHeaders = {
        ETag: etag,
        "Cache-Control": "public, max-age=86400",
      };

      // Check If-None-Match header for caching
      const ifNoneMatch = c.req.header("if-none-match");
      if (ifNoneMatch === etag) {
        return c.newResponse(null, 304, cacheHeaders);
      }

      // Check cache first
      const cachedResult = await c.env.EMAIL_RESULTS.get(email);
      if (cachedResult) {
        return createSuccessResponse(
          c,
          JSON.parse(cachedResult),
          200,
          cacheHeaders
        );
      }

      // Perform validation
      const result = await validateEmail(email);

      // Cache the result
      await c.env.EMAIL_RESULTS.put(email, JSON.stringify(result), {
        expirationTtl: 86400,
      });

      return createSuccessResponse(c, result, 200, cacheHeaders);
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

      return createErrorResponse(
        error instanceof Error ? error.message : "Unknown validation error",
        statusCode
      );
    }
  }
}

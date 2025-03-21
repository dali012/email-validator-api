import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { listApiKeysSchema } from "schemas/listApiKeys";
import { createErrorResponse } from "utils/createErrorResponse";
import { createSuccessResponse } from "utils/createSuccessResponse";

export class ListApiKeys extends OpenAPIRoute {
  schema = listApiKeysSchema;

  async handle(c: Context) {
    try {
      // Get the authenticated API key info from context (set by middleware)
      const apiKeyData = c.get("apiKey");

      if (!apiKeyData || !apiKeyData.email) {
        return createErrorResponse("Unauthorized: Valid API key required", 401);
      }

      const email = apiKeyData.email;

      // Get all keys for this email from D1
      const results = await c.env.DB.prepare(
        `SELECT id, key_value, name, created_at, last_used_at, 
         expires_at, is_active, rate_limit, total_requests
         FROM api_keys 
         WHERE email = ? 
         ORDER BY created_at DESC`
      )
        .bind(email)
        .all();

      // Mask the API keys for security (showing only first and last 4 chars)
      const maskedResults = results.results?.map((key) => {
        const keyValue = key.key_value;
        const maskedKey =
          keyValue.length > 8
            ? `${keyValue.substring(0, 4)}...${keyValue.substring(
                keyValue.length - 4
              )}`
            : keyValue;

        return {
          ...key,
          key_value: maskedKey,
        };
      });

      return createSuccessResponse(c, {
        email,
        keys: maskedResults || [],
      });
    } catch (error) {
      console.error("Error listing API keys:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to fetch API keys",
        500
      );
    }
  }
}

import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { keyUsageSchema } from "schemas/keyUsage";
import { createErrorResponse } from "utils/createErrorResponse";
import { createSuccessResponse } from "utils/createSuccessResponse";

export class KeyUsage extends OpenAPIRoute {
  schema = keyUsageSchema;

  async handle(c: Context) {
    try {
      // Get the API key data from context (set by middleware)
      const apiKeyData = c.get("apiKey");

      if (!apiKeyData || !apiKeyData.email) {
        return createErrorResponse("Unauthorized: Valid API key required", 401);
      }

      // We already have the key information from the middleware
      const keyInfo = {
        id: apiKeyData.id,
        rate_limit: apiKeyData.rate_limit,
        expires_at: apiKeyData.expires_at,
      };

      // Get usage information
      const now = new Date();

      // Get current hour usage from KV store
      const currentHour = now.toISOString().slice(0, 13); // Format: YYYY-MM-DDTHH
      const rateLimitKey = `rate_limit:${apiKeyData.key_value}:${currentHour}`;
      const currentUsage = await c.env.API_USAGE.get(rateLimitKey);
      const recentUsage = currentUsage ? parseInt(currentUsage) : 0;

      // Get total requests from database
      const totalResult = await c.env.DB.prepare(
        `SELECT total_requests FROM api_keys WHERE id = ?`
      )
        .bind(keyInfo.id)
        .first();

      const usage = {
        total_requests: totalResult?.total_requests || 0,
        recent_usage: recentUsage,
        remaining_requests: keyInfo.rate_limit - recentUsage,
        rate_limit: keyInfo.rate_limit,
        expires_at: keyInfo.expires_at,
      };

      return createSuccessResponse(c, usage);
    } catch (error) {
      console.error("Error fetching key usage:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to fetch key usage",
        500
      );
    }
  }
}

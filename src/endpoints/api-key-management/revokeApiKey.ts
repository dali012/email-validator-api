import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { revokeApiKeySchema } from "schemas/revokeApiKey";
import { createErrorResponse } from "utils/createErrorResponse";
import { createSuccessResponse } from "utils/createSuccessResponse";

export class RevokeApiKey extends OpenAPIRoute {
  schema = revokeApiKeySchema;

  async handle(c: Context) {
    try {
      // Get the authenticated API key info from context (set by middleware)
      const apiKeyData = c.get("apiKey");

      if (!apiKeyData || !apiKeyData.email) {
        return createErrorResponse("Unauthorized: Valid API key required", 401);
      }

      const { keyId } = c.req.param();

      if (!keyId) {
        return createErrorResponse("Missing key ID", 400);
      }

      // Prevent revoking the key that's currently being used for authentication
      if (String(apiKeyData.id) === String(keyId)) {
        return createErrorResponse(
          "Cannot revoke the API key that's currently being used for authentication",
          403
        );
      }

      // Revoke the key (only if it belongs to the authenticated user's email)
      const result = await c.env.DB.prepare(
        `UPDATE api_keys 
         SET is_active = 0 
         WHERE id = ? AND email = ?`
      )
        .bind(keyId, apiKeyData.email)
        .run();

      if (!result || result.changes === 0) {
        return createErrorResponse(
          "API key not found or not owned by your account",
          404
        );
      }
      return createSuccessResponse(c, {
        message: "API key revoked successfully",
      });
    } catch (error) {
      console.error("Error revoking API key:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to fetch API keys",
        500
      );
    }
  }
}

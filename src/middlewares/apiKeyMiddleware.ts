import { Context, Next } from "hono";
import { createErrorResponse } from "utils/createErrorResponse";

/**
 * Middleware to validate API keys and handle rate limiting
 */
export async function apiKeyMiddleware(c: Context, next: Next) {
  try {
    // Extract API key from Authorization header
    let apiKey: string | null = null;

    // Check Authorization header (Bearer token format)
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7); // Remove "Bearer " prefix
    }

    // If no API key found, return error
    if (!apiKey) {
      return createErrorResponse(
        "Missing API key. Provide it in Authorization header or as api_key query parameter.",
        401
      );
    }

    // Validate the API key format (should start with "ev_")
    if (!apiKey.startsWith("ev_")) {
      return createErrorResponse("Invalid API key format", 401);
    }

    // Query the database to check if the key exists and is active
    const keyData = await c.env.DB.prepare(
      "SELECT * FROM api_keys WHERE key_value = ? AND is_active = 1"
    )
      .bind(apiKey)
      .first();

    if (!keyData) {
      return createErrorResponse("Invalid or inactive API key", 401);
    }

    // Check if the API key has expired
    if (keyData.expires_at) {
      const expirationDate = new Date(keyData.expires_at);
      const now = new Date();
      
      if (now > expirationDate) {
        return createErrorResponse("API key has expired", 401);
      }
    }

    // Check rate limiting
    const currentHour = new Date().toISOString().slice(0, 13); // Format: YYYY-MM-DDTHH
    const rateLimitKey = `rate_limit:${apiKey}:${currentHour}`;

    // Get current usage from KV store
    let currentUsage = await c.env.API_USAGE.get(rateLimitKey);
    const usageCount = currentUsage ? parseInt(currentUsage) : 0;

    // Check if rate limit exceeded
    if (usageCount >= keyData.rate_limit) {
      return createErrorResponse(
        `Rate limit exceeded. Maximum ${keyData.rate_limit} requests per hour.`,
        429
      );
    }

    // Store API key context for later use in handlers
    c.set("apiKey", keyData);

    // Proceed to the next middleware or handler
    await next();

    // Increment usage counter after successful request
    await c.env.API_USAGE.put(
      rateLimitKey,
      (usageCount + 1).toString(),
      { expirationTtl: 3600 } // Expire after 1 hour
    );

    // Update total usage count and last_used_at in database
    await c.env.DB.prepare(
      "UPDATE api_keys SET total_requests = total_requests + 1, last_used_at = CURRENT_TIMESTAMP WHERE key_value = ?"
    )
      .bind(apiKey)
      .run();
  } catch (error) {
    return createErrorResponse("Server error while validating API key", 500);
  }
}
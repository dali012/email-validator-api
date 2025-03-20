import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { Env, Variables } from "types";
import { cache } from "hono/cache";

export function setupMiddlewares(
  app: Hono<{ Bindings: Env; Variables: Variables }>
) {
  // Global middlewares
  app.use("*", logger());
  app.use("*", prettyJSON());
  app.use("*", secureHeaders());
  app.use(
    "/api/*",
    cors({
      origin: "*",
      maxAge: 86400,
    })
  );

  // Middleware to protect the create-api-key endpoint with a secret key
  app.use("/api/create-api-key", async (c, next) => {
    try {
      // Get request body
      const body = await c.req.json();
      const secretKey = body.secretKey;

      // If no secret key provided in the request
      if (!secretKey) {
        return c.json(
          {
            success: false,
            error: "Secret key is required",
          },
          401
        );
      }

      // Get the valid secret key from environment variable/secret
      const validSecretKey = c.env.ADMIN_SECRET_KEY;

      // If secret key doesn't match
      if (!validSecretKey || secretKey !== validSecretKey) {
        return c.json(
          {
            success: false,
            error: "Invalid secret key",
          },
          401
        );
      }

      // Remove secretKey from body to avoid storing it in logs or passing it further
      delete body.secretKey;
      c.set("requestBody", body);

      // Secret key is valid, proceed to the handler
      await next();
    } catch (error) {
      console.error("Secret key validation error:", error);
      return c.json(
        {
          success: false,
          error: "Invalid request format",
        },
        400
      );
    }
  });

  // API key validation middleware for other endpoints
  app.use("/api/*", async (c, next) => {
    // Skip API key check for the create-api-key endpoint
    if (c.req.path === "/api/create-api-key") {
      return next();
    }
    const apiKey = c.req.header("x-api-key");

    if (!apiKey) {
      return c.json(
        {
          success: false,
          error: "API key is required",
        },
        401
      );
    }

    try {
      // Check if API key exists and is valid in the database
      const keyData = await c.env.DB.prepare(
        "SELECT * FROM api_keys WHERE key = ? AND (expires_at IS NULL OR expires_at > ?) AND revoked = FALSE"
      )
        .bind(apiKey, new Date().toISOString())
        .first();

      if (!keyData) {
        return c.json(
          {
            success: false,
            error: "Invalid or expired API key",
          },
          401
        );
      }

      // Record API key usage (optional)
      await c.env.DB.prepare(
        "INSERT INTO api_key_usage (key_id, endpoint, timestamp) VALUES (?, ?, ?)"
      )
        .bind(keyData.id, c.req.path, new Date().toISOString())
        .run();

      // No need to store user info in context since we removed user-specific limitations
      await next();
    } catch (error) {
      console.error("API key validation error:", error);
      return c.json(
        {
          success: false,
          error: "Authentication error",
        },
        500
      );
    }
  });

  // Add caching for GET endpoints
  app.use(
    "/api/validate",
    cache({
      cacheName: "email-validator-cache",
      cacheControl: "max-age=60",
      vary: ["x-api-key"],
    })
  );
}

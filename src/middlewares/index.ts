import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { Env, Variables } from "types";
import { cache } from "hono/cache";
import { apiKeyMiddleware } from "./apiKeyMiddleware";

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

  // API key validation middleware for other endpoints
  app.use("/api/validate/*", apiKeyMiddleware);
  app.use("/api/keys/me", apiKeyMiddleware);
  app.use("/api/keys/revoke/*", apiKeyMiddleware);
  app.use("/api/keys/usage", apiKeyMiddleware);

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

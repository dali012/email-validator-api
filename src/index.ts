import { fromHono } from "chanfana";
import { Hono } from "hono";
import { ValidateEmail } from "endpoints/validateEmail";
import { setupMiddlewares } from "middlewares";
import { BulkEmailValidation } from "endpoints/bulkEmailValidation";
import { RequestApiKey } from "endpoints/api-key-management/requestApiKey";
import { Env, Variables } from "types";
import { VerifyAndGenerateApiKey } from "endpoints/api-key-management/verifyAndGenerateApiKey";
import { ListApiKeys } from "endpoints/api-key-management/listApiKeys";
import { RevokeApiKey } from "endpoints/api-key-management/revokeApiKey";
import { KeyUsage } from "endpoints/api-key-management/keyUsage";

// Start a Hono app
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Apply all middlewares in a modularized way
setupMiddlewares(app);

// Setup OpenAPI registry
const openapi = fromHono(app, {
  schema: {
    info: {
      title: "Email Validator",
      version: "1.0.0",
      description: "A simple email validation service",
      contact: {
        name: "Dali012",
        email: "dali.jerbi97@gmail.com",
        url: "https://dali012.me",
      },
    },
    servers: [
      {
        url: "https://email-validator.dali012.me/",
        description: "Production server",
      },
      {
        url: "http://localhost:8787",
        description: "Development server",
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  docs_url: "/",
  openapiVersion: "3.1",
  generateOperationIds: true,
  raiseUnknownParameters: false,
});

// OpenAPI Configuration - Bearer auth
openapi.registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "API Key",
  description:
    "Enter your API key with the 'Bearer ' prefix, e.g., 'Bearer ev_your_api_key'",
});

// Email validations endpoints
openapi.get("/api/validate", ValidateEmail); // Single email validation
openapi.post("/api/validate/bulk", BulkEmailValidation); // Bulk email validation

// API Key Management Endpoints - No auth required for these endpoints
openapi.post("/api/keys/request", RequestApiKey); // Request a new API key
openapi.get("/api/keys/verify/:token", VerifyAndGenerateApiKey); // Verify email and generate key

// Protected API Key Management Endpoints
openapi.get("/api/keys/me", ListApiKeys); // List all API keys
openapi.delete("/api/keys/revoke/:keyId", RevokeApiKey); // Revoke an API key
openapi.get("/api/keys/usage", KeyUsage); // Get API key usage

// Export the Hono app
export default app;

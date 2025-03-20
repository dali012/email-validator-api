import { fromHono } from "chanfana";
import { Hono } from "hono";
import { Env, Variables } from "types";
import { ValidateEmail } from "endpoints/validateEmail";
import { setupMiddlewares } from "middlewares";
import { CreateApiKey } from "endpoints/createApiKey";
import { BulkEmailValidation } from "endpoints/bulkEmailValidation";

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
        APIKeyHeader: [],
      },
    ],
  },
  docs_url: "/",
  openapiVersion: "3.1",
  generateOperationIds: true,
  raiseUnknownParameters: false,
});

//OpenAPI Configuration
openapi.registry.registerComponent("securitySchemes", "APIKeyHeader", {
  type: "apiKey",
  name: "x-api-key",
  in: "header",
});

// Register Email validation endpoints
openapi.get("/api/validate", ValidateEmail); // Single email validation
openapi.post("/api/validate/bulk", BulkEmailValidation); // Bulk email validation
openapi.post("/api/create-api-key", CreateApiKey); // Create a new API key

// Export the Hono app
export default app;

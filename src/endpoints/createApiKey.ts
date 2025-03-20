import { Bool, OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export class CreateApiKey extends OpenAPIRoute {
  schema = {
    tags: ["API Management"],
    summary: "Create a new API key",
    description:
      "Generate a new API key for accessing the email validation services. " +
      "Each key is unique and should be stored securely.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z
                .string({
                  description: "Name for the API key (for reference)",
                  required_error: "API key name is required",
                  invalid_type_error: "Name must be a string",
                })
                .trim()
                .min(1, "Name cannot be empty")
                .max(100, "Name must be 100 characters or less"),
              expiresIn: z
                .number({
                  description:
                    "Expiration time in days (default: never expires)",
                  invalid_type_error: "Expiration time must be a number",
                })
                .int("Expiration time must be a whole number")
                .min(1, "Minimum expiration time is 1 day")
                .max(365, "Maximum expiration time is 365 days")
                .optional(),
              secretKey: z.string({
                description: "Secret key to authenticate the request",
                required_error: "Secret key is required",
                invalid_type_error: "Secret key must be a string",
              }),
            }),
          },
        },
      },
    },
    responses: {
      "201": {
        description: "API key created successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              apiKey: z.string({ description: "The generated API key" }),
              name: z.string({ description: "Name of the API key" }),
              expiresAt: z
                .string({
                  description: "Expiration date (ISO format) if applicable",
                })
                .optional(),
            }),
          },
        },
      },
      "400": {
        description: "Invalid request parameters",
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
        description: "Server error while creating API key",
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
      // Get the pre-validated request body (with secretKey already removed)
      const data =
        c.get("requestBody") ||
        (await this.getValidatedData<typeof this.schema>());
      const { name, expiresIn } = data;

      // Generate a unique API key
      const apiKey = `ek_${uuidv4()}`;

      // Calculate expiration time if provided
      let expiresAt = null;
      if (expiresIn) {
        expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
      }

      // Store the API key in the database
      await c.env.DB.prepare(
        "INSERT INTO api_keys (key, name, created_at, expires_at) VALUES (?, ?, ?, ?)"
      )
        .bind(
          apiKey,
          name,
          new Date().toISOString(),
          expiresAt ? expiresAt.toISOString() : null
        )
        .run();

      return c.json(
        {
          success: true,
          apiKey,
          name,
          expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
        },
        201
      );
    } catch (error) {
      console.error("API key creation error:", error);

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
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        statusCode
      );
    }
  }
}

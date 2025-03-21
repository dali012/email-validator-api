import { Bool } from "chanfana";
import { z } from "zod";

export const revokeApiKeySchema = {
  tags: ["API Management"],
  summary: "Revoke an API key",
  description: "Revokes a specific API key belonging to the authenticated user",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      keyId: z.string({
        description: "ID of the API key to revoke",
      }),
    }),
  },
  responses: {
    "200": {
      description: "API key revoked successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            message: z.string(),
          }),
        },
      },
    },
    "401": {
      description: "Unauthorized: Missing or invalid API key",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            error: z.object({
              message: z.string(),
              code: z.number(),
            }),
          }),
        },
      },
    },
    "400": {
      description: "Bad request: Missing key ID",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            error: z.object({
              message: z.string(),
              code: z.number(),
            }),
          }),
        },
      },
    },
    "403": {
      description:
        "Forbidden: Cannot revoke key that is currently being used for authentication",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            error: z.object({
              message: z.string(),
              code: z.number(),
            }),
          }),
        },
      },
    },
    "404": {
      description: "API key not found or not owned by authenticated user",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            error: z.object({
              message: z.string(),
              code: z.number(),
            }),
          }),
        },
      },
    },
    "500": {
      description: "Server error while revoking key",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            error: z.object({
              message: z.string(),
              code: z.number(),
            }),
          }),
        },
      },
    },
  },
};

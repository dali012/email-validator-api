import { Bool } from "chanfana";
import { z } from "zod";

export const listApiKeysSchema = {
  tags: ["API Management"],
  summary: "List user's API keys",
  description: "Lists all API keys associated with the authenticated user",
  security: [{ BearerAuth: [] }],
  responses: {
    "200": {
      description: "API keys retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            email: z.string().email(),
            keys: z.array(
              z.object({
                id: z.string(),
                key_value: z.string(),
                name: z.string(),
                created_at: z.string(),
                last_used_at: z.string().nullable(),
                expires_at: z.string().nullable(),
                is_active: z.boolean(),
                rate_limit: z.number(),
                total_requests: z.number().optional(),
              })
            ),
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
    "500": {
      description: "Server error while fetching keys",
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

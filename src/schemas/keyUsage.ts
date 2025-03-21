import { Bool } from "chanfana";
import { z } from "zod";

export const keyUsageSchema = {
  tags: ["API Management"],
  summary: "Get API key usage information",
  description: "Retrieves usage statistics for an API key",
  security: [{ BearerAuth: [] }],
  responses: {
    "200": {
      description: "Usage information retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            usage: z.object({
              total_requests: z.number(),
              recent_usage: z.number(),
              remaining_requests: z.number(),
              rate_limit: z.number(),
              expires_at: z.string().nullable(),
            }),
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
      description: "Server error while retrieving usage",
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

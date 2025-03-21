import { z } from "zod";

export const verifyAndGenerateApiKeySchema = {
  tags: ["API Management"],
  summary: "Verify email and generate API key",
  description:
    "Second step in creating an API key - verifies email and issues key",
  request: {
    params: z.object({
      token: z.string({
        description: "Verification token from email",
      }),
    }),
  },
  responses: {
    "201": {
      description: "API key created successfully",
      content: {
        "text/html": {
          schema: z.string(),
        },
      },
    },
    "400": {
      description: "Invalid or expired verification token",
      content: {
        "text/html": {
          schema: z.string(),
        },
      },
    },
    "500": {
      description: "Server error while generating key",
      content: {
        "text/html": {
          schema: z.string(),
        },
      },
    },
  },
};

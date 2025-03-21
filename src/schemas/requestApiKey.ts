import { Bool } from "chanfana";
import { z } from "zod";

export const requestApiKeySchema = {
  tags: ["API Management"],
  summary: "Request an new API key",
  description: "First step in creating an API key - sends verification email",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z
              .string({
                description: "Email address to associate with the API key",
                required_error: "Email address is required",
              })
              .email("Please provide a valid email address"),
            name: z
              .string({
                description: "Name for the API key (for reference)",
              })
              .min(1, "Name cannot be empty")
              .max(100, "Name must be 100 characters or less"),
            purpose: z
              .string({
                description: "Intended use of the API key",
              })
              .min(5, "Please describe your intended use")
              .optional(),
          }),
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Verification email sent successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            message: z.string(),
            email: z.string().email(),
          }),
        },
      },
    },
    "400": {
      description: "Invalid request parameters or too many keys",
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
      description: "Server error while processing request",
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

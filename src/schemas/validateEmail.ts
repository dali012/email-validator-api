import { Bool } from "chanfana";
import { z } from "zod";
import { sanitizeEmail } from "utils/sanitize";

export const validateEmailSchema = {
  tags: ["Email Validation"],
  summary: "Validate an email address",
  description:
    "Validates email address format, checks for deliverability, and detects disposable email patterns. " +
    "Returns a validation score and specific checks including syntax validity, mail server availability, " +
    "disposable email detection, and role-based account identification.",
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      email: z
        .string({
          description: "Email address to validate",
          required_error: "Email address is required",
          invalid_type_error: "Email must be a string",
        })
        .trim()
        .toLowerCase()
        .transform(sanitizeEmail),
    }),
  },
  responses: {
    "200": {
      description: "Returns email validation result",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            result: z.object({
              email: z.string(),
              is_valid: Bool(),
              score: z.number().min(0).max(1),
              suggested_correction: z.string().optional(),
              checks: z.object({
                syntax: Bool(),
                mx_records: Bool(),
                disposable: Bool(),
                role_account: Bool(),
                free_provider: Bool(),
              }),
            }),
          }),
        },
      },
    },
    "304": {
      description: "Not Modified (content hasn't changed)",
    },
    "400": {
      description: "Missing or invalid email parameter",
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
    "429": {
      description: "Rate limit exceeded",
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
      description: "Server error during validation",
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

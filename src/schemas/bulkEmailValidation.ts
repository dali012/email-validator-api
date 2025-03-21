import { Bool } from "chanfana";
import { sanitizeEmail } from "utils/sanitize";
import { z } from "zod";

export const bulkEmailValidationSchema = {
  tags: ["Email Validation"],
  summary: "Validate multiple email addresses in batch",
  description:
    "Process multiple email validations in a single request. " +
    "Validates syntax, deliverability, and detects disposable email patterns for each address.",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            emails: z
              .array(
                z
                  .string({
                    required_error: "Email is required",
                    invalid_type_error: "Email must be a string",
                  })
                  .trim()
                  .toLowerCase()
                  .transform(sanitizeEmail),
                {
                  description: "List of emails to validate (max 1000)",
                }
              )
              .min(1, {
                message: "At least one email is required",
              })
              .max(1000, {
                message: "Maximum 1000 emails per request",
              }),
          }),
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Returns validation results for multiple emails",
      content: {
        "application/json": {
          schema: z.object({
            success: Bool(),
            results: z.array(
              z.object({
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
              })
            ),
          }),
        },
      },
    },
    "400": {
      description: "Invalid request",
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

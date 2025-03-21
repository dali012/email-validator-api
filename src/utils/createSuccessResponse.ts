import { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Creates a standardized successful JSON response
 *
 * @param c The Hono context
 * @param data The data to include in the response
 * @param statusCode HTTP status code (defaults to 200)
 * @param headers Optional additional headers
 * @returns A formatted JSON response
 */
export const createSuccessResponse = (
  c: Context,
  data: any,
  statusCode = 200,
  headers: Record<string, string> = {}
) => {
  return c.json(
    {
      success: true,
      result: data,
    },
    statusCode as ContentfulStatusCode,
    headers
  );
};

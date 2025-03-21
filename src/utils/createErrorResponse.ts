/**
 * Creates a standardized error response
 *
 * @param message Error message
 * @param status HTTP status code
 * @returns JSON response with error details
 */
export function createErrorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message,
        code: status,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

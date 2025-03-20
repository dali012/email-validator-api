/**
 * Sanitizes input to prevent injection attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitize(input: string): string {
  if (!input) return input;

  // Remove potentially dangerous characters
  return input.replace(/[<>&"'`]/g, "").trim();
}

/**
 * Specific sanitization for email addresses
 * @param email Email address to sanitize
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return email;

  // First apply basic sanitization
  let sanitized = sanitize(email.toLowerCase().trim());

  // Keep only valid email characters
  sanitized = sanitized.replace(/[^\w.@+-]/g, "");

  return sanitized;
}

import { OpenAPIRoute } from "chanfana";
import { KEY_LIMIT } from "constants/index";
import { Context } from "hono";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";
import { requestApiKeySchema } from "schemas/requestApiKey";
import { createErrorResponse } from "utils/createErrorResponse";
import { createVerificationEmailTemplate } from "templates/verificationEmail";
import { createSuccessResponse } from "utils/createSuccessResponse";

export class RequestApiKey extends OpenAPIRoute {
  schema = requestApiKeySchema;

  async handle(c: Context) {
    try {
      const data = await this.getValidatedData<typeof this.schema>();

      const { email, name, purpose } = data.body;

      // Check if email already has active keys (using D1 database)
      const keyCount = await c.env.DB.prepare(
        `SELECT COUNT(*) as count FROM api_keys 
         WHERE email = ? AND is_active = 1`
      )
        .bind(email)
        .first();

      if (keyCount && keyCount.count >= KEY_LIMIT) {
        return createErrorResponse(
          `You already have ${keyCount.count} active API keys. Please use or revoke existing keys.`,
          400
        );
      }

      // Create verification token and set expiry (30 minutes)
      const verificationToken = uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // Store pending verification in KV
      await c.env.PENDING_VERIFICATIONS.put(
        verificationToken,
        JSON.stringify({
          email,
          name,
          purpose: purpose || "",
          expiresAt: expiresAt.toISOString(),
        }),
        { expirationTtl: 1800 } // 30 minutes in seconds
      );

      // Create verification URL
      const verificationUrl = `${c.env.API_BASE_URL}/api/keys/verify/${verificationToken}`;

      // Get email template
      const emailTemplate = createVerificationEmailTemplate(verificationUrl);

      // Send verification email using Resend
      const resend = new Resend(c.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: `Email Validator API <${c.env.EMAIL_FROM}>`,
        to: email,
        subject: "Verify your API key request",
        text: emailTemplate.text,
        html: emailTemplate.html,
      });

      if (error) {
        if (error) {
          return createErrorResponse(
            `Resend failed to send verification email for managing API Keys: ${error.name} - ${error.message}`,
            500
          );
        }
      }

      return createSuccessResponse(c, {
        message:
          "Verification email sent. Please check your inbox and click the verification link to generate your API key.",
        email,
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Unknown validation error",
        500
      );
    }
  }
}

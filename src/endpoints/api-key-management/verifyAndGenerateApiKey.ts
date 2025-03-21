import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { createErrorHtml } from "utils/createErrorHtml";
import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_EXPIRATION_PERIOD_MS,
  DEFAULT_RATE_LIMIT,
} from "constants/index";
import { verifyAndGenerateApiKeySchema } from "schemas/verifyAndGenerateApiKey";
import { createApiKeySuccessPage } from "templates/apiKeySuccessPage";

export class VerifyAndGenerateApiKey extends OpenAPIRoute {
  schema = verifyAndGenerateApiKeySchema;

  async handle(c: Context) {
    try {
      const { token } = c.req.param();

      // Get verification data from KV
      const verificationData = await c.env.PENDING_VERIFICATIONS.get(token);

      if (!verificationData) {
        return createErrorHtml("Invalid or expired verification link", 400);
      }

      const verification = JSON.parse(verificationData);

      // Generate the API key
      //uuidv4 to generate a random key
      const uuid = uuidv4();
      const apiKey = `ev_${uuid}`;

      // Set creation date
      const now = new Date();
      const createdAt = now.toISOString();

      // Set expiration date (1 year from now by default)
      const expiresAt = new Date(
        now.getTime() + DEFAULT_EXPIRATION_PERIOD_MS
      ).toISOString();

      // Save to D1 database
      await c.env.DB.prepare(
        `INSERT INTO api_keys (key_value, name, email, rate_limit, notes, created_at, expires_at, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
      )
        .bind(
          apiKey,
          verification.name,
          verification.email,
          DEFAULT_RATE_LIMIT,
          verification.purpose,
          createdAt,
          expiresAt
        )
        .run();

      // Remove from KV
      await c.env.PENDING_VERIFICATIONS.delete(token);

      // Return success HTML page with the API key
      const htmlContent = createApiKeySuccessPage(
        apiKey,
        DEFAULT_RATE_LIMIT,
        expiresAt
      );
      return c.html(htmlContent, 201);
    } catch (error) {
      return createErrorHtml("Failed to generate API key", 500);
    }
  }
}

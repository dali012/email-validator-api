const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Generates a secure random admin secret key
 * @param {number} length The length of the secret key (default: 32)
 * @returns {string} A secure random string
 */
function generateSecretKey(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Saves the generated key to a .env file
 * @param {string} key The generated secret key
 */
function saveToEnvFile(key) {
  const envPath = path.join(process.cwd(), ".env");

  // Check if .env file exists
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");

    // Replace existing ADMIN_SECRET_KEY if it exists
    if (envContent.includes("ADMIN_SECRET_KEY=")) {
      envContent = envContent.replace(
        /ADMIN_SECRET_KEY=.*/g,
        `ADMIN_SECRET_KEY=${key}`
      );
    } else {
      // Add it as a new line
      envContent += `\nADMIN_SECRET_KEY=${key}`;
    }
  } else {
    // Create new .env file
    envContent = `ADMIN_SECRET_KEY=${key}`;
  }

  // Write to .env file
  fs.writeFileSync(envPath, envContent);
}

/**
 * Main function to generate and save the admin secret key
 */
function main() {
  console.log("Generating secure ADMIN_SECRET_KEY...");
  const secretKey = generateSecretKey();
  console.log(`Generated key: ${secretKey}`);

  saveToEnvFile(secretKey);
  console.log("Secret key saved to .env file");

  console.log("\nTo add this to your Cloudflare Workers environment, run:");
  console.log(`npx wrangler secret put ADMIN_SECRET_KEY`);
  console.log("Then, when prompted, paste the generated key");
}

// Execute the script
main();
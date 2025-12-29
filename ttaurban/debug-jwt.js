// Quick JWT Debug Script
const jwt = require("jsonwebtoken");

// Get token from first argument
const token = process.argv[2];

if (!token) {
  console.log("Usage: node debug-jwt.js <token>");
  process.exit(1);
}

console.log("\n🔍 JWT Debug Tool\n");
console.log("Token:", token.substring(0, 30) + "...\n");

// Decode without verification (to see payload)
const decoded = jwt.decode(token, { complete: true });
console.log("📦 Decoded Payload (unverified):");
console.log(JSON.stringify(decoded, null, 2));

// Try verification with the secret from .env.local
const JWT_SECRET =
  "dev_jwt_access_secret_change_in_production_use_random_64_chars";

console.log("\n🔐 Attempting verification with JWT_SECRET...");
try {
  const verified = jwt.verify(token, JWT_SECRET, {
    issuer: "ttaurban-api",
    audience: "ttaurban-client",
  });
  console.log("✅ Token is VALID!");
  console.log("Verified payload:", JSON.stringify(verified, null, 2));
} catch (error) {
  console.log("❌ Verification failed:", error.message);

  // Try without audience/issuer
  try {
    const verified2 = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token is valid without aud/iss check");
    console.log("Payload:", JSON.stringify(verified2, null, 2));
  } catch (error2) {
    console.log("❌ Still failed:", error2.message);
  }
}

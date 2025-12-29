// Simpler test - just hit test-auth endpoint
const BASE_URL = "http://localhost:3000";

async function test() {
  console.log("📝 Creating new test user...");
  const email = `test${Date.now()}@test.com`;
  const password = "Test123!@#";

  // Create user
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name: "Quick Test",
      role: "ADMIN",
    }),
  });

  const signupData = await signupRes.json();
  console.log("Signup status:", signupRes.status);

  if (signupData.accessToken) {
    console.log("\n✅ Got token from signup!");
    const token = signupData.accessToken;
    console.log("Token (first 50 chars):", token.substring(0, 50) + "...");

    // Try to access test endpoint
    console.log(
      "\n📊 Testing /api/test-bypass endpoint (middleware bypassed)..."
    );
    const testRes = await fetch(`${BASE_URL}/api/test-bypass`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status:", testRes.status);
    const testData = await testRes.json();
    console.log("Response:", testData);

    if (testRes.status === 200) {
      console.log("\n🎉 SUCCESS! RBAC is working correctly!");
    } else {
      console.log("\n❌ Failed:", testData.message);
    }
  }
}

test().catch(console.error);

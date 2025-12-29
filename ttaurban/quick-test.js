// Quick test - create user and immediately login
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
  console.log("Signup response:", signupData);

  if (signupData.accessToken) {
    console.log("\n✅ Got token from signup!");
    const token = signupData.accessToken;

    // Try to access protected route
    console.log("\n📊 Testing admin stats endpoint...");
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status:", statsRes.status);
    const statsData = await statsRes.json();
    console.log("Response:", statsData);
  }
}

test().catch(console.error);

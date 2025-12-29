// Get Token for Debugging
const BASE_URL = "http://localhost:3000";

async function getToken() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@test.com",
        password: "Admin123!@#",
      }),
    });

    const data = await response.json();

    if (data.accessToken) {
      console.log("✅ Login successful!");
      console.log("\nAccess Token:");
      console.log(data.accessToken);
      console.log("\nUser info:");
      console.log(JSON.stringify(data.user, null, 2));
    } else {
      console.log("❌ Login failed:");
      console.log(data);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

getToken();

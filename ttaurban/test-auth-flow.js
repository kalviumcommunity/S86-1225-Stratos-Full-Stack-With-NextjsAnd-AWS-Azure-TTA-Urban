/**
 * Authentication Flow Test Script
 * Tests login, token refresh, and logout functionality
 *
 * Run with: node test-auth-flow.js
 */

const API_URL = "http://localhost:3000";

// Test credentials
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPassword123",
};

let accessToken = null;
let cookies = [];

/**
 * Helper to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (cookies.length > 0) {
    headers["Cookie"] = cookies.join("; ");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Extract cookies from response
  const setCookieHeader = response.headers.get("set-cookie");
  if (setCookieHeader) {
    const newCookies = setCookieHeader.split(", ");
    newCookies.forEach((cookie) => {
      const [name] = cookie.split("=");
      cookies = cookies.filter((c) => !c.startsWith(name));
      cookies.push(cookie.split(";")[0]);
    });
  }

  const data = await response.json();
  return { response, data };
}

/**
 * Test 1: User Signup
 */
async function testSignup() {
  console.log("\n🧪 Test 1: User Signup");
  console.log("━".repeat(50));

  try {
    const { response, data } = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(testUser),
    });

    if (response.ok && data.success) {
      accessToken = data.accessToken;
      console.log("✅ Signup successful");
      console.log(`   User: ${data.user.name} (${data.user.email})`);
      console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
      console.log(
        `   Refresh Token: ${cookies.find((c) => c.startsWith("refreshToken")) ? "Set in cookie ✓" : "Missing ✗"}`
      );
      return true;
    } else {
      console.log("⚠️  Signup info:", data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Signup failed:", error.message);
    return false;
  }
}

/**
 * Test 2: User Login
 */
async function testLogin() {
  console.log("\n🧪 Test 2: User Login");
  console.log("━".repeat(50));

  // Clear tokens first
  accessToken = null;
  cookies = [];

  try {
    const { response, data } = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (response.ok && data.success) {
      accessToken = data.accessToken;
      console.log("✅ Login successful");
      console.log(`   User: ${data.user.name}`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
      console.log(
        `   Refresh Token: ${cookies.find((c) => c.startsWith("refreshToken")) ? "Set in cookie ✓" : "Missing ✗"}`
      );
      return true;
    } else {
      console.log("❌ Login failed:", data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return false;
  }
}

/**
 * Test 3: Access Protected Route
 */
async function testProtectedRoute() {
  console.log("\n🧪 Test 3: Access Protected Route");
  console.log("━".repeat(50));

  try {
    const { response, data } = await apiRequest("/api/auth/me");

    if (response.ok) {
      console.log("✅ Protected route access successful");
      console.log("   User Data:", data.user);
      return true;
    } else {
      console.log("❌ Protected route failed:", data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Protected route error:", error.message);
    return false;
  }
}

/**
 * Test 4: Token Refresh
 */
async function testTokenRefresh() {
  console.log("\n🧪 Test 4: Token Refresh");
  console.log("━".repeat(50));

  const oldToken = accessToken;

  try {
    const { response, data } = await apiRequest("/api/auth/refresh", {
      method: "POST",
    });

    if (response.ok && data.success) {
      accessToken = data.accessToken;
      console.log("✅ Token refresh successful");
      console.log(`   Old Token: ${oldToken.substring(0, 20)}...`);
      console.log(`   New Token: ${accessToken.substring(0, 20)}...`);
      console.log(
        `   Tokens Different: ${oldToken !== accessToken ? "Yes ✓" : "No ✗"}`
      );
      console.log(
        `   New Refresh Token: ${cookies.find((c) => c.startsWith("refreshToken")) ? "Rotated ✓" : "Missing ✗"}`
      );
      return true;
    } else {
      console.log("❌ Token refresh failed:", data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Token refresh error:", error.message);
    return false;
  }
}

/**
 * Test 5: Access with Refreshed Token
 */
async function testAccessWithRefreshedToken() {
  console.log("\n🧪 Test 5: Access with Refreshed Token");
  console.log("━".repeat(50));

  try {
    const { response, data } = await apiRequest("/api/auth/me");

    if (response.ok) {
      console.log("✅ Access with refreshed token successful");
      console.log(`   User: ${data.user.name}`);
      return true;
    } else {
      console.log("❌ Access failed:", data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Access error:", error.message);
    return false;
  }
}

/**
 * Test 6: Logout
 */
async function testLogout() {
  console.log("\n🧪 Test 6: Logout");
  console.log("━".repeat(50));

  try {
    const { response, data } = await apiRequest("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok && data.success) {
      console.log("✅ Logout successful");
      console.log(
        `   Refresh Token Cleared: ${!cookies.find((c) => c.startsWith("refreshToken")) ? "Yes ✓" : "No ✗"}`
      );

      // Clear local tokens
      accessToken = null;
      cookies = [];

      return true;
    } else {
      console.log("❌ Logout failed:", data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    return false;
  }
}

/**
 * Test 7: Access After Logout (Should Fail)
 */
async function testAccessAfterLogout() {
  console.log("\n🧪 Test 7: Access After Logout (Should Fail)");
  console.log("━".repeat(50));

  try {
    const { response, data } = await apiRequest("/api/auth/me");

    if (!response.ok) {
      console.log("✅ Access correctly denied after logout");
      console.log(`   Error: ${data.message}`);
      return true;
    } else {
      console.log("❌ Security Issue: Access granted after logout!");
      return false;
    }
  } catch (error) {
    console.log("✅ Access correctly denied (error thrown)");
    return true;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("\n");
  console.log("═".repeat(50));
  console.log("🔐 JWT AUTHENTICATION FLOW TEST");
  console.log("═".repeat(50));

  const results = [];

  // Run tests sequentially
  results.push(await testSignup());
  results.push(await testLogin());
  results.push(await testProtectedRoute());
  results.push(await testTokenRefresh());
  results.push(await testAccessWithRefreshedToken());
  results.push(await testLogout());
  results.push(await testAccessAfterLogout());

  // Summary
  console.log("\n");
  console.log("═".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("═".repeat(50));

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${total - passed} ❌`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (passed === total) {
    console.log(
      "🎉 All tests passed! Authentication flow is working correctly.\n"
    );
  } else {
    console.log("⚠️  Some tests failed. Please review the errors above.\n");
  }
}

// Run tests
runTests().catch(console.error);

/**
 * RBAC Testing Script
 * Tests role-based access control functionality
 *
 * Run with: node test-rbac.js
 */

const BASE_URL = "http://localhost:3000";

// Test users with different roles
const testUsers = {
  admin: {
    email: "admin@test.com",
    password: "Admin123!",
    name: "Admin User",
    role: "ADMIN",
  },
  editor: {
    email: "editor@test.com",
    password: "Editor123!",
    name: "Editor User",
    role: "EDITOR",
  },
  viewer: {
    email: "viewer@test.com",
    password: "Viewer123!",
    name: "Viewer User",
    role: "VIEWER",
  },
  user: {
    email: "user@test.com",
    password: "User123!",
    name: "Regular User",
    role: "USER",
  },
};

let testResults = [];

function logTest(name, passed, details) {
  const status = passed ? "✓ PASS" : "✗ FAIL";
  const color = passed ? "\x1b[32m" : "\x1b[31m";
  console.log(`${color}${status}\x1b[0m ${name}`);
  if (details) console.log(`  ${details}`);
  testResults.push({ name, passed, details });
}

async function signup(userData) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { response, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return { response, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function testProtectedRoute(endpoint, method, token, expectedStatus) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return { response, data, status: response.status };
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  console.log("\n🧪 Starting RBAC Tests...\n");

  // Store tokens for each role
  const tokens = {};

  // Test 1-4: Create users with different roles
  console.log("📝 Test Group: User Creation\n");

  for (const [role, userData] of Object.entries(testUsers)) {
    const { response, data, error } = await signup(userData);

    if (error) {
      logTest(`Create ${role} user`, false, `Error: ${error}`);
      continue;
    }

    const success =
      response.status === 201 ||
      response.status === 200 ||
      (response.status === 400 &&
        data.message &&
        data.message.includes("already"));
    logTest(
      `Create ${role} user`,
      success,
      success
        ? response.status === 400
          ? `Already exists: ${userData.email}`
          : `User created with email: ${userData.email}`
        : `Status: ${response.status}`
    );

    if (success && data.accessToken) {
      tokens[role] = data.accessToken;
    }
  }

  console.log("\n🔐 Test Group: Login & Token Generation\n");

  // Test 5-8: Login with each user
  for (const [role, userData] of Object.entries(testUsers)) {
    const { response, data, error } = await login(
      userData.email,
      userData.password
    );

    if (error) {
      logTest(`Login as ${role}`, false, `Error: ${error}`);
      continue;
    }

    const success = response.status === 200 && data.accessToken;
    logTest(
      `Login as ${role}`,
      success,
      success ? "Token received" : `Status: ${response.status}`
    );

    if (success && data.accessToken) {
      tokens[role] = data.accessToken;
    }
  }

  console.log("\n🛡️ Test Group: Permission Checks - Admin Endpoints\n");

  // Test 9: Admin accessing admin stats (should succeed)
  if (tokens.admin) {
    const { response, data } = await testProtectedRoute(
      "/api/admin/stats",
      "GET",
      tokens.admin,
      200
    );
    logTest(
      "Admin accesses admin stats",
      response.status === 200,
      `Status: ${response.status} - ${response.status === 200 ? "Access granted" : "Access denied"}${data && data.message ? " - " + data.message : ""}`
    );
  }

  // Test 10: Editor accessing admin stats (should fail with 403)
  if (tokens.editor) {
    const { response, data } = await testProtectedRoute(
      "/api/admin/stats",
      "GET",
      tokens.editor,
      403
    );
    logTest(
      "Editor accesses admin stats (should be denied)",
      response.status === 403,
      `Status: ${response.status} - ${response.status === 403 ? "Correctly denied" : "Unexpected result"}`
    );
  }

  // Test 11: Viewer accessing admin stats (should fail with 403)
  if (tokens.viewer) {
    const { response, data } = await testProtectedRoute(
      "/api/admin/stats",
      "GET",
      tokens.viewer,
      403
    );
    logTest(
      "Viewer accesses admin stats (should be denied)",
      response.status === 403,
      `Status: ${response.status} - ${response.status === 403 ? "Correctly denied" : "Unexpected result"}`
    );
  }

  console.log("\n📚 Test Group: Permission Checks - User Endpoints\n");

  // Test 12: Admin reading users (should succeed)
  if (tokens.admin) {
    const { response } = await testProtectedRoute(
      "/api/users",
      "GET",
      tokens.admin,
      200
    );
    logTest(
      "Admin reads users list",
      response.status === 200,
      `Status: ${response.status}`
    );
  }

  // Test 13: Editor reading users (should succeed - has READ_USER permission)
  if (tokens.editor) {
    const { response } = await testProtectedRoute(
      "/api/users",
      "GET",
      tokens.editor,
      200
    );
    logTest(
      "Editor reads users list",
      response.status === 200,
      `Status: ${response.status}`
    );
  }

  // Test 14: Viewer reading users (should succeed - has READ_USER permission)
  if (tokens.viewer) {
    const { response } = await testProtectedRoute(
      "/api/users",
      "GET",
      tokens.viewer,
      200
    );
    logTest(
      "Viewer reads users list",
      response.status === 200,
      `Status: ${response.status}`
    );
  }

  // Test 15: User creating a new user (should fail - lacks CREATE_USER permission)
  if (tokens.user) {
    const { response } = await testProtectedRoute(
      "/api/users",
      "POST",
      tokens.user,
      403
    );
    logTest(
      "Regular user creates user (should be denied)",
      response.status === 403,
      `Status: ${response.status}`
    );
  }

  // Test 16: Admin creating a new user (should succeed)
  if (tokens.admin) {
    const { response } = await testProtectedRoute(
      "/api/users",
      "POST",
      tokens.admin,
      201
    );
    const success = response.status === 201 || response.status === 200;
    logTest("Admin creates user", success, `Status: ${response.status}`);
  }

  console.log("\n🔍 Test Group: Auth Context Endpoints\n");

  // Test 17: Get current user info with valid token
  if (tokens.admin) {
    const { response, data } = await testProtectedRoute(
      "/api/auth/me",
      "GET",
      tokens.admin,
      200
    );
    logTest(
      "Get current user info (admin)",
      response.status === 200 && data.data?.role === "ADMIN",
      `Status: ${response.status} - Role: ${data.data?.role}`
    );
  }

  // Test 18: Access protected route without token (should fail)
  const { response } = await testProtectedRoute(
    "/api/auth/me",
    "GET",
    null,
    401
  );
  logTest(
    "Access protected route without token (should be denied)",
    response.status === 401,
    `Status: ${response.status}`
  );

  // Print summary
  console.log("\n📊 Test Summary\n");
  const passed = testResults.filter((r) => r.passed).length;
  const total = testResults.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: \x1b[32m${passed}\x1b[0m`);
  console.log(`Failed: \x1b[31m${total - passed}\x1b[0m`);
  console.log(`Success Rate: ${percentage}%`);

  if (passed === total) {
    console.log("\n🎉 All tests passed!\n");
  } else {
    console.log(
      "\n⚠️ Some tests failed. Check the output above for details.\n"
    );
  }
}

// Run tests
runTests().catch(console.error);

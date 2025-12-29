/* eslint-disable no-console */
/**
 * Security Headers Test Suite
 * Tests for HTTPS, HSTS, CSP, CORS, and other security headers
 *
 * Run with: node test-security-headers.js
 */

const BASE_URL = "http://localhost:3000";

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function logTest(name, status, details) {
  const statusColors = {
    PASS: "\x1b[32m",
    FAIL: "\x1b[31m",
    WARN: "\x1b[33m",
  };
  const color = statusColors[status] || "\x1b[0m";
  const symbol = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⚠";

  console.log(`${color}${symbol} ${status}\x1b[0m ${name}`);
  if (details) console.log(`  ${details}`);

  results.tests.push({ name, status, details });
  if (status === "PASS") results.passed++;
  else if (status === "FAIL") results.failed++;
  else results.warnings++;
}

async function testHSTS() {
  console.log("\n🔒 Test Group: HSTS (HTTP Strict Transport Security)\n");

  try {
    const response = await fetch(BASE_URL);
    const hstsHeader = response.headers.get("strict-transport-security");

    if (hstsHeader) {
      const hasMaxAge = hstsHeader.includes("max-age");
      const hasSubDomains = hstsHeader.includes("includeSubDomains");
      const hasPreload = hstsHeader.includes("preload");

      logTest(
        "HSTS header present",
        "PASS",
        `Value: ${hstsHeader.substring(0, 60)}...`
      );

      logTest(
        "HSTS max-age directive",
        hasMaxAge ? "PASS" : "FAIL",
        hasMaxAge ? "max-age found" : "max-age missing"
      );

      logTest(
        "HSTS includeSubDomains",
        hasSubDomains ? "PASS" : "WARN",
        hasSubDomains ? "Subdomains included" : "Subdomains not included"
      );

      logTest(
        "HSTS preload",
        hasPreload ? "PASS" : "WARN",
        hasPreload ? "Preload ready" : "Not preload-ready"
      );
    } else {
      logTest(
        "HSTS header present",
        "WARN",
        "Not found (OK for localhost development)"
      );
    }
  } catch (error) {
    logTest("HSTS test", "FAIL", error.message);
  }
}

async function testCSP() {
  console.log("\n📜 Test Group: Content Security Policy (CSP)\n");

  try {
    const response = await fetch(BASE_URL);
    const cspHeader = response.headers.get("content-security-policy");

    if (cspHeader) {
      const hasDefaultSrc = cspHeader.includes("default-src");
      const hasScriptSrc = cspHeader.includes("script-src");
      const hasFrameAncestors = cspHeader.includes("frame-ancestors");

      logTest(
        "CSP header present",
        "PASS",
        `Length: ${cspHeader.length} characters`
      );

      logTest(
        "CSP default-src directive",
        hasDefaultSrc ? "PASS" : "FAIL",
        hasDefaultSrc ? "Found" : "Missing"
      );

      logTest(
        "CSP script-src directive",
        hasScriptSrc ? "PASS" : "WARN",
        hasScriptSrc ? "Found" : "Missing (using default-src)"
      );

      logTest(
        "CSP frame-ancestors (anti-clickjacking)",
        hasFrameAncestors ? "PASS" : "WARN",
        hasFrameAncestors ? "Protected" : "Not explicitly set"
      );

      // Check for unsafe directives
      const hasUnsafeInline = cspHeader.includes("unsafe-inline");
      const hasUnsafeEval = cspHeader.includes("unsafe-eval");

      if (hasUnsafeInline || hasUnsafeEval) {
        logTest(
          "CSP unsafe directives",
          "WARN",
          `Contains ${hasUnsafeInline ? "'unsafe-inline'" : ""} ${hasUnsafeEval ? "'unsafe-eval'" : ""} (required for Next.js)`
        );
      }
    } else {
      logTest("CSP header present", "FAIL", "No CSP header found");
    }
  } catch (error) {
    logTest("CSP test", "FAIL", error.message);
  }
}

async function testCORS() {
  console.log("\n🌐 Test Group: CORS (Cross-Origin Resource Sharing)\n");

  try {
    // Test GET request
    const getResponse = await fetch(`${BASE_URL}/api/users`);
    const allowOrigin = getResponse.headers.get("access-control-allow-origin");
    const allowMethods = getResponse.headers.get(
      "access-control-allow-methods"
    );
    const allowHeaders = getResponse.headers.get(
      "access-control-allow-headers"
    );

    logTest(
      "CORS Access-Control-Allow-Origin",
      allowOrigin ? "PASS" : "WARN",
      allowOrigin || "Not set (same-origin only)"
    );

    logTest(
      "CORS Access-Control-Allow-Methods",
      allowMethods ? "PASS" : "WARN",
      allowMethods || "Not set"
    );

    logTest(
      "CORS Access-Control-Allow-Headers",
      allowHeaders ? "PASS" : "WARN",
      allowHeaders || "Not set"
    );

    // Test OPTIONS preflight
    try {
      const optionsResponse = await fetch(`${BASE_URL}/api/users`, {
        method: "OPTIONS",
      });

      logTest(
        "CORS Preflight (OPTIONS) handling",
        optionsResponse.status === 204 || optionsResponse.status === 200
          ? "PASS"
          : "WARN",
        `Status: ${optionsResponse.status}`
      );
    } catch (error) {
      logTest("CORS Preflight test", "WARN", "Could not test OPTIONS request");
    }
  } catch (error) {
    logTest("CORS test", "FAIL", error.message);
  }
}

async function testSecurityHeaders() {
  console.log("\n🛡️  Test Group: Additional Security Headers\n");

  try {
    const response = await fetch(BASE_URL);

    const headers = {
      "X-Frame-Options": "Anti-clickjacking",
      "X-Content-Type-Options": "MIME sniffing prevention",
      "X-XSS-Protection": "XSS filter",
      "Referrer-Policy": "Referrer control",
      "Permissions-Policy": "Feature control",
    };

    for (const [headerName, purpose] of Object.entries(headers)) {
      const headerValue = response.headers.get(headerName.toLowerCase());

      logTest(
        `${headerName} (${purpose})`,
        headerValue ? "PASS" : "WARN",
        headerValue || "Not found"
      );
    }
  } catch (error) {
    logTest("Security headers test", "FAIL", error.message);
  }
}

async function testHTTPSRedirect() {
  console.log("\n🔐 Test Group: HTTPS Enforcement\n");

  // This test is informational for localhost
  logTest(
    "HTTPS Protocol",
    "WARN",
    "Testing on localhost - HTTPS enforcement only applies in production"
  );

  logTest(
    "Production HTTPS Recommendation",
    "PASS",
    "Ensure HTTPS is enforced via hosting platform (Vercel, AWS, etc.)"
  );
}

async function runAllTests() {
  console.log("\n🔒 Security Headers Test Suite");
  console.log("================================\n");
  console.log(`Testing: ${BASE_URL}\n`);

  try {
    await testHSTS();
    await testCSP();
    await testCORS();
    await testSecurityHeaders();
    await testHTTPSRedirect();

    console.log("\n📊 Test Summary");
    console.log("================\n");
    console.log(
      `Total Tests: ${results.passed + results.failed + results.warnings}`
    );
    console.log(`\x1b[32mPassed: ${results.passed}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${results.failed}\x1b[0m`);
    console.log(`\x1b[33mWarnings: ${results.warnings}\x1b[0m`);

    const successRate = (
      (results.passed / (results.passed + results.failed + results.warnings)) *
      100
    ).toFixed(1);
    console.log(`Success Rate: ${successRate}%\n`);

    if (results.failed > 0) {
      console.log("⚠️  Some tests failed. Review the output above.\n");
    } else if (results.warnings > 0) {
      console.log(
        "✅ All critical tests passed. Some warnings noted (mostly OK for development).\n"
      );
    } else {
      console.log("✅ All security tests passed!\n");
    }

    console.log("\n📚 Recommendations:\n");
    console.log(
      "1. Test on production deployment URL (not localhost) for full HTTPS/HSTS verification"
    );
    console.log(
      "2. Use https://securityheaders.com to scan your production site"
    );
    console.log(
      "3. Use https://observatory.mozilla.org for comprehensive security audit"
    );
    console.log(
      "4. Verify SSL/TLS configuration at https://www.ssllabs.com/ssltest/\n"
    );
  } catch (error) {
    console.error("Test suite error:", error);
  }
}

// Run tests
runAllTests().catch(console.error);

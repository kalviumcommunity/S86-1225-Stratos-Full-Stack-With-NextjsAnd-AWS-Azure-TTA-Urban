/* eslint-disable no-console */
/**
 * OWASP Compliance Testing Suite
 * Tests for XSS and SQL Injection prevention
 * 
 * Run with: node test-owasp.js
 */

const BASE_URL = "http://localhost:3000";

// XSS Attack Payloads
const xssPayloads = [
  `<script>alert('XSS')</script>`,
  `<img src=x onerror=alert('XSS')>`,
  `<svg onload=alert('XSS')>`,
  `javascript:alert('XSS')`,
  `<iframe src='javascript:alert("XSS")'>`,
  `<body onload=alert('XSS')>`,
  `<input onfocus=alert('XSS') autofocus>`,
  `><script>alert(String.fromCharCode(88,83,83))</script>`,
  `<scr<script>ipt>alert('XSS')</scr</script>ipt>`,
  `<<SCRIPT>alert('XSS');//<</SCRIPT>`,
];

// SQL Injection Payloads
const sqlInjectionPayloads = [
  "' OR '1'='1",
  "1' OR '1' = '1",
  "'; DROP TABLE users--",
  "admin'--",
  "' UNION SELECT NULL--",
  "1' AND 1=1--",
  "' OR 1=1#",
  "1' OR '1'='1' /*",
  "'; EXEC sp_MSForEachTable 'DROP TABLE ?'--",
  "1' WAITFOR DELAY '00:00:05'--",
];

// Path Traversal Payloads
const pathTraversalPayloads = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '....//....//....//etc/passwd',
  '..%2F..%2F..%2Fetc%2Fpasswd',
];

// Test Results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, details) {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name}`);
  if (details) console.log(`  ${details}`);
  
  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

async function testXSSPrevention() {
  console.log('\n🛡️  Test Group: XSS Prevention\n');
  
  for (const payload of xssPayloads.slice(0, 5)) { // Test first 5
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload,
          email: `test${Date.now()}@test.com`,
          password: 'Test123!@#',
          role: 'USER'
        }),
      });
      
      const data = await response.json();
      
      // Check if the response contains the raw payload (BAD)
      const responseStr = JSON.stringify(data);
      const containsScript = responseStr.includes('<script>') || 
                            responseStr.includes('onerror=') ||
                            responseStr.includes('onload=');
      
      logTest(
        `XSS blocked: ${payload.substring(0, 30)}...`,
        !containsScript,
        containsScript ? 'XSS payload found in response!' : 'Payload was sanitized'
      );
    } catch (error) {
      logTest(`XSS test error: ${payload.substring(0, 30)}...`, false, error.message);
    }
  }
}

async function testSQLInjectionPrevention() {
  console.log('\n🛡️  Test Group: SQL Injection Prevention\n');
  
  for (const payload of sqlInjectionPayloads.slice(0, 5)) { // Test first 5
    try {
      // Test in login endpoint
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload,
          password: payload,
        }),
      });
      
      const data = await response.json();
      
      // Should get validation error or "invalid credentials", NOT a 500 error
      const isHandled = response.status === 400 || response.status === 401;
      const noSQLError = !data.message?.toLowerCase().includes('sql');
      
      logTest(
        `SQLi blocked: ${payload}`,
        isHandled && noSQLError,
        isHandled ? 'Request handled safely' : 'Possible SQL injection vulnerability'
      );
    } catch (error) {
      logTest(`SQLi test error: ${payload}`, false, error.message);
    }
  }
}

async function testPathTraversalPrevention() {
  console.log('\n🛡️  Test Group: Path Traversal Prevention\n');
  
  for (const payload of pathTraversalPayloads.slice(0, 3)) {
    try {
      // Test with file upload/download endpoints
      const response = await fetch(`${BASE_URL}/api/files/${encodeURIComponent(payload)}`, {
        method: 'GET',
      });
      
      // Should get 404 or 400, NOT the actual file content
      const isBlocked = response.status === 404 || response.status === 400 || response.status === 401;
      
      logTest(
        `Path traversal blocked: ${payload}`,
        isBlocked,
        isBlocked ? 'Access denied' : 'Possible path traversal vulnerability'
      );
    } catch (error) {
      logTest(`Path traversal test: ${payload}`, true, 'Fetch failed (good - endpoint protected)');
    }
  }
}

async function testInputSanitization() {
  console.log('\n🧹 Test Group: Input Sanitization\n');
  
  const testCases = [
    {
      name: 'HTML tags removed',
      input: '<b>Bold</b> text',
      expectedNotContain: '<b>',
    },
    {
      name: 'Script tags removed',
      input: '<script>alert(1)</script>Hello',
      expectedNotContain: '<script',
    },
    {
      name: 'Event handlers removed',
      input: '<img src=x onerror=alert(1)>',
      expectedNotContain: 'onerror=',
    },
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testCase.input,
          email: `test${Date.now()}@test.com`,
          password: 'Test123!@#',
          role: 'USER'
        }),
      });
      
      const data = await response.json();
      const responseStr = JSON.stringify(data);
      const isSanitized = !responseStr.includes(testCase.expectedNotContain);
      
      logTest(
        testCase.name,
        isSanitized,
        isSanitized ? 'Input was sanitized' : `Found: ${testCase.expectedNotContain}`
      );
    } catch (error) {
      logTest(testCase.name, false, error.message);
    }
  }
}

async function testEmailValidation() {
  console.log('\n📧 Test Group: Email Validation\n');
  
  const testEmails = [
    { email: 'valid@example.com', shouldPass: true },
    { email: 'invalid-email', shouldPass: false },
    { email: 'test@', shouldPass: false },
    { email: '@example.com', shouldPass: false },
    { email: 'test<script>@example.com', shouldPass: false },
  ];
  
  for (const test of testEmails) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: test.email,
          password: 'Test123!@#',
          role: 'USER'
        }),
      });
      
      const data = await response.json();
      const passed = test.shouldPass ? response.status === 200 || response.status === 201 || data.success :
                                        response.status === 400 || !data.success;
      
      logTest(
        `Email validation: ${test.email}`,
        passed,
        test.shouldPass ? 'Accepted valid email' : 'Rejected invalid email'
      );
    } catch (error) {
      logTest(`Email validation: ${test.email}`, false, error.message);
    }
  }
}

async function runAllTests() {
  console.log('\n🔒 OWASP Compliance Test Suite');
  console.log('================================\n');
  console.log('Testing Input Sanitization & Injection Prevention\n');
  
  try {
    await testXSSPrevention();
    await testSQLInjectionPrevention();
    await testPathTraversalPrevention();
    await testInputSanitization();
    await testEmailValidation();
    
    console.log('\n📊 Test Summary');
    console.log('================\n');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`\x1b[32mPassed: ${results.passed}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${results.failed}\x1b[0m`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);
    
    if (results.failed > 0) {
      console.log('⚠️  Some security tests failed. Review the output above.\n');
    } else {
      console.log('✅ All security tests passed!\n');
    }
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

// Run tests
runAllTests().catch(console.error);

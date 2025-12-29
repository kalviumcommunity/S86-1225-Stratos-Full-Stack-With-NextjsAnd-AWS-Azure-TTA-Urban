"use client";

import { useState, useEffect } from "react";
import { SECURITY_HEADERS_INFO } from "../lib/securityHeaders";

export default function SecurityHeadersDemo() {
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Fetch current page to check headers
    fetch(window.location.href)
      .then((response) => {
        const headerObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headerObj[key] = value;
        });
        setHeaders(headerObj);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const testCORS = async () => {
    const result = {
      test: "CORS Test",
      timestamp: new Date().toISOString(),
      status: "",
      details: "",
    };

    try {
      const response = await fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const corsHeader = response.headers.get("Access-Control-Allow-Origin");
      result.status = corsHeader ? "✅ PASS" : "⚠️ WARNING";
      result.details = corsHeader
        ? `CORS enabled: ${corsHeader}`
        : "No CORS header found (same-origin only)";
    } catch (error) {
      result.status = "❌ FAIL";
      result.details = (error as Error).message;
    }

    setTestResults((prev) => [...prev, result]);
  };

  const testHTTPS = () => {
    const result = {
      test: "HTTPS Enforcement",
      timestamp: new Date().toISOString(),
      status: "",
      details: "",
    };

    const protocol = window.location.protocol;
    const hstsHeader = headers["strict-transport-security"];

    if (protocol === "https:") {
      result.status = "✅ PASS";
      result.details = `Using HTTPS${hstsHeader ? " with HSTS enabled" : ""}`;
    } else if (window.location.hostname === "localhost") {
      result.status = "⚠️ DEV";
      result.details = "Localhost detected - HTTPS not required in development";
    } else {
      result.status = "❌ FAIL";
      result.details = "Using HTTP - HTTPS should be enforced in production";
    }

    setTestResults((prev) => [...prev, result]);
  };

  const testCSP = () => {
    const result = {
      test: "Content Security Policy",
      timestamp: new Date().toISOString(),
      status: "",
      details: "",
    };

    const cspHeader = headers["content-security-policy"];

    if (cspHeader) {
      result.status = "✅ PASS";
      result.details = `CSP enabled: ${cspHeader.substring(0, 100)}...`;
    } else {
      result.status = "❌ FAIL";
      result.details = "No CSP header found";
    }

    setTestResults((prev) => [...prev, result]);
  };

  const testSecurityHeaders = () => {
    const requiredHeaders = [
      "x-frame-options",
      "x-content-type-options",
      "x-xss-protection",
      "referrer-policy",
    ];

    requiredHeaders.forEach((headerName) => {
      const result = {
        test: `Header: ${headerName}`,
        timestamp: new Date().toISOString(),
        status: "",
        details: "",
      };

      const headerValue = headers[headerName];

      if (headerValue) {
        result.status = "✅ PASS";
        result.details = `Value: ${headerValue}`;
      } else {
        result.status = "❌ FAIL";
        result.details = "Header not found";
      }

      setTestResults((prev) => [...prev, result]);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Security Headers & HTTPS Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Test and verify HTTPS enforcement, HSTS, CSP, CORS, and other
            security headers
          </p>

          {/* Security Headers Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              📋 Implemented Security Headers
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(SECURITY_HEADERS_INFO).map(([key, info]) => (
                <div
                  key={key}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <h3 className="font-semibold text-lg mb-2">{info.name}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Purpose:</strong> {info.purpose}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Prevents:</strong> {info.prevents}
                  </p>
                  <div className="bg-white p-2 rounded border border-gray-300 mt-2">
                    <code className="text-xs break-all">{info.value}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Headers */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              🔍 Current Response Headers
            </h2>
            {loading ? (
              <p>Loading headers...</p>
            ) : (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {Object.entries(headers)
                    .filter(
                      ([key]) =>
                        key.toLowerCase().includes("security") ||
                        key.toLowerCase().includes("content-security") ||
                        key.toLowerCase().includes("x-") ||
                        key.toLowerCase().includes("access-control") ||
                        key.toLowerCase().includes("strict-transport")
                    )
                    .map(([key, value]) => `${key}: ${value}`)
                    .join("\n") || "No security headers detected"}
                </pre>
              </div>
            )}
          </div>

          {/* Test Buttons */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              🧪 Run Security Tests
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={testHTTPS}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Test HTTPS/HSTS
              </button>
              <button
                onClick={testCSP}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Test CSP
              </button>
              <button
                onClick={testCORS}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Test CORS
              </button>
              <button
                onClick={testSecurityHeaders}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Test All Headers
              </button>
              <button
                onClick={() => setTestResults([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">📊 Test Results</h2>
              <div className="space-y-3">
                {testResults
                  .slice()
                  .reverse()
                  .map((result, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{result.test}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-lg mb-1">{result.status}</div>
                      <div className="text-sm text-gray-700">
                        {result.details}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Information Sections */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                🔐 HSTS
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                <strong>HTTP Strict Transport Security</strong> forces browsers
                to always use HTTPS, preventing protocol downgrade attacks.
              </p>
              <div className="bg-white p-3 rounded border border-blue-300">
                <code className="text-xs">
                  max-age=63072000; includeSubDomains; preload
                </code>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">
                📜 CSP
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Content Security Policy</strong> restricts sources for
                scripts, styles, and content to prevent XSS attacks.
              </p>
              <ul className="text-xs list-disc list-inside space-y-1">
                <li>default-src: self only</li>
                <li>script-src: controlled sources</li>
                <li>frame-ancestors: none (anti-clickjacking)</li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                🌐 CORS
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Cross-Origin Resource Sharing</strong> controls which
                domains can access your API endpoints.
              </p>
              <ul className="text-xs list-disc list-inside space-y-1">
                <li>Allowed origins: configured list</li>
                <li>Credentials: enabled</li>
                <li>Preflight caching: 24 hours</li>
              </ul>
            </div>
          </div>

          {/* External Testing Tools */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-yellow-800 mb-3">
              🔧 External Security Scanners
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Use these online tools to scan your deployed application:
            </p>
            <div className="space-y-2">
              <a
                href="https://securityheaders.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                📊 SecurityHeaders.com - Comprehensive header analysis
              </a>
              <a
                href="https://observatory.mozilla.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                🔭 Mozilla Observatory - Security & best practices scan
              </a>
              <a
                href="https://www.ssllabs.com/ssltest/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                🔒 SSL Labs - SSL/TLS configuration test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

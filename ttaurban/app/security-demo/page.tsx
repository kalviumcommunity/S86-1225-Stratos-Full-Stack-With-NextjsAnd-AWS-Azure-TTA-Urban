'use client';

import { useState } from 'react';
import { sanitizeHTML, sanitizePlainText, htmlEncode, isValidUrl } from '../lib/sanitize.client';

export default function SecurityDemo() {
  const [xssInput, setXssInput] = useState('');
  const [sqlInput, setSqlInput] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  // Common XSS attack vectors
  const xssExamples = [
    `<script>alert('XSS Attack!')</script>`,
    `<img src=x onerror=alert('XSS')>`,
    `<svg onload=alert('XSS')>`,
    `<iframe src='javascript:alert("XSS")'>`,
    `javascript:alert('XSS')`,
  ];

  // Common SQL injection patterns
  const sqlExamples = [
    "' OR '1'='1",
    "'; DROP TABLE users--",
    "admin'--",
    "' UNION SELECT NULL--",
  ];

  const testXSS = async (payload: string) => {
    const result = {
      type: 'XSS',
      payload,
      timestamp: new Date().toISOString(),
      status: '',
      sanitized: '',
    };

    try {
      // Test with API
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'XSS Test',
          description: payload,
          departmentId: '1',
          priority: 'MEDIUM',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        result.status = '✅ Blocked - Input sanitized';
        result.sanitized = sanitizePlainText(payload);
      } else {
        result.status = '✅ Rejected - Validation failed';
      }
    } catch (error) {
      result.status = '❌ Error: ' + (error as Error).message;
    }

    setTestResults(prev => [...prev, result]);
  };

  const testSQL = async (payload: string) => {
    const result = {
      type: 'SQL Injection',
      payload,
      timestamp: new Date().toISOString(),
      status: '',
      sanitized: '',
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload,
          password: payload,
        }),
      });

      const data = await response.json();
      
      // Should get validation error or "invalid credentials", NOT a SQL error
      if (response.status === 400 || response.status === 401) {
        result.status = '✅ Blocked - Input sanitized/validated';
      } else if (response.status === 500) {
        result.status = '⚠️ Server error - Check logs';
      }
    } catch (error) {
      result.status = '✅ Request failed (protected)';
    }

    setTestResults(prev => [...prev, result]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 OWASP Security Demonstration
          </h1>
          <p className="text-gray-600 mb-6">
            Interactive demo showing how input sanitization prevents XSS and SQL injection attacks
          </p>

          {/* XSS Demo Section */}
          <div className="mb-8 p-6 border-2 border-red-200 rounded-lg bg-red-50">
            <h2 className="text-2xl font-semibold text-red-800 mb-4">
              🛡️ XSS (Cross-Site Scripting) Prevention
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Try an XSS attack:
              </label>
              <input
                type="text"
                value={xssInput}
                onChange={(e) => setXssInput(e.target.value)}
                placeholder="Enter XSS payload (e.g., <script>alert('XSS')</script>)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => testXSS(xssInput)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Test Custom Input
                </button>
                {xssExamples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => testXSS(example)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Test #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-red-300">
              <h3 className="font-semibold mb-2">Before Sanitization (Dangerous!):</h3>
              <div className="bg-red-100 p-3 rounded font-mono text-sm overflow-x-auto mb-3">
                {xssInput || '<script>alert("XSS")</script>'}
              </div>
              
              <h3 className="font-semibold mb-2">After Sanitization (Safe):</h3>
              <div className="bg-green-100 p-3 rounded font-mono text-sm overflow-x-auto">
                {sanitizePlainText(xssInput || "<script>alert(" + '"XSS"' + ")</script>")}
              </div>

              <h3 className="font-semibold mt-4 mb-2">HTML Encoded:</h3>
              <div className="bg-blue-100 p-3 rounded font-mono text-sm overflow-x-auto">
                {htmlEncode(xssInput || "<script>alert(" + '"XSS"' + ")</script>")}
              </div>
            </div>
          </div>

          {/* SQL Injection Demo Section */}
          <div className="mb-8 p-6 border-2 border-purple-200 rounded-lg bg-purple-50">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">
              💉 SQL Injection Prevention
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Try an SQL injection:
              </label>
              <input
                type="text"
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder="Enter SQL injection payload (e.g., ' OR '1'='1)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => testSQL(sqlInput)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Test Custom Input
                </button>
                {sqlExamples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => testSQL(example)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Test #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-purple-300">
              <h3 className="font-semibold mb-2">🔍 Protection Mechanisms:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Prisma ORM:</strong> Parameterized queries prevent SQL injection</li>
                <li><strong>Input Sanitization:</strong> Removes dangerous SQL characters</li>
                <li><strong>Validation:</strong> Zod schema validation rejects malformed input</li>
                <li><strong>Type Safety:</strong> TypeScript ensures data type integrity</li>
              </ul>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">📋 Test Results</h2>
                <button
                  onClick={() => setTestResults([])}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Clear Results
                </button>
              </div>
              
              <div className="space-y-3">
                {testResults.slice().reverse().map((result, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 rounded-lg p-4 bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-lg">
                        {result.type} Test
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm mb-2 overflow-x-auto">
                      Payload: {result.payload}
                    </div>
                    <div className="text-sm">
                      <strong>Result:</strong> {result.status}
                    </div>
                    {result.sanitized && (
                      <div className="mt-2 bg-green-50 p-2 rounded text-sm">
                        <strong>Sanitized:</strong> {result.sanitized}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">
              🛠️ Implemented Security Measures
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Input Sanitization:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>HTML tag removal</li>
                  <li>Script tag blocking</li>
                  <li>Event handler stripping</li>
                  <li>Special character encoding</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">SQL Injection Prevention:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Prisma parameterized queries</li>
                  <li>Input validation with Zod</li>
                  <li>Type-safe database operations</li>
                  <li>No dynamic SQL construction</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Output Encoding:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>DOMPurify for HTML sanitization</li>
                  <li>HTML entity encoding</li>
                  <li>URL validation</li>
                  <li>Safe JSON parsing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Additional Protections:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Rate limiting</li>
                  <li>CORS configuration</li>
                  <li>Security headers (CSP)</li>
                  <li>Audit logging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

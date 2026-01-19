import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 
        (process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id') ? 
          '❌ PLACEHOLDER - NOT CONFIGURED' : 
          '✅ SET') : 
        '❌ NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 
        (process.env.GOOGLE_CLIENT_SECRET.includes('your-google-client-secret') ? 
          '❌ PLACEHOLDER - NOT CONFIGURED' : 
          '✅ SET') : 
        '❌ NOT SET',
    },
    googleOAuth: {
      configured: false,
      clientIdValid: false,
      clientSecretValid: false,
      callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
    },
    recommendations: [] as string[],
  };

  // Check if Google OAuth is properly configured
  if (process.env.GOOGLE_CLIENT_ID && 
      !process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id') &&
      process.env.GOOGLE_CLIENT_ID.length > 20) {
    checks.googleOAuth.clientIdValid = true;
  } else {
    checks.recommendations.push('Update GOOGLE_CLIENT_ID in .env.local with your actual Google OAuth Client ID');
  }

  if (process.env.GOOGLE_CLIENT_SECRET && 
      !process.env.GOOGLE_CLIENT_SECRET.includes('your-google-client-secret') &&
      process.env.GOOGLE_CLIENT_SECRET.length > 20) {
    checks.googleOAuth.clientSecretValid = true;
  } else {
    checks.recommendations.push('Update GOOGLE_CLIENT_SECRET in .env.local with your actual Google OAuth Client Secret');
  }

  checks.googleOAuth.configured = checks.googleOAuth.clientIdValid && checks.googleOAuth.clientSecretValid;

  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.includes('change-this')) {
    checks.recommendations.push('Generate a secure NEXTAUTH_SECRET using: openssl rand -base64 32');
  }

  if (!process.env.NEXTAUTH_URL) {
    checks.recommendations.push('Set NEXTAUTH_URL in .env.local (e.g., http://localhost:3000)');
  }

  const status = checks.googleOAuth.configured ? 'ready' : 'not-configured';

  return NextResponse.json({
    status,
    message: checks.googleOAuth.configured 
      ? '✅ Google OAuth is properly configured!' 
      : '❌ Google OAuth needs configuration. Follow SETUP_GOOGLE_NOW.md',
    checks,
  }, { 
    status: checks.googleOAuth.configured ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}

# 🚀 Google OAuth - Quick Start (2 Minutes)

## ⚠️ MUST DO THIS NOW!

Your Google OAuth won't work until you complete these steps:

---

## 📝 What You Need

1. A Google account
2. 5 minutes of time

---

## 🎯 Quick Steps

### 1. Open Google Cloud Console
👉 [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 2. Create OAuth Credentials
```
1. Click "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure consent screen:
   - Choose "External"
   - Fill in app name: "TTA-Urban"
   - Add your email
   - Click "Save and Continue" 3 times
4. Back to "Create OAuth client ID":
   - Application type: "Web application"
   - Name: "TTA-Urban Web Client"
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
5. Click "CREATE"
```

### 3. Copy Your Credentials
You'll see a popup with:
- **Client ID** - Long string ending with `.apps.googleusercontent.com`
- **Client Secret** - Starts with `GOCSPX-`

### 4. Update .env.local
Open `tta-urban/.env.local` and replace these two lines:

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

### 5. Restart Server
```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

### 6. Test It!
1. Go to: http://localhost:3000/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. ✅ You should be logged in!

---

## ✅ Verify Setup

Check if it's configured correctly:
```
http://localhost:3000/api/auth/check-oauth
```

Should show: `✅ Google OAuth is properly configured!`

---

## ❌ Troubleshooting

**"redirect_uri_mismatch"**
→ Make sure redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`

**"invalid_client"**
→ Double-check Client ID and Secret in `.env.local` (no extra spaces!)

**Button does nothing**
→ Check browser console (F12), restart dev server

---

## 📌 Important Notes

- Use the **SAME** credentials for both development and testing
- Don't share your Client Secret
- Restart server after changing `.env.local`

---

## 🎉 That's It!

You're done! Google OAuth should now work perfectly.

For detailed explanations, see:
- [GOOGLE_OAUTH_FIXES.md](./GOOGLE_OAUTH_FIXES.md) - Complete fix summary
- [SETUP_GOOGLE_NOW.md](./SETUP_GOOGLE_NOW.md) - Detailed setup guide

# 🚀 Quick Setup Guide for Google OAuth

## ⚠️ IMPORTANT: You MUST complete this setup for "Continue with Google" to work!

### Current Status: ❌ NOT CONFIGURED

Your Google OAuth is currently using **placeholder credentials** and will NOT work until you complete these steps.

---

## Step-by-Step Setup (5 minutes)

### 1️⃣ Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** → Name it **"TTA-Urban"** → Click **"Create"**

### 2️⃣ Configure OAuth Consent Screen

1. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** → Click **"Create"**
3. Fill in:
   - **App name**: `TTA-Urban`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"** through all steps

### 3️⃣ Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → Select **"OAuth client ID"**
3. Choose **"Web application"**
4. Configure:
   - **Name**: `TTA-Urban Web Client`
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
5. Click **"Create"**

### 4️⃣ Copy Your Credentials

You'll see a popup with:
- **Client ID** (looks like: `123456789-abc...xyz.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc...xyz`)

### 5️⃣ Update Your .env.local File

Open `.env.local` and replace these lines:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret-here
```

With your actual credentials:

```env
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc...xyz
```

### 6️⃣ Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verification

After setup, test Google OAuth:

1. Go to `http://localhost:3000/login`
2. Click **"Continue with Google"**
3. You should see Google sign-in popup
4. After signing in, you'll be redirected to your dashboard

---

## 🔧 Troubleshooting

### "Error: redirect_uri_mismatch"
- Check that your redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Make sure there are no trailing slashes

### "Error: invalid_client"
- Verify your Client ID and Secret are correct
- Check for extra spaces or quotes in `.env.local`

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen setup
- Add your email as a test user in Google Cloud Console

### Google button does nothing
- Check browser console for errors
- Verify `NEXTAUTH_URL=http://localhost:3000` in `.env.local`
- Restart your dev server

---

## 📚 Additional Resources

- Full setup guide: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- Need help? Check the logs in your terminal

---

## 🔒 Production Deployment

When deploying to production:

1. Add your production domain to **Authorized JavaScript origins**
2. Add `https://yourdomain.com/api/auth/callback/google` to **Authorized redirect URIs**
3. Update `.env` on your production server with the same credentials
4. Change `NEXTAUTH_URL` to your production URL
5. Generate a new `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

---

**Remember**: Keep your `GOOGLE_CLIENT_SECRET` private! Never commit it to version control.

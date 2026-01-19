# TTA Urban Grievance Management System

A comprehensive complaint management system built with Next.js, MongoDB, and NextAuth for efficient urban grievance handling.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- Gmail account (for email features)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Features](#features)
3. [User Roles](#user-roles)
4. [Environment Setup](#environment-setup)
5. [Email Configuration](#email-configuration)
6. [Google OAuth Setup](#google-oauth-setup)
7. [SLA Warning System](#sla-warning-system)
8. [Feedback System](#feedback-system)
9. [API Reference](#api-reference)
10. [Deployment](#deployment)

---

## 📖 System Overview

TTA-Urban is a modern grievance management platform that enables:
- **Citizens** to submit and track complaints
- **Officers** to manage and resolve assigned complaints
- **Admins** to oversee operations, assign complaints, and monitor performance

### Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (Credentials + Google OAuth)
- **File Upload**: Cloudinary
- **Maps**: Leaflet.js
- **Email**: Nodemailer

---

## ✨ Features

### For Citizens
- 📝 Submit complaints with images and location
- 🔍 Track complaint status in real-time
- 📍 View complaints on interactive map
- ⭐ Rate officer performance after resolution
- 🔔 Receive notifications on status updates
- 🔐 Secure authentication (Email/Password or Google)

### For Officers
- 📊 Dashboard with performance metrics
- 📋 View assigned complaints
- ✅ Update complaint status
- 📸 Upload resolution proof
- ⏰ SLA deadline tracking
- 🔔 Deadline warning notifications
- 📈 View personal feedback ratings

### For Admins
- 👥 User management (activate/deactivate)
- 🎯 Assign complaints to officers
- 📊 Analytics dashboard
- 📜 Audit logs
- 🔧 SLA configuration
- 👀 Monitor officer performance
- 📈 View system-wide statistics

---

## 👤 User Roles

| Role | Capabilities |
|------|-------------|
| **Citizen** | Submit complaints, track status, provide feedback |
| **Officer** | View assigned complaints, update status, resolve issues |
| **Admin** | Full system access, user management, assignments, analytics |

**Note**: Roles are fixed at registration and cannot be changed later.

---

## 🔧 Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tta-urban

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=TTA-Urban

# SLA Cron (Optional - for production)
CRON_SECRET=your-cron-secret-key
```

---

## 📧 Email Configuration

Email is required for password reset functionality.

### Option 1: Gmail (Recommended for Development)

**Step 1: Enable 2-Factor Authentication**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

**Step 2: Generate App Password**
1. Visit https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (Custom name)"
3. Enter "TTA-Urban" and click Generate
4. Copy the 16-character password

**Step 3: Update .env.local**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char app password
EMAIL_FROM=your-email@gmail.com
```

### Option 2: SendGrid (Production)

1. Sign up at https://signup.sendgrid.com/
2. Create API Key
3. Update .env.local:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=verified-sender@yourdomain.com
```

---

## 🔐 Google OAuth Setup

Enable "Sign in with Google" functionality.

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create a new project "TTA-Urban"
3. Enable Google+ API

### Step 2: Create OAuth Credentials

1. Navigate to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure OAuth consent screen:
   - User Type: External
   - App name: TTA-Urban
   - Support email: your-email@gmail.com
   - Authorized domains: localhost (for dev)
4. Create OAuth Client ID:
   - Application type: Web application
   - Name: TTA-Urban Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`

### Step 3: Add to .env.local

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Testing

1. Restart dev server: `npm run dev`
2. Go to login page
3. Click "Sign in with Google"
4. Select your Google account

---

## ⏰ SLA Warning System

Automatically notifies officers when complaint deadlines are approaching or breached.

### How It Works

**SLA Deadlines** (Set when complaint is created):
- Electricity: 12 hours
- Water Supply: 24 hours
- Street Lighting: 24 hours
- Garbage Collection: 48 hours
- Road & Infrastructure: 72 hours
- Drainage: 48 hours
- Other: 72 hours

**Notification Types**:
1. **⚠️ Warning (1 hour before deadline)**: "Your complaint has 45 minutes remaining before SLA deadline"
2. **🚨 Breach (after deadline)**: "Complaint SLA deadline has been breached by 12 hours"

### Setup for Production

The system needs a cron job to run every 30 minutes.

**Option 1: cron-job.org (Free)**
1. Sign up at https://cron-job.org
2. Create new cron job:
   - Title: SLA Warning Check
   - URL: `https://your-domain.com/api/cron/sla-check`
   - Schedule: Every 30 minutes
   - Enable: ✅

**Option 2: Vercel Cron**

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sla-check",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

**Option 3: Manual Trigger (Testing)**

Admins can manually trigger SLA check:
```bash
curl -X POST http://localhost:3000/api/admin/sla-check
```

### API Endpoints

- `/api/cron/sla-check` - Automated cron endpoint
- `/api/admin/sla-check` - Manual admin trigger

---

## ⭐ Feedback System

Citizens can rate officers after complaints are resolved.

### Rules

✅ **Allowed**:
- Only the complaint owner (citizen)
- Only after status = RESOLVED
- One feedback per complaint
- Rating: 1-5 stars
- Optional comment

❌ **Not Allowed**:
- Feedback on pending complaints
- Multiple feedbacks for same complaint
- Officers or admins giving feedback
- Public/anonymous feedback

### Workflow

```
NEW → ASSIGNED → IN_PROGRESS → RESOLVED 
  → Citizen submits feedback → CLOSED
```

### Features

**For Citizens**:
- Rate officer performance (1-5 stars)
- Add comments about service quality
- Auto-closes complaint after feedback

**For Officers**:
- View average rating on dashboard
- See rating distribution
- Anonymous feedback (identity hidden)
- View total feedback count

**For Admins**:
- View officer feedback statistics
- Monitor service quality
- Identify top/bottom performers
- Access individual feedback comments

### API Endpoints

```
POST /api/complaints/[id]/feedback     # Submit feedback
GET  /api/complaints/[id]/feedback     # Get feedback
GET  /api/officer/feedback             # Officer stats
GET  /api/admin/feedback               # Admin view
```

---

## 🔌 API Reference

### Authentication

```
POST /api/auth/register              # Register new user
POST /api/auth/forgot-password       # Request password reset
POST /api/auth/reset-password        # Reset password with token
GET  /api/auth/check-oauth          # Check OAuth status
```

### Complaints

```
GET    /api/complaints              # List complaints (filtered by role)
POST   /api/complaints              # Create new complaint
GET    /api/complaints/[id]         # Get complaint details
PATCH  /api/complaints/[id]         # Update complaint status
POST   /api/complaints/[id]/feedback # Submit feedback
```

### Officer

```
GET    /api/officer/dashboard       # Officer stats
GET    /api/officer/complaints      # List assigned complaints
PATCH  /api/officer/complaints/[id] # Update complaint
GET    /api/officer/feedback        # Performance stats
```

### Admin

```
GET    /api/admin/dashboard         # System analytics
GET    /api/admin/users             # User management
PATCH  /api/admin/users             # Update user status
PATCH  /api/admin/complaints        # Assign complaints
GET    /api/admin/audit-logs        # Audit trail
GET    /api/admin/feedback          # All feedback
POST   /api/admin/sla-check         # Manual SLA check
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
vercel --prod
```

### Environment Variables for Production

Add all variables from `.env.local` to Vercel dashboard:
- MongoDB URI (production database)
- NEXTAUTH_URL (your production URL)
- Email credentials
- Google OAuth credentials (update redirect URIs)
- Cloudinary credentials

### Post-Deployment

1. Update Google OAuth redirect URIs to production URL
2. Set up cron job for SLA warnings
3. Test email functionality
4. Monitor logs for errors

---

## 📊 Database Schema

### Collections

- **users** - User accounts (citizens, officers, admins)
- **complaints** - Complaint records
- **feedbacks** - Officer ratings
- **notifications** - User notifications
- **auditlogs** - System audit trail
- **departments** - Department list

### Indexes

Recommended indexes for performance:
```javascript
complaints: { assignedTo: 1, status: 1 }
complaints: { slaDeadline: 1, status: 1 }
feedbacks: { officerId: 1 }
notifications: { userId: 1, isRead: 1 }
```

---

## 🛠️ Development

### Project Structure

```
tta-urban/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (auth)/       # Auth pages
│   │   ├── (dashboard)/  # Dashboard pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   ├── models/           # MongoDB models
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
├── public/               # Static assets
└── .env.local           # Environment variables
```

### Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
npm run lint         # Run ESLint
```

### Adding a New Feature

1. Create model in `src/models/`
2. Create service in `src/services/`
3. Add API route in `src/app/api/`
4. Create UI components in `src/components/`
5. Add page in `src/app/`

---

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for session management
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- Rate limiting (recommended for production)
- Audit logging for sensitive operations

---

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Database Connection Failed**
- Check MongoDB URI in .env.local
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

**Email Not Sending**
- Verify Gmail app password
- Check EMAIL_* variables
- Test with `curl` to SMTP server

**Google OAuth Not Working**
- Verify redirect URIs match exactly
- Check OAuth consent screen status
- Clear browser cookies

---

## 📝 License

This project is for educational purposes.

---

## 🤝 Support

For issues and questions:
1. Check this documentation
2. Review error logs
3. Check MongoDB connection
4. Verify environment variables

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [NextAuth.js](https://next-auth.js.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/documentation)

---

**Last Updated**: January 18, 2026
**Version**: 1.0.0

# SLA Warning System Setup Guide

## Overview
The system now automatically notifies officers when their complaint SLA deadlines are approaching (1 hour before deadline) and when they are breached.

## Features

### 1. **SLA Deadline Warnings (1 Hour Before)**
- Officers receive an alert notification 1 hour before the SLA deadline
- Notification includes:
  - Complaint ID and title
  - Remaining time in minutes
  - Alert type: ⚠️ warning

### 2. **SLA Breach Notifications**
- Daily notifications for complaints with breached SLAs
- Notification includes:
  - Complaint ID and title
  - How many hours overdue
  - Alert type: 🚨 critical

### 3. **Assignment Notifications**
- When a complaint is assigned to an officer
- Includes the SLA deadline date and time

## Setup Instructions

### Option 1: Using Free Cron Services (Recommended for Production)

#### Using cron-job.org (Free)

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Create a new cron job with:
   - **Title**: "SLA Warning Check"
   - **URL**: `https://your-domain.com/api/cron/sla-check`
   - **Schedule**: Every 30 minutes
   - **Enable**: ✅

#### Using EasyCron (Free)

1. Go to [easycron.com](https://www.easycron.com)
2. Create a free account
3. Create a new cron job:
   - **URL**: `https://your-domain.com/api/cron/sla-check`
   - **Cron Expression**: `*/30 * * * *` (every 30 minutes)
   - **Enable**: ✅

#### Using Vercel Cron (For Vercel Deployments)

1. Add to your `vercel.json`:

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

2. Deploy to Vercel - the cron job will run automatically

### Option 2: Manual Testing (Development)

As an admin user, you can manually trigger the SLA check:

**Using the API:**
```bash
# Login first and get your session
# Then make a POST request
curl -X POST http://localhost:3000/api/admin/sla-check \
  -H "Content-Type: application/json"
```

**Or use the browser console on admin dashboard:**
```javascript
fetch('/api/admin/sla-check', { 
  method: 'POST' 
}).then(r => r.json()).then(console.log)
```

### Option 3: Local Development with Node-Cron

If you want to run it automatically in development:

1. Install node-cron:
```bash
npm install node-cron
```

2. Create `src/lib/cron.ts`:
```typescript
import cron from 'node-cron';

export function setupCronJobs() {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running SLA warning check...');
    try {
      const response = await fetch('http://localhost:3000/api/cron/sla-check');
      const data = await response.json();
      console.log('SLA check result:', data);
    } catch (error) {
      console.error('Error running SLA check:', error);
    }
  });
  
  console.log('Cron jobs initialized');
}
```

3. Call it in your app initialization (development only).

## How It Works

### SLA Calculation
When a complaint is created, the system sets an SLA deadline based on category:
- **Electricity**: 12 hours
- **Water Supply**: 24 hours
- **Street Lighting**: 24 hours
- **Garbage Collection**: 48 hours
- **Road & Infrastructure**: 72 hours
- **Drainage**: 48 hours
- **Other**: 72 hours

### Notification Logic

1. **30-Minute Check Cycle**
   - Every 30 minutes, the system checks all open complaints
   - Identifies complaints with SLA deadline within next 1 hour
   - Sends warning notification to assigned officer
   - Prevents duplicate notifications (won't send again for 2 hours)

2. **Breach Notifications**
   - Checks for complaints past their SLA deadline
   - Sends one notification per day per breached complaint
   - Includes how many hours overdue

3. **Smart Deduplication**
   - Won't spam officers with repeated notifications
   - Approaching deadline: Max 1 notification per 2 hours
   - Breached deadline: Max 1 notification per day

## Testing the System

### 1. Create a Test Complaint with Short SLA

You can manually create a complaint with a very short SLA for testing:

```javascript
// In MongoDB or through the app
// Set slaDeadline to 1.5 hours from now
const testComplaint = {
  slaDeadline: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours
  status: 'ASSIGNED',
  assignedTo: '<officer_id>'
}
```

### 2. Trigger Manual Check

As admin, call: `POST /api/admin/sla-check`

### 3. Check Officer Notifications

Login as the officer and check the notification bell icon.

## Security (Optional)

To secure the cron endpoint from unauthorized access:

1. Add to `.env`:
```
CRON_SECRET=your-super-secret-key-here
```

2. Uncomment the auth check in `/api/cron/sla-check/route.ts`

3. Update your cron service to send Authorization header:
```
Authorization: Bearer your-super-secret-key-here
```

## Monitoring

Check logs to see SLA check activity:
- Vercel: Check function logs in Vercel dashboard
- Local: Terminal output when cron runs
- Production: Use your hosting provider's log viewer

## Troubleshooting

### No notifications received?
- ✅ Check if cron job is running (check logs)
- ✅ Verify complaint has `assignedTo` field set
- ✅ Verify complaint status is not RESOLVED/CLOSED
- ✅ Check SLA deadline is within 1 hour window
- ✅ Verify officer notification preferences

### Duplicate notifications?
- ✅ Check cron schedule (should be 30 minutes, not shorter)
- ✅ Verify deduplication logic is working

### Performance issues?
- ✅ Add database index on `slaDeadline` field
- ✅ Limit the query to specific statuses
- ✅ Adjust cron frequency if needed

## Database Indexes (Optional Performance Improvement)

Add indexes for better query performance:

```javascript
// In MongoDB
db.complaints.createIndex({ slaDeadline: 1, status: 1, assignedTo: 1 })
```

## Summary

✅ **Created**: SLA warning service (`src/services/sla-warning.service.ts`)
✅ **Created**: Cron endpoint (`/api/cron/sla-check`)
✅ **Created**: Admin manual trigger (`/api/admin/sla-check`)
✅ **Updated**: Assignment notification to include SLA deadline

**Next Steps:**
1. Set up a cron service (cron-job.org recommended)
2. Test with a short-SLA complaint
3. Monitor logs to ensure it's working

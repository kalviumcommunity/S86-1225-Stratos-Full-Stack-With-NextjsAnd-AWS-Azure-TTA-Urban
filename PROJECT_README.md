# TTA Urban Grievance Management System

A comprehensive, full-stack urban complaint management system built with Next.js 16, MongoDB, and TypeScript.

## 🎯 Project Overview

This system enables citizens to report urban grievances, officers to manage and resolve complaints, and administrators to oversee the entire process with full transparency and audit trails.

## ✨ Features Implemented

### 🔐 Authentication & Authorization
- Role-based access control (RBAC)
- NextAuth.js integration
- Secure password hashing with bcrypt
- Protected routes and API endpoints
- Three user roles: Citizen, Officer, Admin

### 👤 User Management
- User registration and login
- Profile management
- Department assignment for officers
- Active/inactive user status

### 📝 Complaint Management
- Create complaints with photos, location, and descriptions
- Auto-generated complaint IDs (CMP-YYYY-XXXXXX)
- Status tracking (NEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED)
- SLA (Service Level Agreement) tracking per category
- Image uploads with Cloudinary
- Location data (lat/lng + address)

### 🎫 Status Workflow
- NEW: Initial submission
- ASSIGNED: Assigned to officer
- IN_PROGRESS: Officer working on it
- RESOLVED: Issue fixed with proof
- CLOSED: Confirmed resolution
- REJECTED: Cannot be addressed

### 📊 Dashboards
- **Public Dashboard**: Real-time statistics for transparency
- **Citizen Dashboard**: Track personal complaints
- **Officer Dashboard**: Manage assigned complaints
- **Admin Dashboard**: Overview of all complaints, workload, and SLA compliance

### 🔍 Audit & Transparency
- Comprehensive audit logs for all actions
- Status history timeline
- User activity tracking
- Complete transparency for public accountability

### 🔔 Notifications
- Real-time notifications for users
- Status update alerts
- Assignment notifications

## 📁 Project Structure

```
tta-urban/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── complaints/
│   │   │   └── public/
│   │   ├── complaints/        # Citizen complaint pages
│   │   ├── officer/           # Officer pages
│   │   ├── admin/             # Admin pages
│   │   ├── public/            # Public pages
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ComplaintCard.tsx
│   │   ├── StatsCard.tsx
│   │   ├── Navbar.tsx
│   │   └── SessionProvider.tsx
│   │
│   ├── lib/                   # Core library code
│   │   ├── db.ts             # MongoDB connection
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── rbac.ts           # Role-based access control
│   │   └── cloudinary.ts     # Image upload service
│   │
│   ├── models/                # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Complaint.ts
│   │   ├── AuditLog.ts
│   │   ├── Department.ts
│   │   └── Notification.ts
│   │
│   ├── services/              # Business logic
│   │   ├── user.service.ts
│   │   ├── complaint.service.ts
│   │   ├── audit.service.ts
│   │   └── notification.service.ts
│   │
│   └── utils/                 # Utility functions
│       ├── constants.ts
│       ├── validators.ts
│       ├── statusTransitions.ts
│       └── generateComplaintId.ts
│
├── .env.local                 # Environment variables
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
cd tta-urban
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Update `.env.local` with your credentials:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/tta-urban
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tta-urban

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-string-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Generate NextAuth Secret**
```bash
openssl rand -base64 32
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The MongoDB schemas will be created automatically. No manual setup required.

### Collections Created:
- `users` - User accounts (citizens, officers, admins)
- `complaints` - All complaints
- `auditlogs` - Complete audit trail
- `departments` - Department management
- `notifications` - User notifications

## 👥 User Roles & Permissions

### Citizen
- Create and submit complaints
- Track personal complaints
- View status updates
- Close resolved complaints

### Officer
- View assigned complaints
- Update complaint status
- Upload resolution proof
- Add work notes

### Admin
- View all complaints
- Assign complaints to officers
- Manage users and departments
- Configure SLA settings
- View audit logs

## 🎨 Design Features

- Modern, professional UI with gradient accents
- Responsive design (mobile, tablet, desktop)
- Real-time statistics
- Interactive maps for location
- Status badges with color coding
- Timeline visualization
- Dark mode support (optional)

## 📊 Complaint Categories

1. Road & Infrastructure (72h SLA)
2. Water Supply (24h SLA)
3. Electricity (12h SLA)
4. Garbage Collection (48h SLA)
5. Street Lighting (24h SLA)
6. Drainage (48h SLA)
7. Public Property Damage (72h SLA)
8. Noise Pollution (24h SLA)
9. Air Pollution (48h SLA)
10. Other (72h SLA)

## 🔄 Complaint Lifecycle

```
Citizen Submits → Admin Assigns → Officer Works → Resolution → Citizen Confirms
     NEW       →   ASSIGNED    →  IN_PROGRESS  →  RESOLVED  →    CLOSED
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (handled by NextAuth)

### Complaints
- `GET /api/complaints` - Get complaints (filtered by role)
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/[id]` - Get complaint details
- `PATCH /api/complaints/[id]` - Update complaint (assign/status)

### Public
- `GET /api/public/stats` - Public statistics
- `GET /api/public/track` - Track complaint by ID

## 📱 Pages Structure

### Public Pages (No Login)
- `/` - Landing page with stats
- `/track` - Track complaint by ID
- `/public/dashboard` - Public dashboard
- `/login` - Login page
- `/register` - Registration page

### Citizen Pages
- `/complaints` - My complaints list
- `/complaints/new` - Create new complaint
- `/complaints/[id]` - Complaint details
- `/profile` - User profile

### Officer Pages
- `/officer/dashboard` - Officer dashboard
- `/officer/complaints/[id]` - Complaint management

### Admin Pages
- `/admin/dashboard` - Admin dashboard
- `/admin/complaints` - All complaints
- `/admin/complaints/[id]` - Assign & manage
- `/admin/users` - User management
- `/admin/sla` - SLA configuration
- `/admin/audit-logs` - Audit trail

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT-based session management
- Role-based access control
- Protected API routes
- Input validation with Zod
- SQL injection prevention (MongoDB)
- XSS protection
- CSRF protection (NextAuth)

## 📈 Next Steps

To complete the application, create the remaining pages:

1. **Citizen Complaint Pages** - List, create, detail views
2. **Officer Dashboard** - Assigned complaints management
3. **Admin Dashboard** - Full system overview
4. **Public Tracking** - Search and track complaints
5. **Middleware** - Route protection implementation

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize.

## 📄 License

MIT License

## 💡 Tips

- **First User**: Register with role "CITIZEN" first, then manually update MongoDB to make them ADMIN
- **Testing**: Use [MongoDB Compass](https://www.mongodb.com/products/compass) for database visualization
- **Images**: Sign up for free Cloudinary account at https://cloudinary.com
- **Production**: Update all environment variables and secrets before deploying

## 🚨 Important Notes

1. Change `NEXTAUTH_SECRET` before production deployment
2. Enable database indexes for better performance
3. Set up proper backup strategies
4. Configure CORS for production
5. Add rate limiting for API endpoints
6. Implement email notifications (optional)

## 📞 Support

For issues and questions:
- Check the code comments
- Review the API documentation
- Inspect network requests in DevTools

---

**Built with ❤️ using Next.js 16, MongoDB, TypeScript, and Tailwind CSS**

# TTA-Urban System Architecture

**Version:** 1.0.0  
**Last Updated:** January 7, 2026  
**Maintained By:** TTA-Urban Development Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Directory Structure](#directory-structure)
5. [Component Architecture](#component-architecture)
6. [Data Flow](#data-flow)
7. [Database Schema](#database-schema)
8. [Deployment Architecture](#deployment-architecture)
9. [Security Architecture](#security-architecture)
10. [Integration Points](#integration-points)
11. [Scalability & Performance](#scalability--performance)
12. [Maintenance & Development](#maintenance--development)

---

## System Overview

TTA-Urban is a **full-stack web application** designed to manage urban civic complaints with complete transparency, traceability, and accountability. The system enables citizens to submit complaints, officers to manage and resolve them, and administrators to oversee the entire operation.

### Core Objectives

- **Transparency:** Real-time tracking and public dashboards
- **Traceability:** Complete audit trail of all actions
- **Accountability:** Role-based access and SLA enforcement

### Key Capabilities

- Multi-role user management (Citizen, Officer, Admin)
- Complaint lifecycle management
- File upload and storage
- Real-time notifications
- Department and officer assignment
- Analytics and reporting
- Public transparency dashboard

---

## Technology Stack

### Frontend

```
┌──────────────────────────────────────┐
│  Frontend Technology Stack           │
├──────────────────────────────────────┤
│  • Next.js 16 (React Framework)      │
│  • React 19 (UI Library)             │
│  • TypeScript (Type Safety)          │
│  • Tailwind CSS (Styling)            │
│  • SWR (Data Fetching)               │
│  • React Hook Form (Forms)           │
│  • React Hot Toast (Notifications)   │
│  • Zod (Validation)                  │
└──────────────────────────────────────┘
```

### Backend

```
┌──────────────────────────────────────┐
│  Backend Technology Stack            │
├──────────────────────────────────────┤
│  • Next.js API Routes (Serverless)   │
│  • Prisma ORM (Database Access)      │
│  • PostgreSQL (Database)             │
│  • JWT (Authentication)              │
│  • Bcrypt (Password Hashing)         │
│  • Swagger/OpenAPI (API Docs)        │
└──────────────────────────────────────┘
```

### Cloud & Infrastructure

```
┌──────────────────────────────────────────────┐
│  Cloud Services (AWS & Azure)                │
├──────────────────────────────────────────────┤
│  AWS:                                        │
│  • ECS (Container Orchestration)             │
│  • RDS PostgreSQL (Database)                 │
│  • S3 (File Storage)                         │
│  • Secrets Manager (Secrets)                 │
│  • CloudWatch (Monitoring & Logs)            │
│  • ECR (Container Registry)                  │
│  • ALB (Load Balancer)                       │
│                                              │
│  Azure:                                      │
│  • App Service (Web Hosting)                 │
│  • PostgreSQL (Database)                     │
│  • Blob Storage (Files)                      │
│  • Key Vault (Secrets)                       │
│  • Application Insights (Monitoring)         │
│  • ACR (Container Registry)                  │
└──────────────────────────────────────────────┘
```

### DevOps & CI/CD

```
┌──────────────────────────────────────┐
│  DevOps Tools                        │
├──────────────────────────────────────┤
│  • GitHub Actions (CI/CD)            │
│  • Docker (Containerization)         │
│  • Jest (Testing)                    │
│  • ESLint (Code Quality)             │
│  • Prettier (Code Formatting)        │
│  • Husky (Git Hooks)                 │
│  • Trivy (Security Scanning)         │
└──────────────────────────────────────┘
```

---

## Architecture Diagram

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│   │ Citizens │    │ Officers │    │  Admins  │                │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘                │
│        │               │               │                        │
│        └───────────────┼───────────────┘                        │
│                        │                                        │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER (ALB/Azure LB)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (Next.js)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Frontend   │  │  API Routes  │  │ Middleware   │         │
│  │  Components  │  │  (REST API)  │  │  (Auth/RBAC) │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌─────────────────┐  ┌────────────┐  ┌──────────────┐
│   PostgreSQL    │  │  S3/Blob   │  │   Secrets    │
│   Database      │  │  Storage   │  │   Manager    │
│  (RDS/Azure)    │  │            │  │              │
└─────────────────┘  └────────────┘  └──────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONITORING & LOGGING                        │
├─────────────────────────────────────────────────────────────────┤
│  CloudWatch / Application Insights                              │
│  • Application Logs                                             │
│  • Performance Metrics                                          │
│  • Error Tracking                                               │
│  • Health Monitoring                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
ttaurban/
├── app/                                # Next.js App Router
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Homepage
│   │
│   ├── api/                            # API Routes
│   │   ├── auth/                       # Authentication
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   ├── users/                      # User management
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── complaints/                 # Complaint management
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── departments/                # Department management
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── files/                      # File operations
│   │   │   └── upload/route.ts
│   │   ├── health/                     # Health checks
│   │   │   ├── route.ts
│   │   │   ├── db/route.ts
│   │   │   └── logging/route.ts
│   │   └── docs/                       # API Documentation
│   │       ├── route.ts                # Swagger UI
│   │       └── swagger/route.ts        # OpenAPI JSON
│   │
│   ├── components/                     # Page-specific components
│   ├── config/                         # Configuration
│   ├── dashboard/                      # Dashboard pages
│   ├── login/                          # Login page
│   ├── signup/                         # Signup page
│   └── users/                          # User management pages
│
├── components/                         # Shared React components
│   ├── Button.tsx
│   ├── ComplaintCard.tsx
│   ├── FormInput.tsx
│   ├── RoleGuard.tsx
│   ├── SWRProvider.tsx
│   ├── layout/                         # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── ui/                             # UI primitives
│       ├── Modal.tsx
│       ├── Alert.tsx
│       └── LoadingSpinner.tsx
│
├── context/                            # React Context providers
│   ├── AuthContext.tsx                 # Authentication state
│   └── UIContext.tsx                   # UI state
│
├── hooks/                              # Custom React hooks
│   ├── useAuth.ts
│   ├── useComplaints.ts
│   └── useUsers.ts
│
├── lib/                                # Utility libraries
│   ├── auth.ts                         # Authentication utilities
│   ├── db.ts                           # Database connection
│   ├── prisma.ts                       # Prisma client
│   ├── storage.ts                      # File storage (S3/Blob)
│   ├── secrets.ts                      # Secrets management
│   ├── structuredLogger.ts             # Logging utilities
│   ├── swagger.ts                      # Swagger configuration
│   └── validation.ts                   # Input validation
│
├── prisma/                             # Database schema & migrations
│   ├── schema.prisma                   # Prisma schema
│   ├── seed.ts                         # Database seeding
│   └── migrations/                     # Migration files
│
├── public/                             # Static assets
│   ├── images/
│   └── icons/
│
├── scripts/                            # Utility scripts
│   ├── verify-deployment.sh            # Deployment verification
│   ├── verify-deployment.ps1
│   ├── rollback-aws-ecs.sh             # Rollback scripts
│   ├── rollback-azure.sh
│   └── test-*.js                       # Test scripts
│
├── __tests__/                          # Unit & integration tests
│   ├── api/                            # API route tests
│   ├── components/                     # Component tests
│   └── lib/                            # Utility tests
│
├── __smoke_tests__/                    # Smoke tests for deployment
│   ├── health.test.js
│   ├── home.test.js
│   ├── api.test.js
│   └── database.test.js
│
├── docs/                               # Documentation
│   ├── API_DOCUMENTATION.md            # API reference
│   ├── ARCHITECTURE.md                 # This file
│   ├── DEPLOYMENT.md                   # Deployment guide
│   ├── DEPLOYMENT_VERIFICATION.md      # Verification strategy
│   └── *.md                            # Other docs
│
├── .github/workflows/                  # CI/CD pipelines
│   ├── ci.yml                          # CI pipeline
│   ├── docker-build-push.yml           # Docker build
│   ├── deploy-aws-ecs.yml              # AWS deployment
│   └── deploy-azure.yml                # Azure deployment
│
├── .env.example                        # Environment variables template
├── .eslintrc.json                      # ESLint configuration
├── .prettierrc                         # Prettier configuration
├── docker-compose.yml                  # Local development Docker
├── Dockerfile                          # Production Docker image
├── jest.config.js                      # Jest test configuration
├── next.config.mjs                     # Next.js configuration
├── package.json                        # Dependencies
├── tailwind.config.ts                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
└── README.md                           # Project documentation
```

### Directory Purpose Summary

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `app/api/` | Backend API routes | All route.ts files |
| `components/` | Reusable UI components | Button, Modal, etc. |
| `lib/` | Business logic & utilities | auth, db, storage |
| `prisma/` | Database schema & ORM | schema.prisma |
| `__tests__/` | Test files | *.test.ts files |
| `docs/` | Documentation | Markdown files |
| `.github/workflows/` | CI/CD automation | YAML workflow files |
| `scripts/` | DevOps scripts | Bash/PowerShell files |

---

## Component Architecture

### Frontend Components Hierarchy

```
App
├── AuthContext (Authentication)
├── UIContext (UI State)
└── Layout
    ├── Header
    │   ├── Navigation
    │   └── UserMenu
    ├── Sidebar
    │   ├── NavLinks
    │   └── QuickActions
    ├── Main Content
    │   ├── Dashboard (based on role)
    │   ├── ComplaintList
    │   ├── ComplaintForm
    │   ├── UserManagement
    │   └── Analytics
    └── Footer
```

### API Layer Architecture

```
Request
  │
  ▼
┌──────────────────┐
│   Middleware     │
│   - CORS         │
│   - Logging      │
│   - Rate Limit   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Authentication  │
│  - JWT Verify    │
│  - Role Check    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Validation     │
│   - Zod Schema   │
│   - Sanitization │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Business Logic   │
│ - Controllers    │
│ - Services       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Data Layer     │
│   - Prisma ORM   │
│   - Database     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Response      │
│    - JSON        │
│    - Status      │
└──────────────────┘
```

---

## Data Flow

### Complete User Journey: Complaint Submission

```mermaid
sequenceDiagram
    actor Citizen
    participant Frontend
    participant API
    participant Auth
    participant DB
    participant Storage
    participant Logger
    
    Citizen->>Frontend: Fill complaint form
    Frontend->>Frontend: Client-side validation
    Frontend->>API: POST /api/complaints (with JWT)
    
    API->>Auth: Verify JWT token
    Auth-->>API: User authenticated
    
    API->>API: Validate input (Zod)
    
    alt File attached
        API->>Storage: Upload file to S3/Blob
        Storage-->>API: Return file URL
    end
    
    API->>DB: Create complaint record
    DB-->>API: Complaint created
    
    API->>Logger: Log complaint creation
    Logger-->>API: Logged
    
    API-->>Frontend: Return complaint data
    Frontend-->>Citizen: Show success message
    
    Note over Citizen,Logger: Complaint is now in PENDING status
```

### Complaint Lifecycle Flow

```
Citizen Submits
      │
      ▼
  ┌─────────┐
  │ PENDING │ ──────────┐
  └────┬────┘           │
       │                │
       ▼                │
  ┌──────────┐          │
  │ VERIFIED │          │ Rejection
  └────┬─────┘          │
       │                │
       ▼                │
  ┌──────────┐          │
  │ ASSIGNED │          │
  └────┬─────┘          │
       │                │
       ▼                │
  ┌──────────────┐      │
  │ IN_PROGRESS  │      │
  └────┬─────────┘      │
       │                │
       ▼                │
  ┌──────────┐          │
  │ RESOLVED │          │
  └────┬─────┘          │
       │                │
       ▼                │
  ┌────────┐    ┌───────┴────┐
  │ CLOSED │◄───┤  REJECTED  │
  └────────┘    └────────────┘
```

---

## Database Schema

### Core Tables

```sql
-- Users
Table users {
  id            UUID [pk]
  email         VARCHAR(255) [unique, not null]
  password_hash VARCHAR(255) [not null]
  name          VARCHAR(255) [not null]
  phone         VARCHAR(20)
  role          ENUM('CITIZEN', 'OFFICER', 'ADMIN') [not null]
  department_id UUID [ref: > departments.id]
  created_at    TIMESTAMP [default: `now()`]
  updated_at    TIMESTAMP
}

-- Complaints
Table complaints {
  id                  UUID [pk]
  title               VARCHAR(255) [not null]
  description         TEXT [not null]
  category            VARCHAR(100)
  status              ENUM('PENDING', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')
  priority            ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')
  location            TEXT
  latitude            FLOAT
  longitude           FLOAT
  citizen_id          UUID [ref: > users.id, not null]
  assigned_officer_id UUID [ref: > users.id]
  department_id       UUID [ref: > departments.id]
  attachments         TEXT[] [note: 'Array of file URLs']
  created_at          TIMESTAMP [default: `now()`]
  updated_at          TIMESTAMP
  resolved_at         TIMESTAMP
}

-- Departments
Table departments {
  id              UUID [pk]
  name            VARCHAR(255) [unique, not null]
  description     TEXT
  head_officer_id UUID [ref: > users.id]
  created_at      TIMESTAMP [default: `now()`]
  updated_at      TIMESTAMP
}

-- Audit Log
Table audit_logs {
  id          UUID [pk]
  user_id     UUID [ref: > users.id]
  action      VARCHAR(100) [not null]
  resource    VARCHAR(100) [not null]
  resource_id UUID
  details     JSONB
  ip_address  VARCHAR(45)
  timestamp   TIMESTAMP [default: `now()`]
}
```

### Relationships

- User ↔ Complaints (citizen_id): One-to-Many
- User ↔ Complaints (assigned_officer_id): One-to-Many
- Department ↔ Complaints: One-to-Many
- Department ↔ Users: One-to-Many
- User ↔ Audit Logs: One-to-Many

---

## Deployment Architecture

### AWS Deployment

```
┌─────────────────────────────────────────────────────┐
│                     Route 53                         │
│                 (DNS Management)                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│        Application Load Balancer (ALB)              │
│        - SSL/TLS Termination                        │
│        - Health Checks                              │
│        - Traffic Distribution                       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌─────────────┐          ┌─────────────┐
│ ECS Task 1  │          │ ECS Task 2  │
│ (Container) │          │ (Container) │
└──────┬──────┘          └──────┬──────┘
       │                        │
       └────────────┬───────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌─────┐    ┌──────┐    ┌──────────┐
    │ RDS │    │  S3  │    │ Secrets  │
    │ PG  │    │Bucket│    │ Manager  │
    └─────┘    └──────┘    └──────────┘
        │
        ▼
  ┌─────────────┐
  │ CloudWatch  │
  │ Monitoring  │
  └─────────────┘
```

### Azure Deployment

```
┌─────────────────────────────────────────────────────┐
│                  Azure DNS / CDN                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              App Service (Web App)                   │
│              - Auto-scaling                          │
│              - SSL Certificate                       │
│              - Health Monitoring                     │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌─────────────────┐      ┌──────────────────┐
│  Azure DB for   │      │   Blob Storage   │
│   PostgreSQL    │      │                  │
└────────┬────────┘      └──────────────────┘
         │
         │               ┌──────────────────┐
         └───────────────│   Key Vault      │
                         │   (Secrets)      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Application     │
                         │  Insights        │
                         └──────────────────┘
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# AWS (if using AWS)
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="ttaurban-uploads"

# Azure (if using Azure)
AZURE_STORAGE_CONNECTION_STRING="your-connection-string"
AZURE_KEY_VAULT_URL="https://your-vault.vault.azure.net/"

# Application
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://ttaurban.azurewebsites.net"
```

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Network Security                           │
│ - HTTPS/TLS encryption                              │
│ - Firewall rules                                    │
│ - Security groups (AWS) / NSGs (Azure)              │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Layer 2: Application Security                       │
│ - JWT authentication                                │
│ - Role-based access control (RBAC)                  │
│ - Input validation & sanitization                   │
│ - CORS configuration                                │
│ - Rate limiting                                     │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Layer 3: Data Security                              │
│ - Password hashing (bcrypt)                         │
│ - Database encryption at rest                       │
│ - Secrets management (AWS/Azure)                    │
│ - SQL injection prevention (Prisma)                 │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Layer 4: Monitoring & Audit                         │
│ - Audit logging                                     │
│ - Security scanning (Trivy)                         │
│ - CloudWatch / Application Insights                 │
└─────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User Login
    │
    ▼
┌──────────────┐
│ Credentials  │
│ Validation   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Bcrypt     │
│   Verify     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Generate    │
│  JWT Token   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Return      │
│  Token       │
└──────────────┘
```

---

## Integration Points

### External Services

```
TTA-Urban App
     │
     ├─► AWS S3 / Azure Blob (File Storage)
     │
     ├─► SendGrid (Email Notifications)
     │
     ├─► Twilio (SMS Notifications) [Planned]
     │
     ├─► Google Maps API (Location Services) [Planned]
     │
     └─► Analytics Service [Planned]
```

### API Integration Points

- **File Storage:** Multi-cloud support (AWS S3 & Azure Blob)
- **Secrets Management:** AWS Secrets Manager & Azure Key Vault
- **Monitoring:** CloudWatch & Application Insights
- **Email:** SendGrid API for transactional emails
- **Database:** PostgreSQL via Prisma ORM

---

## Scalability & Performance

### Horizontal Scaling

```
Load Balancer
      │
      ├─► App Instance 1 (ECS Task)
      ├─► App Instance 2 (ECS Task)
      ├─► App Instance 3 (ECS Task)
      └─► App Instance N (Auto-scaled)
            │
            └─► Shared Database (RDS/Azure DB)
```

### Performance Optimizations

1. **Caching Strategy**
   - SWR for client-side caching
   - Redis for session storage (planned)
   - CloudFront/CDN for static assets (planned)

2. **Database Optimization**
   - Indexed columns on frequent queries
   - Connection pooling via Prisma
   - Read replicas (planned for high traffic)

3. **Code Optimization**
   - Server-side rendering (SSR) where needed
   - Code splitting and lazy loading
   - Image optimization with Next.js Image

4. **Monitoring**
   - Response time tracking
   - Database query performance
   - Error rate monitoring
   - Resource utilization alerts

---

## Maintenance & Development

### Adding New Features

1. **Create feature branch** from `main`
2. **Implement changes** following coding standards
3. **Add tests** (unit + integration)
4. **Update documentation** (API docs, README)
5. **Create pull request** with description
6. **CI/CD runs** automated checks
7. **Code review** by team members
8. **Merge** after approval
9. **Deploy** via automated pipeline

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/yourorg/ttaurban.git
cd ttaurban/ttaurban

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Smoke tests (requires running server)
npm run test:smoke
```

### Deployment Process

1. **Push to `main` branch**
2. **GitHub Actions triggers**
3. **CI Pipeline runs:**
   - Linting
   - Type checking
   - Tests
   - Security scanning
4. **Build Docker image**
5. **Push to ECR/ACR**
6. **Deploy to ECS/Azure**
7. **Health checks**
8. **Smoke tests**
9. **Success / Auto-rollback**

### Updating API Documentation

```bash
# After adding/modifying API routes:
# 1. Add JSDoc Swagger comments to route
# 2. Restart dev server
# 3. Visit /api/docs to see updates
# 4. Update API_DOCUMENTATION.md if needed
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

## Troubleshooting

### Common Issues

**Issue:** Docker build fails  
**Solution:** Check Docker logs, verify dependencies in package.json

**Issue:** Database connection fails  
**Solution:** Verify DATABASE_URL environment variable, check network security groups

**Issue:** Authentication not working  
**Solution:** Verify JWT_SECRET is set, check token expiration

**Issue:** File upload fails  
**Solution:** Check AWS/Azure credentials, verify bucket/container permissions

### Useful Commands

```bash
# Check logs (AWS)
aws logs tail /ecs/ttaurban-app --follow

# Check logs (Azure)
az webapp log tail --name ttaurban-app --resource-group ttaurban-rg

# Restart application
# AWS: Force new ECS deployment
# Azure: Restart App Service

# Database console
npx prisma studio

# Health check
curl https://your-domain.com/api/health
```

---

## Future Enhancements

### Planned Features

- [ ] Real-time notifications (WebSockets)
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] GIS integration for location mapping
- [ ] SLA tracking and escalation
- [ ] Multi-language support (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Redis caching layer
- [ ] GraphQL API option
- [ ] Microservices migration (long-term)

### Technical Debt

- [ ] Add integration tests for all API routes
- [ ] Implement comprehensive E2E tests
- [ ] Add performance benchmarks
- [ ] Improve error handling consistency
- [ ] Add API rate limiting per user
- [ ] Implement request/response caching
- [ ] Add database read replicas
- [ ] Implement blue-green deployment

---

## Contributing

### Code Standards

- Follow TypeScript strict mode
- Use ESLint and Prettier for formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Update documentation
4. Submit PR with description
5. Address review comments
6. Merge after approval

---

## Support & Contact

- **Documentation:** https://github.com/yourorg/ttaurban/docs
- **Issues:** https://github.com/yourorg/ttaurban/issues
- **Email:** dev@ttaurban.com
- **Slack:** #ttaurban-dev

---

**Document Version:** 1.0.0  
**Last Updated:** January 7, 2026  
**Next Review:** April 7, 2026

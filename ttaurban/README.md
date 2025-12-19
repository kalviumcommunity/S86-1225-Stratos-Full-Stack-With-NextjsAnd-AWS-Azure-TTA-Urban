This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

> Looking for code-quality configuration details? See the root-level `readme.md` in this repository.

---

## API Documentation

This project implements a comprehensive RESTful API for urban complaint management. All API routes follow REST conventions with consistent naming, error handling, and HTTP status codes.

### Quick Links

- **Full API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference
- **API Base URL**: `http://localhost:3000/api`

### API Route Hierarchy

```
/api/
├── users/                    # User management
│   ├── route.ts             # GET (list), POST (create)
│   └── [id]/route.ts        # GET (by ID), PUT, PATCH, DELETE
├── complaints/               # Complaint management (main resource)
│   ├── route.ts             # GET (list with filters), POST (create)
│   └── [id]/route.ts        # GET (by ID), PUT, PATCH, DELETE
└── departments/              # Department management
		├── route.ts             # GET (list), POST (create)
		└── [id]/route.ts        # GET (by ID), PUT, PATCH, DELETE
```

### Quick Test Examples

#### Get all users (paginated)
```bash
curl -X GET http://localhost:3000/api/users?page=1&limit=10
```

#### Create a new user
```bash
curl -X POST http://localhost:3000/api/users \
	-H "Content-Type: application/json" \
	-d '{
		"name": "John Doe",
		"email": "john@example.com",
		"password": "securePassword123",
		"role": "CITIZEN"
	}'
```

#### Get a specific user
```bash
curl -X GET http://localhost:3000/api/users/1
```

#### Update a user (full replacement)
```bash
curl -X PUT http://localhost:3000/api/users/1 \
	-H "Content-Type: application/json" \
	-d '{
		"name": "Jane Doe",
		"email": "jane@example.com",
		"role": "OFFICER"
	}'
```

#### Partially update a user (only specified fields)
```bash
curl -X PATCH http://localhost:3000/api/users/1 \
	-H "Content-Type: application/json" \
	-d '{"role": "ADMIN"}'
```

#### Delete a user
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

#### Get all complaints with filters
```bash
curl -X GET "http://localhost:3000/api/complaints?page=1&limit=10&status=SUBMITTED&priority=HIGH"
```

#### Create a complaint
```bash
curl -X POST http://localhost:3000/api/complaints \
	-H "Content-Type: application/json" \
	-d '{
		"title": "Pothole on Main Street",
		"description": "Large pothole causing traffic hazard",
		"category": "INFRASTRUCTURE",
		"address": "123 Main St",
		"latitude": 40.7128,
		"longitude": -74.006
	}'
```

#### Update complaint status
```bash
curl -X PATCH http://localhost:3000/api/complaints/1 \
	-H "Content-Type: application/json" \
	-d '{"status": "IN_PROGRESS", "priority": "HIGH"}'
```

### REST Design Principles Applied

#### 1. **Resource-Based Naming**
- Use plural nouns: `/api/users`, not `/api/getUsers`
- No verbs in routes: HTTP methods handle the action

#### 2. **HTTP Method Semantics**
| Method | Purpose | Status Code |
| --- | --- | --- |
| GET | Retrieve data | 200 OK |
| POST | Create data | 201 Created |
| PUT | Full replacement | 200 OK |
| PATCH | Partial update | 200 OK |
| DELETE | Remove data | 200 OK |

#### 3. **Consistent Response Format**
All endpoints return JSON with a consistent structure:
```json
{
	"success": true,
	"data": { /* resource or array */ },
	"pagination": { /* optional */ }
}
```

Error responses:
```json
{
	"success": false,
	"error": "Description of error"
}
```

#### 4. **Pagination**
- All list endpoints support `page` and `limit` query parameters
- Default: page=1, limit=10 (max 100 items per page)
- Response includes pagination metadata:
```json
{
	"pagination": {
		"page": 1,
		"limit": 10,
		"total": 45,
		"totalPages": 5
	}
}
```

#### 5. **Filtering**
- `/api/complaints?status=IN_PROGRESS&priority=HIGH`
- Filters are chainable and work with pagination

#### 6. **Error Handling**
- Meaningful HTTP status codes (400, 404, 409, 500)
- Descriptive error messages
- Validation of input before processing

### Why This Design Improves Maintainability

1. **Predictability**: Once you understand one endpoint, you understand all endpoints
	 - All resources follow `/api/[resource]` and `/api/[resource]/[id]` patterns
	 - Same HTTP methods produce consistent results

2. **Reduced Integration Errors**: Clear conventions mean fewer surprises
	 - POST always returns 201 for new resources
	 - Errors always have the same JSON structure
	 - Status updates use PATCH, not custom POST routes like `/api/complaints/1/status`

3. **Scalability**: Adding new resources is straightforward
	 - Create `/api/feedback`, `/api/notifications`, etc.
	 - Copy the structure from existing resources
	 - Developers don't need to reinvent patterns for each resource

4. **Team Collaboration**: Clear standards reduce confusion
	 - Code reviews are faster (patterns are consistent)
	 - Onboarding new developers is easier
	 - Documentation is simpler (one pattern, many examples)

5. **Self-Documenting API**: The structure explains itself
	 - Resource names are nouns (not verbs) - clear what they represent
	 - HTTP methods are standard - everyone knows GET means "read"
	 - Route hierarchy shows relationships (`/api/complaints/:id` relates to a specific complaint)

### Implemented Features ✅

1. **✅ Database Connected**: Prisma ORM with PostgreSQL
	 - All routes use Prisma for data persistence
	 - Schema migrations applied

2. **✅ Authentication Implemented**: JWT-based authentication
	 - Signup with bcrypt password hashing
	 - Login with JWT token generation
	 - Protected routes with token verification

3. **✅ Authorization Implemented**: Role-based access control
	 - Middleware enforces role permissions
	 - ADMIN, OFFICER, CITIZEN roles defined
	 - Protected admin endpoints

4. **✅ Validation Implemented**: Zod schema validation
	 - All POST/PUT/PATCH endpoints validated
	 - Structured error responses with field-level details
	 - Type-safe validation schemas

### Future Enhancements

1. **Add Caching**: Improve performance
	 - Cache frequently accessed data (departments, etc.)
	 - Use Redis or similar

2. **Add Logging**: Track API usage
	 - Log all requests for debugging
	 - Monitor error rates and performance

3. **Add Rate Limiting**: Prevent abuse
	 - Limit requests per IP/user
	 - Throttle expensive operations

4. **Enhanced File Upload**: Image attachments for complaints
	 - Validate file types and sizes
	 - Store in cloud storage (AWS S3/Azure Blob)

---

## 🔐 Authentication & Authorization

This project implements secure authentication using **bcrypt** for password hashing and **JWT** (JSON Web Tokens) for session management, along with role-based authorization middleware.

### Authentication Flow

```
1. Signup → Password Hashing (bcrypt)
2. Login → Password Verification + JWT Generation
3. Protected Routes → JWT Verification + Role Check
```

### User Roles

The system supports three user roles defined in the Prisma schema:

| Role | Description | Access Level |
|------|-------------|--------------|
| `CITIZEN` | Regular users who submit complaints | Can create and view own complaints |
| `OFFICER` | Department officers who handle complaints | Can update complaint status, view assigned complaints |
| `ADMIN` | System administrators | Full access to all resources and admin endpoints |

### Authentication Endpoints

#### 1. **Signup** - `/api/auth/signup`
Register a new user with secure password hashing.

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+1234567890",
    "role": "CITIZEN"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "CITIZEN"
  }
}
```

**Security:**
- Passwords are hashed using bcrypt with 10 salt rounds
- Plain text passwords are never stored in the database
- Passwords are excluded from all API responses

#### 2. **Login** - `/api/auth/login`
Authenticate and receive a JWT token.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CITIZEN"
    }
  }
}
```

**JWT Token Details:**
- Contains: userId, email, role
- Expires: 1 hour (3600 seconds)
- Algorithm: HS256
- Secret: Environment variable `JWT_SECRET`

#### 3. **Get Current User** - `/api/auth/me` 🔒
Protected route that returns current user info (requires valid JWT).

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CITIZEN"
  }
}
```

### Authorization Middleware

The application implements **route-level authorization** using Next.js middleware at the root level ([middleware.ts](middleware.ts)).

#### How It Works

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Middleware (middleware.ts) │
│  1. Extract JWT token       │
│  2. Verify signature        │
│  3. Check role permissions  │
│  4. Attach user info        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────┐
│ API Handler │ ← User info in headers:
└─────────────┘   x-user-id, x-user-email, x-user-role
```

#### Protected Routes

| Route Pattern | Required Role | Description |
|---------------|---------------|-------------|
| `/api/admin/*` | `ADMIN` only | Admin-only endpoints |
| `/api/users/*` | Any authenticated user | User management (further role checks in handlers) |

**Middleware Configuration** ([middleware.ts](middleware.ts)):
```typescript
export const config = {
  matcher: ["/api/admin/:path*", "/api/users/:path*"],
};
```

#### Authorization Checks

1. **Token Validation**
   ```typescript
   const token = req.headers.get("authorization")?.split(" ")[1];
   if (!token) return 401 Unauthorized
   ```

2. **JWT Verification**
   ```typescript
   const decoded = jwt.verify(token, JWT_SECRET);
   // Extract: userId, email, role
   ```

3. **Role-Based Access Control**
   ```typescript
   if (pathname.startsWith("/api/admin") && decoded.role !== "ADMIN") {
     return 403 Forbidden
   }
   ```

4. **User Context Injection**
   ```typescript
   requestHeaders.set("x-user-id", decoded.userId);
   requestHeaders.set("x-user-email", decoded.email);
   requestHeaders.set("x-user-role", decoded.role);
   ```

### Testing Role-Based Access

#### 1. **Admin Access (Allowed)** ✅
```bash
# First, login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "adminpass"}'

# Use the token to access admin route
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome Admin! You have full access.",
  "user": {
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

#### 2. **Regular User Access (Denied)** ❌
```bash
# Login as regular user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "userpass"}'

# Try to access admin route
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <USER_JWT_TOKEN>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied"
}
```
**Status Code:** `403 Forbidden`

#### 3. **No Token (Unauthorized)** ❌
```bash
curl -X GET http://localhost:3000/api/admin
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Token missing"
}
```
**Status Code:** `401 Unauthorized`

#### 4. **Invalid/Expired Token** ❌
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```
**Status Code:** `403 Forbidden`

### Security Best Practices Implemented

#### 1. **Least Privilege Principle**
- Users only have access to routes necessary for their role
- `CITIZEN` → Own complaints
- `OFFICER` → Assigned complaints
- `ADMIN` → All resources

#### 2. **Defense in Depth**
- Middleware validates at the route level
- Individual handlers can add additional checks
- Database queries filter by user ownership where needed

#### 3. **Secure Token Management**
- JWT tokens expire after 1 hour
- Secret stored in environment variables (never in code)
- Tokens transmitted via Authorization header (not cookies by default)

#### 4. **Password Security**
- bcrypt with 10 salt rounds (industry standard)
- Automatic salting prevents rainbow table attacks
- One-way hashing (cannot be reversed)

### Environment Setup

Create `.env.local` in the `ttaurban/` directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ttaurban"

# JWT Secret (Generate a strong random secret)
JWT_SECRET="your-super-secret-jwt-key-here-minimum-32-characters"

# Generate a secure secret with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ Security Warning:**
- Never commit `.env.local` to version control
- Use different secrets for development and production
- Rotate secrets periodically

### Future Enhancements

The authorization system can be extended to support:

1. **Additional Roles**
   ```typescript
   enum UserRole {
     CITIZEN
     OFFICER
     DEPARTMENT_HEAD  // New role
     SUPERVISOR       // New role
     ADMIN
   }
   ```

2. **Refresh Tokens**
   - Long-lived refresh tokens for better UX
   - Automatic token renewal without re-login

3. **Permission-Based Access**
   - Granular permissions beyond role checks
   - Example: `OFFICER` can only update complaints in their department

4. **Token Blacklisting**
   - Revoke tokens on logout
   - Maintain a blacklist in Redis

5. **Multi-Factor Authentication (MFA)**
   - SMS or email verification codes
   - Authenticator app support

6. **Audit Logging**
   - Log all authentication attempts
   - Track admin actions for compliance

### Authorization Flow Diagram

```
┌──────────┐     Signup (POST /api/auth/signup)
│  Client  │────────────────────────────────────┐
└──────────┘                                    │
                                                ▼
                                    ┌──────────────────────┐
                                    │  Hash password       │
                                    │  Store in DB         │
                                    │  Return user (no pwd)│
                                    └──────────────────────┘

┌──────────┐     Login (POST /api/auth/login)
│  Client  │────────────────────────────────────┐
└──────────┘                                    │
                                                ▼
                                    ┌──────────────────────┐
                                    │  Verify password     │
                                    │  Generate JWT        │
                                    │  Return token + user │
                                    └──────────────────────┘
                                                │
                                                ▼
┌──────────┐     Protected Request (with token)
│  Client  │────────────────────────────────────┐
└──────────┘                                    │
     ▲                                          ▼
     │                              ┌──────────────────────┐
     │                              │  Middleware          │
     │                              │  - Verify JWT        │
     │                              │  - Check role        │
     │                              │  - Inject user info  │
     │                              └──────────────────────┘
     │                                          │
     │                                          ▼
     │                              ┌──────────────────────┐
     │                              │  API Handler         │
     │                              │  - Access user info  │
     └──────────────────────────────│  - Process request   │
                                    │  - Return response   │
                                    └──────────────────────┘
```

---

For comprehensive API documentation including all parameters, request/response examples, and error scenarios, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

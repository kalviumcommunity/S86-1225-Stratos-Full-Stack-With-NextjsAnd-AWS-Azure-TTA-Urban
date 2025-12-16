# API Quick Reference Guide

## Server Setup

```bash
cd ttaurban
npm install
npm run dev
```

Server runs at: `http://localhost:3000`
API Base URL: `http://localhost:3000/api`

---

## Quick API Commands

### Users

```bash
# List users (paginated)
curl -X GET "http://localhost:3000/api/users?page=1&limit=10"

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@ex.com","password":"pass","role":"CITIZEN"}'

# Get user by ID
curl -X GET http://localhost:3000/api/users/1

# Update entire user (PUT)
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@ex.com","role":"OFFICER"}'

# Update specific fields (PATCH)
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
```

### Complaints

```bash
# List complaints (paginated, with filters)
curl -X GET "http://localhost:3000/api/complaints?page=1&limit=10&status=SUBMITTED&priority=HIGH"

# Create complaint
curl -X POST http://localhost:3000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Pothole","description":"Big hole","category":"INFRASTRUCTURE","address":"123 Main"
  }'

# Get complaint by ID
curl -X GET http://localhost:3000/api/complaints/1

# Update complaint status
curl -X PATCH http://localhost:3000/api/complaints/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'

# Delete complaint
curl -X DELETE http://localhost:3000/api/complaints/1
```

### Departments

```bash
# List departments
curl -X GET "http://localhost:3000/api/departments?page=1&limit=10"

# Create department
curl -X POST http://localhost:3000/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name":"Traffic Dept","description":"Traffic management"}'

# Get department
curl -X GET http://localhost:3000/api/departments/1

# Update department
curl -X PATCH http://localhost:3000/api/departments/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete department
curl -X DELETE http://localhost:3000/api/departments/1
```

---

## HTTP Methods

| Method | Action | Status | When to Use |
|--------|--------|--------|------------|
| GET | Read | 200 | Retrieve data (safe, repeatable) |
| POST | Create | 201 | New resources |
| PUT | Replace | 200 | Full replacement of resource |
| PATCH | Modify | 200 | Partial update of resource |
| DELETE | Remove | 200 | Delete resource |

**Key Difference**: 
- **PUT**: Send complete resource (all fields required)
- **PATCH**: Send only fields to update (partial)

---

## Response Format

### Success (List)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### Success (Single)
```json
{
  "success": true,
  "data": { "id": 1, "name": "..." }
}
```

### Success (Create)
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { "id": 1, "..." }
}
```

### Error
```json
{
  "success": false,
  "error": "Description of error"
}
```

---

## HTTP Status Codes

| Code | Meaning | When You See It |
|------|---------|-----------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | POST created new resource |
| 400 | Bad Request | Invalid input, missing fields |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Something went wrong |

---

## Query Parameters

### Pagination (all list endpoints)
```
?page=1&limit=10
```
- `page`: Page number (1-indexed), default: 1
- `limit`: Items per page (1-100), default: 10

### Filtering (complaints endpoint)
```
?status=SUBMITTED&priority=HIGH&category=INFRASTRUCTURE
```
- `status`: SUBMITTED, IN_PROGRESS, RESOLVED, CLOSED
- `priority`: LOW, MEDIUM, HIGH
- `category`: INFRASTRUCTURE, TRAFFIC, SANITATION, OTHER

### Combined
```
http://localhost:3000/api/complaints?page=1&limit=10&status=SUBMITTED&priority=HIGH
```

---

## API Route Structure

```
/api/
├── users/
│   └── GET, POST
│   [id]/
│   └── GET, PUT, PATCH, DELETE
├── complaints/
│   └── GET (with filters), POST
│   [id]/
│   └── GET, PUT, PATCH, DELETE
└── departments/
    └── GET, POST
    [id]/
    └── GET, PUT, PATCH, DELETE
```

---

## Common Errors

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: name, email, password"
}
```
**Fix**: Include all required fields in request

### 404 Not Found
```json
{
  "success": false,
  "error": "User with ID 999 not found"
}
```
**Fix**: Verify the ID exists before requesting

### Invalid ID Format
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```
**Fix**: Use numeric IDs (not strings like "abc")

---

## Test Scripts

### Bash (Linux/Mac)
```bash
bash API_TEST_SCRIPT.sh
```

### PowerShell (Windows)
```powershell
.\API_TEST_SCRIPT.ps1
```

---

## File Locations

| File | Location |
|------|----------|
| Main API docs | `ttaurban/API_DOCUMENTATION.md` |
| Full implementation summary | `IMPLEMENTATION_SUMMARY.md` |
| Users routes | `ttaurban/app/api/users/route.ts` |
| Complaints routes | `ttaurban/app/api/complaints/route.ts` |
| Departments routes | `ttaurban/app/api/departments/route.ts` |
| Response utility | `ttaurban/app/api/utils/response.ts` |
| Pagination utility | `ttaurban/app/api/utils/pagination.ts` |

---

## Key REST Principles

✓ **Nouns, not verbs** - `/api/users` not `/api/getUsers`
✓ **Use HTTP methods** - GET, POST, PUT, PATCH, DELETE
✓ **Consistent format** - All responses follow same structure
✓ **Meaningful status codes** - 200, 201, 400, 404, 500
✓ **Pagination support** - All list endpoints support page/limit
✓ **Resource hierarchy** - `/api/resource` and `/api/resource/:id`

---

## Production Checklist

- [ ] Connect Prisma database
- [ ] Implement authentication (JWT/sessions)
- [ ] Add authorization (role-based access)
- [ ] Add input validation (Zod)
- [ ] Add request logging
- [ ] Add error tracking
- [ ] Add rate limiting
- [ ] Add CORS configuration
- [ ] Add security headers
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Generate API documentation

---

## Documentation Resources

- **Full API Docs**: See `API_DOCUMENTATION.md` for complete reference
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md` for architecture decisions
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **REST Best Practices**: https://restfulapi.net/
- **HTTP Status Codes**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

---

**Version**: 1.0
**Last Updated**: December 16, 2025

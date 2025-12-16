# API Route Structure & Naming Documentation

## Overview

This document describes the RESTful API routes for TTA Urban, a urban complaint management system. All API endpoints follow REST conventions with resource-based naming, consistent error handling, and proper HTTP status codes.

---

## API Route Hierarchy

```
/api/
├── users/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/route.ts         # GET (by ID), PUT, PATCH, DELETE
├── complaints/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/route.ts         # GET (by ID), PUT, PATCH, DELETE
└── departments/
    ├── route.ts              # GET (list), POST (create)
    └── [id]/route.ts         # GET (by ID), PUT, PATCH, DELETE
```

---

## HTTP Methods & REST Conventions

| HTTP Verb | Purpose | Route Pattern | Description |
|-----------|---------|---------------|-------------|
| GET | Read data | `/api/users` | Get paginated list |
| POST | Create data | `/api/users` | Create new resource |
| GET | Read specific | `/api/users/:id` | Get by ID |
| PUT | Full update | `/api/users/:id` | Replace entire resource |
| PATCH | Partial update | `/api/users/:id` | Update specific fields |
| DELETE | Remove data | `/api/users/:id` | Delete resource |

**Key Principles:**
- Use **plural nouns** for resource names (never verbs)
- Use **lowercase** for consistency
- Use **PUT** for full replacement, **PATCH** for partial updates
- Always return appropriate **HTTP status codes**

---

## Users API

### GET /api/users
Returns a paginated list of all users.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10, max: 100) - Items per page

**Request:**
```bash
curl -X GET http://localhost:3000/api/users?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "CITIZEN",
      "createdAt": "2025-12-16T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com",
      "role": "OFFICER",
      "createdAt": "2025-12-16T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### POST /api/users
Creates a new user.

**Request Body:**
```json
{
  "name": "Charlie Brown",
  "email": "charlie@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "CITIZEN"
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Brown",
    "email": "charlie@example.com",
    "password": "securePassword123",
    "role": "CITIZEN"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": 4,
    "name": "Charlie Brown",
    "email": "charlie@example.com",
    "role": "CITIZEN",
    "createdAt": "2025-12-16T11:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, password"
}
```

---

### GET /api/users/:id
Returns a specific user by ID.

**Request:**
```bash
curl -X GET http://localhost:3000/api/users/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "CITIZEN",
    "createdAt": "2025-12-16T10:00:00Z",
    "updatedAt": "2025-12-16T10:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User with ID 999 not found"
}
```

---

### PUT /api/users/:id
Updates entire user (full replacement).

**Request Body:**
```json
{
  "name": "Alice Updated",
  "email": "alice.new@example.com",
  "phone": "+9876543210",
  "role": "OFFICER"
}
```

**Request:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Updated",
    "email": "alice.new@example.com",
    "role": "OFFICER"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Updated",
    "email": "alice.new@example.com",
    "role": "OFFICER",
    "updatedAt": "2025-12-16T11:30:00Z"
  }
}
```

---

### PATCH /api/users/:id
Partially updates user (only specified fields).

**Request Body:**
```json
{
  "phone": "+1111111111"
}
```

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1111111111"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "phone": "+1111111111",
    "updatedAt": "2025-12-16T11:45:00Z"
  }
}
```

---

### DELETE /api/users/:id
Deletes a user by ID.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "User deleted successfully"
  }
}
```

---

## Complaints API

### GET /api/complaints
Returns a paginated list of all complaints with optional filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `status` (string, optional) - Filter by status (SUBMITTED, IN_PROGRESS, RESOLVED, CLOSED)
- `priority` (string, optional) - Filter by priority (LOW, MEDIUM, HIGH)
- `category` (string, optional) - Filter by category (INFRASTRUCTURE, TRAFFIC, SANITATION, OTHER)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/complaints?page=1&limit=10&status=SUBMITTED&priority=HIGH"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Pothole on Main Street",
      "description": "Large pothole causing traffic hazard",
      "category": "INFRASTRUCTURE",
      "status": "SUBMITTED",
      "priority": "HIGH",
      "address": "123 Main St",
      "createdAt": "2025-12-16T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### POST /api/complaints
Creates a new complaint.

**Request Body:**
```json
{
  "title": "Damaged sidewalk",
  "description": "Sidewalk near the park entrance has deep cracks and poses a safety hazard",
  "category": "INFRASTRUCTURE",
  "address": "789 Park Avenue",
  "latitude": 40.7128,
  "longitude": -74.006,
  "imageUrl": "https://example.com/image.jpg"
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Damaged sidewalk",
    "description": "Sidewalk near the park entrance has deep cracks and poses a safety hazard",
    "category": "INFRASTRUCTURE",
    "address": "789 Park Avenue"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": 3,
    "title": "Damaged sidewalk",
    "description": "Sidewalk near the park entrance has deep cracks and poses a safety hazard",
    "category": "INFRASTRUCTURE",
    "status": "SUBMITTED",
    "priority": "MEDIUM",
    "address": "789 Park Avenue",
    "createdAt": "2025-12-16T11:00:00Z"
  }
}
```

---

### GET /api/complaints/:id
Returns a specific complaint by ID.

**Request:**
```bash
curl -X GET http://localhost:3000/api/complaints/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic hazard",
    "category": "INFRASTRUCTURE",
    "status": "SUBMITTED",
    "priority": "HIGH",
    "address": "123 Main St",
    "latitude": 40.7128,
    "longitude": -74.006,
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2025-12-16T09:00:00Z",
    "updatedAt": "2025-12-16T09:00:00Z"
  }
}
```

---

### PUT /api/complaints/:id
Updates entire complaint.

**Request Body:**
```json
{
  "title": "Updated: Pothole on Main Street",
  "description": "Updated description with more details",
  "category": "INFRASTRUCTURE",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "address": "123 Main St"
}
```

**Request:**
```bash
curl -X PUT http://localhost:3000/api/complaints/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: Pothole on Main Street",
    "description": "Updated description",
    "category": "INFRASTRUCTURE",
    "status": "IN_PROGRESS",
    "priority": "HIGH"
  }'
```

---

### PATCH /api/complaints/:id
Partially updates complaint (typically used to update status or priority).

**Request Body:**
```json
{
  "status": "RESOLVED",
  "priority": "MEDIUM"
}
```

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/complaints/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "priority": "MEDIUM"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "RESOLVED",
    "priority": "MEDIUM",
    "updatedAt": "2025-12-16T12:00:00Z"
  }
}
```

---

### DELETE /api/complaints/:id
Deletes a complaint by ID.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/complaints/1
```

---

## Departments API

### GET /api/departments
Returns a paginated list of all departments.

**Request:**
```bash
curl -X GET http://localhost:3000/api/departments?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Traffic Department",
      "description": "Handles traffic and transportation issues"
    },
    {
      "id": 2,
      "name": "Sanitation Department",
      "description": "Manages waste and cleanliness"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### POST /api/departments
Creates a new department.

**Request Body:**
```json
{
  "name": "Water Supply Department",
  "description": "Manages water distribution and quality"
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Water Supply Department",
    "description": "Manages water distribution and quality"
  }'
```

---

### GET /api/departments/:id
Returns a specific department by ID.

**Request:**
```bash
curl -X GET http://localhost:3000/api/departments/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Traffic Department",
    "description": "Handles traffic and transportation issues",
    "complaintCount": 45,
    "createdAt": "2025-12-16T08:00:00Z",
    "updatedAt": "2025-12-16T08:00:00Z"
  }
}
```

---

### PUT /api/departments/:id
Updates entire department.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/departments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Traffic & Transportation Department",
    "description": "Updated description"
  }'
```

---

### PATCH /api/departments/:id
Partially updates department.

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/departments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "New description"
  }'
```

---

### DELETE /api/departments/:id
Deletes a department by ID.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/departments/1
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | POST success - new resource created |
| 400 | Bad Request | Invalid input, missing fields, validation error |
| 401 | Unauthorized | Authentication required but not provided |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists or operation conflict |
| 500 | Internal Server Error | Unexpected server error |

---

## Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

**Examples:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields: title, description, category"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Complaint with ID 999 not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Pagination

All list endpoints support pagination with two query parameters:

- `page` - The page number (1-indexed, default: 1)
- `limit` - Number of items per page (default: 10, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=2&limit=20"
```

**Pagination Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Filtering

Certain endpoints support filtering via query parameters:

**Complaints filtering example:**
```bash
# Get high-priority complaints that are in progress
curl -X GET "http://localhost:3000/api/complaints?status=IN_PROGRESS&priority=HIGH&page=1&limit=10"
```

---

## Design Reflection: Consistency & Benefits

### Why Consistency Matters

1. **Predictability**: Once developers understand one resource endpoint, they instantly understand all others. `/api/users`, `/api/complaints`, and `/api/departments` all follow the same patterns.

2. **Reduced Integration Errors**: Teams integrating with the API waste less time debugging unexpected behavior. They can confidently assume:
   - `POST` creates and returns 201
   - `PUT` replaces and returns 200
   - `PATCH` partially updates and returns 200
   - `DELETE` removes and returns 200
   - List endpoints support pagination
   - Errors follow the same JSON structure

3. **Maintainability**: Adding a new resource doesn't require inventing new patterns. Follow the template, and it works.

4. **Self-Documenting**: The API structure tells the story:
   - Plural nouns indicate collections
   - `[id]` dynamic segments are clear
   - HTTP methods are semantic and intuitive

5. **Scalability**: As the system grows (adding feedback, notifications, tasks, etc.), new developers can independently implement endpoints following the established conventions, without guessing.

### Naming Conventions Applied

- **Resource-based naming**: `/api/users` not `/api/getUsers` or `/api/fetchUsers`
- **Lowercase**: All paths are lowercase for consistency
- **Pluralized**: `/api/users` not `/api/user` (unless a singleton resource)
- **No verbs in routes**: HTTP verbs (GET, POST, PUT, etc.) handle the action semantics
- **Hierarchy**: `/api/complaints/:id` clearly relates to a specific complaint

### Implementation Best Practices

- **Validation**: All endpoints validate input before processing
- **Error handling**: Meaningful error messages with appropriate status codes
- **Response structure**: Consistent `{ success, data, pagination }` format
- **Pagination**: Large datasets automatically paginated (max 100 items/page)

This consistency transforms API integration from a tedious debugging session into a smooth, predictable experience.

---

## Testing the API

You can test all endpoints using `curl` commands provided in this documentation, or use Postman/Insomnia for a visual interface.

### Quick Start with curl

```bash
# Test users endpoint
curl -X GET http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Get complaints
curl -X GET http://localhost:3000/api/complaints

# Update complaint status
curl -X PATCH http://localhost:3000/api/complaints/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'
```

---

## Next Steps

1. **Connect to Database**: Replace mock data with actual Prisma queries
2. **Add Authentication**: Implement JWT or session-based auth middleware
3. **Add Authorization**: Verify user roles for sensitive operations
4. **Add Logging**: Log all API requests for debugging and monitoring
5. **Add Rate Limiting**: Prevent abuse with request throttling
6. **Add Caching**: Cache frequently accessed resources
7. **Add Input Sanitization**: Protect against SQL injection and XSS attacks

---

**Last Updated**: December 16, 2025

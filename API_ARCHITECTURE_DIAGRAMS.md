# API Architecture & Design Diagrams

## 1. API Route Hierarchy

```
TTA Urban API Structure
├── /api
│   ├── /users
│   │   ├── GET     → List all users (paginated)
│   │   ├── POST    → Create new user (201)
│   │   └── /[id]
│   │       ├── GET    → Get specific user
│   │       ├── PUT    → Update entire user
│   │       ├── PATCH  → Update specific fields
│   │       └── DELETE → Delete user
│   │
│   ├── /complaints
│   │   ├── GET     → List complaints (paginated, filterable)
│   │   │   Query params: page, limit, status, priority, category
│   │   ├── POST    → Create new complaint (201)
│   │   └── /[id]
│   │       ├── GET    → Get specific complaint
│   │       ├── PUT    → Update entire complaint
│   │       ├── PATCH  → Update status/priority
│   │       └── DELETE → Delete complaint
│   │
│   └── /departments
│       ├── GET     → List departments (paginated)
│       ├── POST    → Create new department (201)
│       └── /[id]
│           ├── GET    → Get department with stats
│           ├── PUT    → Update department
│           ├── PATCH  → Update specific fields
│           └── DELETE → Delete department
```

---

## 2. Request/Response Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                            │
│         curl -X POST /api/complaints                         │
│         Headers: Content-Type: application/json              │
│         Body: { title, description, category, ... }          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  ROUTE HANDLER                               │
│         app/api/complaints/route.ts                          │
│              POST function()                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │    INPUT VALIDATION                    │
    │  - Check required fields               │
    │  - Validate data types                 │
    │  - Check field lengths                 │
    │  - Return 400 if invalid               │
    └────────────┬──────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │    BUSINESS LOGIC                      │
    │  - TODO: Prisma query                  │
    │  - Process data                        │
    │  - Call database (when connected)      │
    └────────────┬──────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │    SUCCESS RESPONSE (201)              │
    │  {                                     │
    │    success: true,                      │
    │    message: "Created",                 │
    │    data: { id, ...resource }           │
    │  }                                     │
    └────────────┬──────────────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │  ERROR HANDLING  │
         │  (catch block)   │
         │  Return 400/500  │
         └──────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVER RESPONSE                           │
│         HTTP Status Code (200, 201, 400, 404, 500)          │
│         JSON Response Body                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. REST Method Comparison

```
METHOD  ACTION    IDEMPOTENT  SAFE  USED FOR
─────────────────────────────────────────────────────────────
GET     Read      ✓           ✓     Retrieve data
POST    Create    ✗           ✗     Create new resource
PUT     Replace   ✓           ✗     Full resource update
PATCH   Modify    ✗           ✗     Partial update
DELETE  Remove    ✓           ✗     Delete resource

Examples:
─────────────────────────────────────────────────────────────

GET /api/users/1
  Returns: User data (no side effects)

POST /api/users
  Creates: New user (side effect: data persisted)
  Returns: 201 Created + new user data

PUT /api/users/1
  Replaces: All fields must be provided
  Returns: 200 OK + updated user

PATCH /api/users/1
  Updates: Only provided fields change
  Returns: 200 OK + updated user

DELETE /api/users/1
  Removes: User deleted
  Returns: 200 OK + confirmation

Key Difference:
  PUT:   POST { name, email, role }
         Replaces entire user even if you only sent name
         (Other fields become null/default)

  PATCH: POST { name }
         Only updates name
         (Other fields unchanged)
```

---

## 4. Status Code Flow

```
                        API Request
                            │
                            ▼
                  Is request valid?
                       /      \
                    YES         NO
                    │            │
                    ▼            ▼
            Does resource       Return 400
            already exist?    Bad Request
              /      \
           YES        NO
           │          │
           ▼          ▼
        Return   Create new
        409      resource
      Conflict        │
                      ▼
                Can query DB?
                  /       \
               YES         NO
               │           │
               ▼           ▼
          GET: Return   Return 500
          200 OK    Server Error
          POST: Return
          201 Created
          PUT/PATCH/DELETE:
          Return 200 OK
               │
               ▼
         Resource not
         found? (GET/PUT/PATCH/DELETE by ID)
          /       \
        YES        NO
        │          │
        ▼          ▼
     Return    Return 200
     404       Success
    Not Found


HTTP Status Codes Summary:
─────────────────────────────────────────────────────────────
200  OK              Successful read/update/delete
201  Created         Resource successfully created (POST)
400  Bad Request     Invalid input, missing fields
404  Not Found       Resource doesn't exist
409  Conflict        Resource already exists
500  Error           Unexpected server error
```

---

## 5. Response Format Structure

```
SUCCESS - List Response
──────────────────────────────────────────────────────────
{
  "success": true,
  "data": [
    { "id": 1, "name": "Alice", ... },
    { "id": 2, "name": "Bob", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}


SUCCESS - Single Resource Response
──────────────────────────────────────────────────────────
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "CITIZEN",
    "createdAt": "2025-12-16T10:00:00Z",
    "updatedAt": "2025-12-16T10:00:00Z"
  }
}


SUCCESS - Create Response (201)
──────────────────────────────────────────────────────────
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": 3,
    "name": "Charlie",
    ...
    "createdAt": "2025-12-16T11:00:00Z"
  }
}


ERROR Response
──────────────────────────────────────────────────────────
{
  "success": false,
  "error": "Missing required fields: name, email, password"
}

HTTP Status: 400 (Bad Request)
```

---

## 6. Pagination Flow

```
Client Request:
  GET /api/users?page=2&limit=20

API Processing:
  ┌─────────────────────────────────────────┐
  │ getPaginationParams(req)                │
  │  - Extract page from query (2)          │
  │  - Extract limit from query (20)        │
  │  - Validate page >= 1 ✓                 │
  │  - Validate limit in 1-100 ✓            │
  │  - Calculate skip = (page-1) * limit    │
  │    skip = (2-1) * 20 = 20               │
  │  - Return { page: 2, limit: 20,         │
  │            skip: 20 }                   │
  └─────────────────────────────────────────┘
           │
           ▼
  Database Query:
  SELECT * FROM users
  OFFSET 20
  LIMIT 20
  
  Returns: Items 21-40 out of 150 total
           │
           ▼
  Response:
  {
    success: true,
    data: [ ... 20 items ... ],
    pagination: {
      page: 2,
      limit: 20,
      total: 150,
      totalPages: 8  ← ceil(150/20)
    }
  }

Pagination Details:
  Page 1: items 0-19   (skip=0,   limit=20)
  Page 2: items 20-39  (skip=20,  limit=20)
  Page 3: items 40-59  (skip=40,  limit=20)
  ...
  Page 8: items 140-149 (skip=140, limit=20)
```

---

## 7. Error Handling Flow

```
                    API Endpoint
                         │
                         ▼
              ┌──────────────────────┐
              │  Try {               │
              │    Validate input    │
              │    Process request   │
              │    Return response   │
              │  } Catch {           │
              │    Handle error      │
              │    Log to console    │
              │    Return 400/500    │
              │  }                   │
              └──────────────────────┘
                         │
           ┌─────────────┴──────────────┐
           │                            │
           ▼                            ▼
      SUCCESS              FAILURE (Exception)
       Return              │
      200/201             ▼
                   ┌──────────────────────┐
                   │ Error caught         │
                   │ console.error()      │
                   │ Determine type       │
                   │ Return error response│
                   └──────────────────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        Parse error    Database      Unknown
        (400)          error (500)    error (500)
             │              │              │
             ▼              ▼              ▼
        Bad Request   Server Error   Server Error
        { success:    { success:     { success:
          false,        false,         false,
          error: "..." } error: "..." } error: "..." }
```

---

## 8. Resource Relationships

```
TTA Urban Domain Model:

┌──────────────────────────────────────────────────────────┐
│                    User                                  │
│  (id, name, email, phone, role: CITIZEN/OFFICER/ADMIN)  │
│  - Citizens: File complaints                            │
│  - Officers: Manage complaints                          │
│  - Admins: Manage everything                            │
└──────────────┬──────────────────────────────────────────┘
               │
               │ creates
               ▼
┌──────────────────────────────────────────────────────────┐
│              Complaint (Main Resource)                   │
│  (id, title, description, category, status, priority)   │
│  - SUBMITTED → IN_PROGRESS → RESOLVED → CLOSED         │
│  - Priority: LOW, MEDIUM, HIGH                         │
│  - Category: INFRASTRUCTURE, TRAFFIC, SANITATION, etc. │
│  - Can have location (latitude, longitude, address)    │
│  - Can have image (imageUrl)                           │
└──────────────┬──────────────────────────────────────────┘
               │
               │ assigned to
               ▼
┌──────────────────────────────────────────────────────────┐
│                  Department                              │
│  (id, name, description)                               │
│  - Traffic Department                                   │
│  - Sanitation Department                               │
│  - Infrastructure Department                           │
└──────────────────────────────────────────────────────────┘

Related Resources (not yet implemented):
┌─────────────┐  ┌────────────────┐  ┌──────────────┐
│  Feedback   │  │ Notification   │  │  History     │
│  (ratings)  │  │  (updates)     │  │  (timeline)  │
└─────────────┘  └────────────────┘  └──────────────┘
```

---

## 9. Filtering Example (Complaints)

```
API Query:
  GET /api/complaints?status=IN_PROGRESS&priority=HIGH&page=1&limit=10

Processing:
  ┌────────────────────────────────────────────┐
  │  Extract Query Parameters                  │
  ├────────────────────────────────────────────┤
  │  status = "IN_PROGRESS"                   │
  │  priority = "HIGH"                        │
  │  page = 1                                 │
  │  limit = 10                               │
  └────────────────────────────────────────────┘
           │
           ▼
  ┌────────────────────────────────────────────┐
  │  Build WHERE Clause                       │
  ├────────────────────────────────────────────┤
  │  WHERE status = "IN_PROGRESS"             │
  │    AND priority = "HIGH"                  │
  └────────────────────────────────────────────┘
           │
           ▼
  ┌────────────────────────────────────────────┐
  │  Execute Query                             │
  ├────────────────────────────────────────────┤
  │  SELECT * FROM complaints                 │
  │  WHERE status = "IN_PROGRESS"             │
  │    AND priority = "HIGH"                  │
  │  OFFSET 0                                 │
  │  LIMIT 10                                 │
  └────────────────────────────────────────────┘
           │
           ▼
  Return filtered, paginated results

Query Combinations:
  ?status=SUBMITTED
  → Only submitted complaints
  
  ?priority=HIGH
  → Only high-priority complaints
  
  ?category=INFRASTRUCTURE
  → Only infrastructure complaints
  
  ?status=IN_PROGRESS&priority=HIGH
  → High-priority AND in-progress
  
  ?status=IN_PROGRESS&page=2&limit=25
  → Page 2 with 25 items per page (items 26-50)
```

---

## 10. API Consistency Principle

```
Consistency = Predictability = Fewer Errors = Faster Integration

Before Consistency:
  POST /api/users        → creates user
  POST /api/createUser   → also creates user?
  GET /api/getUsers      → gets users?
  /api/users/delete/1    → deletes?
  /api/users/1/update    → updates?
  → Developers confused, many mistakes

After Consistency (This Implementation):
  GET   /api/users       → Read all
  POST  /api/users       → Create new
  GET   /api/users/1     → Read one
  PUT   /api/users/1     → Replace entire
  PATCH /api/users/1     → Update fields
  DELETE /api/users/1    → Delete
  
  Applies to:
  - /api/users
  - /api/complaints
  - /api/departments
  - Future resources...
  
  → Pattern is consistent, predictable, intuitive
  → Reduces integration time
  → Fewer bugs
  → Easier to maintain
```

---

This comprehensive visual documentation helps understand the API architecture, request flow, and design principles at a glance.

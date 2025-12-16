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

### Next Steps

1. **Connect to Database**: Replace mock data with Prisma queries
	 - Uncomment TODO Prisma calls in route.ts files
	 - Install and configure Prisma

2. **Add Authentication**: Implement JWT or session-based auth
	 - Create middleware to verify user identity
	 - Protect sensitive endpoints

3. **Add Authorization**: Verify user roles and permissions
	 - Citizens can only view/create their own complaints
	 - Officers can update complaint status
	 - Admins have full access

4. **Add Validation**: Enhanced input validation
	 - Use zod or similar for schema validation
	 - Validate coordinates, file uploads, etc.

5. **Add Caching**: Improve performance
	 - Cache frequently accessed data (departments, etc.)
	 - Use Redis or similar

6. **Add Logging**: Track API usage
	 - Log all requests for debugging
	 - Monitor error rates and performance

7. **Add Rate Limiting**: Prevent abuse
	 - Limit requests per IP/user
	 - Throttle expensive operations

---

For comprehensive API documentation including all parameters, request/response examples, and error scenarios, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TTA-Urban API Documentation",
      version: "1.0.0",
      description: `
# TTA-Urban - Transparency, Traceability & Accountability System

A comprehensive API for urban civic complaint management system that ensures transparency, 
traceability, and accountability in resolving urban civic issues.

## Features
- Citizen complaint submission and tracking
- Role-based access control (Citizen, Officer, Admin)
- Department and officer management
- Real-time status updates and notifications
- Audit trail logging
- File upload and storage
- Public transparency dashboard
      `,
      contact: {
        name: "TTA-Urban Team",
        email: "support@ttaurban.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://ttaurban.azurewebsites.net",
        description: "Production server (Azure)",
      },
      {
        url: "https://your-aws-domain.com",
        description: "Production server (AWS)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            phone: { type: "string" },
            role: {
              type: "string",
              enum: ["CITIZEN", "OFFICER", "ADMIN"],
            },
            departmentId: { type: "string", format: "uuid", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Complaint: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "VERIFIED",
                "ASSIGNED",
                "IN_PROGRESS",
                "RESOLVED",
                "CLOSED",
                "REJECTED",
              ],
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            },
            location: { type: "string" },
            latitude: { type: "number", format: "float", nullable: true },
            longitude: { type: "number", format: "float", nullable: true },
            citizenId: { type: "string", format: "uuid" },
            assignedOfficerId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            departmentId: { type: "string", format: "uuid", nullable: true },
            attachments: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Department: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            headOfficerId: { type: "string", format: "uuid", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            statusCode: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["healthy", "unhealthy"] },
            timestamp: { type: "string", format: "date-time" },
            service: { type: "string" },
            environment: { type: "string" },
            uptime: { type: "number" },
            requestId: { type: "string" },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        ForbiddenError: {
          description: "User does not have permission to access this resource",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        NotFoundError: {
          description: "The specified resource was not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        ValidationError: {
          description: "Invalid input data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Complaints",
        description: "Complaint submission and management",
      },
      {
        name: "Departments",
        description: "Department management",
      },
      {
        name: "Files",
        description: "File upload and storage",
      },
      {
        name: "Health",
        description: "System health and monitoring",
      },
    ],
  },
  apis: [
    "./app/api/**/*.ts",
    "./app/api/**/*.js",
    "./pages/api/**/*.ts",
    "./pages/api/**/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;

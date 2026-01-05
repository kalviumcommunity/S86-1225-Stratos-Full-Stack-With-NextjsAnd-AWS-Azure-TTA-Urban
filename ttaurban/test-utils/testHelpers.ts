/**
 * API Testing Utilities
 *
 * Provides helper functions and mocks for testing Next.js API routes
 * Note: These are simplified for logic testing. For full E2E API testing,
 * use tools like Supertest or Playwright.
 */

/**
 * Mock Prisma client for testing
 * Provides chainable mock methods for database operations
 */
export const createMockPrisma = () => {
  const mockUser = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockComplaint = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  return {
    user: mockUser,
    complaint: mockComplaint,
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  };
};

/**
 * Mock Redis client for testing
 */
export const createMockRedis = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  disconnect: jest.fn(),
});

/**
 * Mock JWT utilities for testing
 */
export const createMockJWT = () => ({
  sign: jest.fn((payload) => `mock_token_${payload.id}`),
  verify: jest.fn((token) => ({
    id: "mock-user-id",
    email: "test@example.com",
    role: "USER",
  })),
  decode: jest.fn(),
});

/**
 * Creates a mock user object for testing
 */
export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  password: "$2b$10$hashedpassword", // Mock bcrypt hash
  role: "USER",
  phone: "1234567890",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

/**
 * Creates a mock complaint object for testing
 */
export const createMockComplaint = (overrides = {}) => ({
  id: "test-complaint-id",
  title: "Test Complaint",
  description: "Test Description",
  status: "PENDING",
  category: "ROADS",
  userId: "test-user-id",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

/**
 * Mock environment variables for testing
 */
export function mockEnv(vars: Record<string, string>) {
  const original = { ...process.env };

  Object.entries(vars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return () => {
    // Restore original env
    process.env = original;
  };
}

/**
 * Wait for a specific amount of time (useful for async tests)
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requires at least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Calculate pagination values
 */
export const calculatePagination = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
};

/**
 * Format response for testing
 */
export const createMockResponse = (data: any, status = 200) => ({
  status,
  data,
  success: status >= 200 && status < 300,
});

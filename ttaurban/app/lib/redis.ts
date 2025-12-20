import Redis from "ioredis";

/**
 * Redis Client Configuration
 * Uses REDIS_URL from environment variables or defaults to localhost
 *
 * Cache Strategy: Cache-Aside (Lazy Loading)
 * - Check cache first
 * - If miss, fetch from database and cache the result
 * - Set TTL (Time-To-Live) to expire stale data
 */

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: false, // Changed to false to connect immediately
});

// Connection event handlers
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

redis.on("close", () => {
  console.log("🔌 Redis connection closed");
});

// Helper functions for cache operations
export const cacheHelpers = {
  /**
   * Get cached data with automatic JSON parsing
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cache with automatic JSON serialization and TTL
   * @param key - Cache key
   * @param value - Data to cache
   * @param ttl - Time to live in seconds (default: 60)
   */
  async set(key: string, value: any, ttl: number = 60): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  /**
   * Delete cache key(s)
   */
  async del(...keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  },

  /**
   * Delete all keys matching a pattern
   * @param pattern - Pattern to match (e.g., "users:*")
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache pattern delete error:", error);
    }
  },

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Cache exists check error:", error);
      return false;
    }
  },

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error("Cache TTL check error:", error);
      return -1;
    }
  },
};

export default redis;

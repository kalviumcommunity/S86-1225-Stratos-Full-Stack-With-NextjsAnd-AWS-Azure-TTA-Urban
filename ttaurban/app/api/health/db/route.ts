/**
 * Quick Database Health Check API
 * Tests current database connection and returns status
 */

import { Pool } from "pg";

const handler = async (req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const startTime = Date.now();
    const result = await pool.query(
      "SELECT NOW() as server_time, version() as db_version"
    );
    const responseTime = Date.now() - startTime;

    const dbInfo = {
      status: "connected",
      serverTime: result.rows[0].server_time,
      version: result.rows[0].db_version.split(",")[0],
      responseTime: `${responseTime}ms`,
      connectionPool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };

    res.status(200).json(dbInfo);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: error.code,
    });
  } finally {
    await pool.end();
  }
};

export default handler;

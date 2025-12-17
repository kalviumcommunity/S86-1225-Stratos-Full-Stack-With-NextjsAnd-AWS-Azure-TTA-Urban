import pg from "pg";

const { Client } = pg;

async function createDatabase() {
  // Connect to postgres default database
  const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "sravani08",
    database: "postgres",
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'urban'"
    );

    if (result.rowCount === 0) {
      // Create database
      await client.query("CREATE DATABASE urban");
      console.log("✅ Database 'urban' created successfully!");
    } else {
      console.log("ℹ️  Database 'urban' already exists");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
  }
}

createDatabase();

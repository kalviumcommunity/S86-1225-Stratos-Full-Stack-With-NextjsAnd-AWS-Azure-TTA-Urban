/**
 * Cloud Database Connection Validator
 * Tests connection to AWS RDS or Azure PostgreSQL
 *
 * Usage:
 *   node scripts/test-cloud-db.js
 *   node scripts/test-cloud-db.js --provider=aws
 *   node scripts/test-cloud-db.js --provider=azure
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  // eslint-disable-next-line no-console
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const provider =
    args.find((arg) => arg.startsWith("--provider="))?.split("=")[1] || "local";
  return { provider };
}

function loadEnvFile(provider) {
  let envFile;

  switch (provider.toLowerCase()) {
    case "aws":
    case "rds":
      envFile = ".env.aws-rds";
      break;
    case "azure":
      envFile = ".env.azure-postgres";
      break;
    case "local":
    default:
      envFile = ".env.local";
      break;
  }

  const envPath = path.join(__dirname, "..", envFile);

  if (!fs.existsSync(envPath)) {
    throw new Error(`Environment file not found: ${envFile}`);
  }

  // Parse .env file
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  });

  log(`\n📄 Loaded environment from: ${envFile}`, "cyan");
  return envFile;
}

async function testConnection(provider) {
  log(`\n${"=".repeat(60)}`, "blue");
  log(`🔍 Testing ${provider.toUpperCase()} Database Connection`, "bright");
  log(`${"=".repeat(60)}\n`, "blue");

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL not found in environment variables");
  }

  // Mask password in URL for logging
  const maskedUrl = DATABASE_URL.replace(/:[^:@]+@/, ":****@");
  log(`📍 Connection String: ${maskedUrl}`, "yellow");

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: provider === "azure" ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test 1: Basic Connection
    log("\n✅ Test 1: Basic Connection", "cyan");
    const startTime = Date.now();
    await pool.query("SELECT 1");
    const connectionTime = Date.now() - startTime;
    log(`   Connected successfully in ${connectionTime}ms`, "green");

    // Test 2: Server Time
    log("\n✅ Test 2: Server Time Query", "cyan");
    const timeResult = await pool.query("SELECT NOW() as server_time");
    log(`   Server Time: ${timeResult.rows[0].server_time}`, "green");

    // Test 3: Database Version
    log("\n✅ Test 3: PostgreSQL Version", "cyan");
    const versionResult = await pool.query("SELECT version()");
    const version = versionResult.rows[0].version.split(",")[0];
    log(`   ${version}`, "green");

    // Test 4: Database Name
    log("\n✅ Test 4: Current Database", "cyan");
    const dbResult = await pool.query("SELECT current_database()");
    log(`   Database: ${dbResult.rows[0].current_database}`, "green");

    // Test 5: User Permissions
    log("\n✅ Test 5: Current User & Permissions", "cyan");
    const userResult = await pool.query("SELECT current_user, session_user");
    log(`   Current User: ${userResult.rows[0].current_user}`, "green");

    // Test 6: Check if tables exist (for migration verification)
    log("\n✅ Test 6: Database Schema Check", "cyan");
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tablesResult.rows.length > 0) {
      log(`   Found ${tablesResult.rows.length} tables:`, "green");
      tablesResult.rows.forEach((row) => {
        log(`     - ${row.tablename}`, "green");
      });
    } else {
      log("   No tables found (run migrations to create schema)", "yellow");
    }

    // Test 7: Connection Pool Stats
    log("\n✅ Test 7: Connection Pool Status", "cyan");
    log(`   Total Connections: ${pool.totalCount}`, "green");
    log(`   Idle Connections: ${pool.idleCount}`, "green");
    log(`   Waiting Requests: ${pool.waitingCount}`, "green");

    log(`\n${"=".repeat(60)}`, "blue");
    log("🎉 All tests passed successfully!", "bright");
    log(`${"=".repeat(60)}\n`, "blue");

    return true;
  } catch (error) {
    log(`\n${"=".repeat(60)}`, "red");
    log("❌ Connection Test Failed", "bright");
    log(`${"=".repeat(60)}`, "red");
    log("\nError Details:", "red");
    log(`  Code: ${error.code || "N/A"}`, "red");
    log(`  Message: ${error.message}`, "red");

    if (error.code === "ENOTFOUND") {
      log(
        "\n💡 Suggestion: Check if the database endpoint is correct",
        "yellow"
      );
    } else if (error.code === "ECONNREFUSED") {
      log(
        "\n💡 Suggestion: Check if the database is running and port is correct",
        "yellow"
      );
    } else if (error.code === "28P01") {
      log("\n💡 Suggestion: Check username and password", "yellow");
    } else if (error.code === "3D000") {
      log(
        "\n💡 Suggestion: Database does not exist, create it first",
        "yellow"
      );
    }

    log("", "reset");
    throw error;
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    const { provider } = parseArgs();
    loadEnvFile(provider);
    await testConnection(provider);
    process.exit(0);
  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}\n`, "red");
    process.exit(1);
  }
}

main();

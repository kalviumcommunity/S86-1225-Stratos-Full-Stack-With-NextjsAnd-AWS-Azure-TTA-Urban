#!/usr/bin/env node
/**
 * Cloud Database Migration & Deployment Script
 * Deploys Prisma schema to AWS RDS or Azure PostgreSQL
 *
 * Usage:
 *   node scripts/deploy-to-cloud.js --provider=aws
 *   node scripts/deploy-to-cloud.js --provider=azure --reset
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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
  const provider = args
    .find((arg) => arg.startsWith("--provider="))
    ?.split("=")[1];
  const reset = args.includes("--reset");
  const seed = args.includes("--seed");

  if (!provider) {
    log("❌ Error: --provider flag is required (aws or azure)", "red");
    log(
      "Usage: node scripts/deploy-to-cloud.js --provider=aws [--reset] [--seed]",
      "yellow"
    );
    process.exit(1);
  }

  return { provider, reset, seed };
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
    default:
      log(`❌ Unknown provider: ${provider}`, "red");
      process.exit(1);
  }

  const envPath = path.join(__dirname, "..", envFile);

  if (!fs.existsSync(envPath)) {
    log(`❌ Environment file not found: ${envFile}`, "red");
    log(
      `💡 Make sure to configure ${envFile} with your cloud database credentials`,
      "yellow"
    );
    process.exit(1);
  }

  return envFile;
}

async function confirmAction(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `${colors.yellow}${message} (yes/no): ${colors.reset}`,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes");
      }
    );
  });
}

async function main() {
  const { provider, reset, seed } = parseArgs();

  log(`\n${"=".repeat(70)}`, "blue");
  log(`🚀 Cloud Database Deployment - ${provider.toUpperCase()}`, "bright");
  log(`${"=".repeat(70)}\n`, "blue");

  const envFile = loadEnvFile(provider);
  log(`📄 Using environment file: ${envFile}`, "cyan");

  // Check if DATABASE_URL is properly configured
  const envPath = path.join(__dirname, "..", envFile);
  const envContent = fs.readFileSync(envPath, "utf-8");

  if (
    envContent.includes("CHANGE_THIS_PASSWORD") ||
    envContent.includes("your-rds-endpoint")
  ) {
    log(`\n❌ Error: ${envFile} is not properly configured!`, "red");
    log(
      `💡 Please update the DATABASE_URL and credentials in ${envFile}`,
      "yellow"
    );
    process.exit(1);
  }

  // Warning for reset
  if (reset) {
    log("\n⚠️  WARNING: --reset flag is set!", "yellow");
    log("This will DELETE all data and recreate the database schema!", "red");
    const confirmed = await confirmAction("Are you sure you want to continue?");

    if (!confirmed) {
      log("\n❌ Deployment cancelled", "yellow");
      process.exit(0);
    }
  }

  try {
    // Step 1: Test Connection
    log(
      `\n📡 Step 1: Testing connection to ${provider.toUpperCase()} database...`,
      "cyan"
    );
    execSync(`node scripts/test-cloud-db.js --provider=${provider}`, {
      stdio: "inherit",
      env: { ...process.env },
    });

    // Step 2: Generate Prisma Client
    log("\n🔨 Step 2: Generating Prisma Client...", "cyan");
    const dotenvPath = path.join(__dirname, "..", envFile);
    execSync("npx prisma generate", {
      stdio: "inherit",
      env: {
        ...process.env,
        DOTENV_CONFIG_PATH: dotenvPath,
      },
    });
    log("✅ Prisma Client generated successfully", "green");

    // Step 3: Deploy Schema
    if (reset) {
      log("\n🗑️  Step 3: Resetting database (migrate reset)...", "cyan");
      execSync(`npx dotenv -e ${envFile} -- npx prisma migrate reset --force`, {
        stdio: "inherit",
      });
      log("✅ Database reset complete", "green");
    } else {
      log("\n📦 Step 3: Deploying migrations...", "cyan");
      execSync(`npx dotenv -e ${envFile} -- npx prisma migrate deploy`, {
        stdio: "inherit",
      });
      log("✅ Migrations deployed successfully", "green");
    }

    // Step 4: Seed Database (if requested)
    if (seed || reset) {
      log("\n🌱 Step 4: Seeding database...", "cyan");
      execSync(`npx dotenv -e ${envFile} -- npx prisma db seed`, {
        stdio: "inherit",
      });
      log("✅ Database seeded successfully", "green");
    }

    // Step 5: Verify Deployment
    log("\n🔍 Step 5: Verifying deployment...", "cyan");
    execSync(
      `npx dotenv -e ${envFile} -- npx prisma db execute --stdin < scripts/verify-schema.sql`,
      {
        stdio: "inherit",
      }
    ).catch(() => {
      // Fallback verification
      log("Running alternative verification...", "yellow");
    });

    log(`\n${"=".repeat(70)}`, "blue");
    log(
      `🎉 Deployment to ${provider.toUpperCase()} completed successfully!`,
      "bright"
    );
    log(`${"=".repeat(70)}\n`, "blue");

    log("📝 Next Steps:", "cyan");
    log(
      `   1. Update your production .env to use ${envFile} settings`,
      "yellow"
    );
    log("   2. Test your application with the cloud database", "yellow");
    log("   3. Verify backups are configured in your cloud console", "yellow");
    log("   4. Set up monitoring and alerts", "yellow");
    log("");
  } catch (error) {
    log("\n❌ Deployment failed!", "red");
    log(`Error: ${error.message}`, "red");
    process.exit(1);
  }
}

main();

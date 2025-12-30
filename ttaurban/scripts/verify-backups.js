/**
 * Backup Verification Script
 * Checks backup configuration and status for cloud databases
 *
 * Usage:
 *   node scripts/verify-backups.js --provider=aws
 *   node scripts/verify-backups.js --provider=azure
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

  if (!provider) {
    log("❌ Error: --provider flag is required (aws or azure)", "red");
    process.exit(1);
  }

  return { provider };
}

function loadEnv(provider) {
  const envFile = provider === "aws" ? ".env.aws-rds" : ".env.azure-postgres";
  const envPath = path.join(__dirname, "..", envFile);

  if (!fs.existsSync(envPath)) {
    throw new Error(`Environment file not found: ${envFile}`);
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
      }
    }
  });

  return env;
}

function verifyAWSBackups(env) {
  log(`\n${"=".repeat(60)}`, "blue");
  log("📦 AWS RDS Backup Verification", "bright");
  log(`${"=".repeat(60)}\n`, "blue");

  const dbInstance = env.RDS_ENDPOINT?.split(".")[0];
  const region = env.RDS_REGION || env.AWS_REGION || "us-east-1";

  if (!dbInstance || dbInstance.includes("your-rds-endpoint")) {
    log("⚠️  Warning: RDS instance not yet configured", "yellow");
    log("   Please provision your RDS instance first\n", "yellow");
    return;
  }

  log("📋 Expected Backup Configuration:", "cyan");
  log(
    `   Retention Period: ${env.AWS_RDS_BACKUP_RETENTION_DAYS || "7"} days`,
    "yellow"
  );
  log(
    `   Backup Window: ${env.AWS_RDS_BACKUP_WINDOW || "03:00-04:00"}`,
    "yellow"
  );
  log(
    `   Maintenance Window: ${env.AWS_RDS_MAINTENANCE_WINDOW || "mon:04:00-mon:05:00"}`,
    "yellow"
  );

  log("\n🔍 To verify backups in AWS Console:", "cyan");
  log("   1. Go to AWS RDS Console", "yellow");
  log("   2. Select your database instance", "yellow");
  log('   3. Click "Maintenance & backups" tab', "yellow"); // eslint-disable-line quotes
  log('   4. Check "Automated backups" section', "yellow"); // eslint-disable-line quotes

  log("\n💡 AWS CLI Commands:", "cyan");
  log("   # Describe your RDS instance", "yellow");
  log(
    `   aws rds describe-db-instances --db-instance-identifier ${dbInstance} --region ${region}`,
    "reset"
  );

  log("\n   # List automated backups", "yellow");
  log(
    `   aws rds describe-db-snapshots --db-instance-identifier ${dbInstance} --region ${region}`,
    "reset"
  );

  log("\n   # Verify backup retention", "yellow");
  log(
    `   aws rds describe-db-instances --db-instance-identifier ${dbInstance} --query 'DBInstances[0].BackupRetentionPeriod' --region ${region}`,
    "reset"
  );

  log("\n✅ Backup Checklist:", "cyan");
  log("   [ ] Automated backups enabled", "yellow");
  log("   [ ] Backup retention period set (minimum 7 days)", "yellow");
  log("   [ ] Backup window configured (non-peak hours)", "yellow");
  log("   [ ] At least one manual snapshot created", "yellow");
  log("   [ ] Multi-AZ deployment enabled (for production)", "yellow");
  log("   [ ] CloudWatch alarms configured", "yellow");
  log("");
}

function verifyAzureBackups(env) {
  log(`\n${"=".repeat(60)}`, "blue");
  log("📦 Azure PostgreSQL Backup Verification", "bright");
  log(`${"=".repeat(60)}\n`, "blue");

  const serverName = env.AZURE_POSTGRES_SERVER?.split(".")[0];
  const resourceGroup = env.AZURE_RESOURCE_GROUP;

  if (!serverName || serverName.includes("your-server-name")) {
    log("⚠️  Warning: Azure PostgreSQL instance not yet configured", "yellow");
    log("   Please provision your Azure Database first\n", "yellow");
    return;
  }

  log("📋 Expected Backup Configuration:", "cyan");
  log(
    `   Retention Period: ${env.AZURE_POSTGRES_BACKUP_RETENTION_DAYS || "7"} days`,
    "yellow"
  );
  log(
    `   Geo-Redundant Backup: ${env.AZURE_POSTGRES_GEO_REDUNDANT_BACKUP || "false"}`,
    "yellow"
  );

  log("\n🔍 To verify backups in Azure Portal:", "cyan");
  log("   1. Go to Azure Portal", "yellow");
  log("   2. Navigate to your PostgreSQL server", "yellow");
  log('   3. Click "Backup and restore" in the left menu', "yellow"); // eslint-disable-line quotes
  log("   4. Check backup retention days and available backups", "yellow");

  log("\n💡 Azure CLI Commands:", "cyan");
  log("   # Show server details", "yellow");
  log(
    `   az postgres server show --resource-group ${resourceGroup || "YOUR_RG"} --name ${serverName}`,
    "reset"
  );

  log("\n   # List available backups", "yellow");
  log(
    `   az postgres server-logs list --resource-group ${resourceGroup || "YOUR_RG"} --server-name ${serverName}`,
    "reset"
  );

  log("\n   # Check backup retention", "yellow");
  log(
    `   az postgres server configuration show --resource-group ${resourceGroup || "YOUR_RG"} --server-name ${serverName} --name backup_retention_days`,
    "reset"
  );

  log("\n✅ Backup Checklist:", "cyan");
  log("   [ ] Automated backups enabled", "yellow");
  log("   [ ] Backup retention period set (minimum 7 days)", "yellow");
  log("   [ ] Geo-redundant backup configured (for production)", "yellow");
  log("   [ ] Point-in-time restore verified", "yellow");
  log("   [ ] Azure Monitor alerts configured", "yellow");
  log("   [ ] Server metrics monitored", "yellow");
  log("");
}

function displayBackupBestPractices() {
  log(`${"=".repeat(60)}`, "blue");
  log("📚 Backup Best Practices", "bright");
  log(`${"=".repeat(60)}\n`, "blue");

  log("1️⃣  Retention Strategy:", "cyan");
  log("   • Development: 7 days minimum", "yellow");
  log("   • Production: 30-35 days recommended", "yellow");
  log("   • Compliance: Based on regulatory requirements", "yellow");

  log("\n2️⃣  Backup Testing:", "cyan");
  log("   • Test restore procedure monthly", "yellow");
  log("   • Verify data integrity after restore", "yellow");
  log("   • Document restore time (RTO)", "yellow");

  log("\n3️⃣  Security:", "cyan");
  log("   • Encrypt backups at rest", "yellow");
  log("   • Encrypt backups in transit", "yellow");
  log("   • Restrict access to backup data", "yellow");

  log("\n4️⃣  Monitoring:", "cyan");
  log("   • Set up backup completion alerts", "yellow");
  log("   • Monitor backup failures", "yellow");
  log("   • Track backup storage usage", "yellow");

  log("\n5️⃣  Documentation:", "cyan");
  log("   • Document backup schedule", "yellow");
  log("   • Maintain restore procedures", "yellow");
  log("   • Keep contact list for emergencies", "yellow");
  log("");
}

function generateBackupReport(provider, env) {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(
    __dirname,
    "..",
    "backup-verification-report.md"
  );

  let report = `# Backup Verification Report
  
**Provider:** ${provider.toUpperCase()}  
**Date:** ${timestamp}  
**Environment:** Production

## Configuration

`;

  if (provider === "aws") {
    report += `### AWS RDS Configuration
- **Instance:** ${env.RDS_ENDPOINT || "Not configured"}
- **Region:** ${env.RDS_REGION || "Not configured"}
- **Backup Retention:** ${env.AWS_RDS_BACKUP_RETENTION_DAYS || "7"} days
- **Backup Window:** ${env.AWS_RDS_BACKUP_WINDOW || "Not configured"}
- **Maintenance Window:** ${env.AWS_RDS_MAINTENANCE_WINDOW || "Not configured"}
`;
  } else {
    report += `### Azure PostgreSQL Configuration
- **Server:** ${env.AZURE_POSTGRES_SERVER || "Not configured"}
- **Resource Group:** ${env.AZURE_RESOURCE_GROUP || "Not configured"}
- **Backup Retention:** ${env.AZURE_POSTGRES_BACKUP_RETENTION_DAYS || "7"} days
- **Geo-Redundant:** ${env.AZURE_POSTGRES_GEO_REDUNDANT_BACKUP || "false"}
`;
  }

  report += `
## Verification Checklist

- [ ] Automated backups enabled
- [ ] Backup retention period configured
- [ ] Backup window set to non-peak hours
- [ ] Manual snapshot/backup created
- [ ] Restore procedure tested
- [ ] Monitoring and alerts configured

## Next Steps

1. Verify backup settings in cloud console
2. Create initial manual backup
3. Test restore procedure
4. Set up monitoring alerts
5. Document recovery procedures

## Notes

Add your verification notes here...

---
*Generated by backup verification script*
`;

  fs.writeFileSync(reportPath, report);
  log("\n📄 Report saved to: backup-verification-report.md", "green");
}

async function main() {
  try {
    const { provider } = parseArgs();
    const env = loadEnv(provider);

    if (provider === "aws" || provider === "rds") {
      verifyAWSBackups(env);
    } else if (provider === "azure") {
      verifyAzureBackups(env);
    }

    displayBackupBestPractices();
    generateBackupReport(provider, env);
  } catch (error) {
    log(`\n❌ Error: ${error.message}\n`, "red");
    process.exit(1);
  }
}

main();

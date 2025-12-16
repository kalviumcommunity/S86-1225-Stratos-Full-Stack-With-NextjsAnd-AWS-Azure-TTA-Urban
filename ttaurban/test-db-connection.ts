import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:sravani08@localhost:5432/TTA-URBAN";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Testing database connection...\n");
  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Get database stats
    const userCount = await prisma.user.count();
    const complaintCount = await prisma.complaint.count();
    const departmentCount = await prisma.department.count();

    console.log("\n📊 Database Statistics:");
    console.log(`   Users: ${userCount}`);
    console.log(`   Complaints: ${complaintCount}`);
    console.log(`   Departments: ${departmentCount}`);

    // Fetch sample data
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("\n👥 Sample Users:");
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    await prisma.$disconnect();
    console.log("\n🎉 Connection test passed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection test failed!");
    console.error("Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

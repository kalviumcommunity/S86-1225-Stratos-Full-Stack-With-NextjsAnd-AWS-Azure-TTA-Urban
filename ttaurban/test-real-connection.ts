import { prisma } from "./app/lib/prisma";

async function testRealConnection() {
  console.log("🔍 Testing REAL database connection for Next.js app...\n");

  try {
    // Test query
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 5,
    });

    console.log("✅ Successfully connected to PostgreSQL database!");
    console.log(`\n📊 Found ${users.length} users in database:\n`);
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test complaints
    const complaints = await prisma.complaint.findMany({
      include: {
        user: { select: { name: true } },
        department: { select: { name: true } },
      },
      take: 3,
    });

    console.log(`\n✅ Found ${complaints.length} complaints:\n`);
    complaints.forEach((c) => {
      console.log(`   - "${c.title}" by ${c.user.name} - ${c.status}`);
    });

    // Test departments
    const departments = await prisma.department.findMany();
    console.log(`\n✅ Found ${departments.length} departments:\n`);
    departments.forEach((d) => {
      console.log(`   - ${d.name}`);
    });

    console.log("\n🎉 All database connections are working perfectly!");
    console.log(
      "✅ Your Next.js app is now connected to the REAL PostgreSQL database!"
    );
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealConnection();

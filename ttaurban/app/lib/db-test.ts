import { prisma } from "./prisma";

/**
 * Example: Fetch all users from the database
 */
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    console.log("✅ Successfully fetched users:", users);
    return users;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  }
}

/**
 * Example: Fetch all complaints with related data
 */
export async function getComplaints() {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        officer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("✅ Successfully fetched complaints:", complaints.length);
    return complaints;
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    throw error;
  }
}

/**
 * Example: Get complaint by ID with full details
 */
export async function getComplaintById(id: number) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        officer: true,
        auditLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
        feedback: true,
        escalations: true,
      },
    });
    console.log("✅ Successfully fetched complaint:", complaint?.id);
    return complaint;
  } catch (error) {
    console.error("❌ Error fetching complaint:", error);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful!");
    const userCount = await prisma.user.count();
    const complaintCount = await prisma.complaint.count();
    console.log(
      `📊 Database stats: ${userCount} users, ${complaintCount} complaints`
    );
    return { success: true, userCount, complaintCount };
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

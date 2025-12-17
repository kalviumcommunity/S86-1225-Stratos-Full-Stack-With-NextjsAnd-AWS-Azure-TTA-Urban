import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:sravani08@localhost:5432/urban";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Create departments
  const roadDept = await prisma.department.create({
    data: {
      name: "Road Maintenance",
      description: "Handles road repairs, potholes, and street maintenance",
    },
  });

  const waterDept = await prisma.department.create({
    data: {
      name: "Water Supply",
      description: "Manages water supply issues and pipe leaks",
    },
  });

  const electricityDept = await prisma.department.create({
    data: {
      name: "Electricity Department",
      description: "Handles power outages and electrical issues",
    },
  });

  console.log("✅ Created departments");

  // Create users
  const citizen1 = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      password: "hashed_password_123", // In production, use bcrypt
      phone: "+91-9876543210",
      role: "CITIZEN",
    },
  });

  const citizen2 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: "hashed_password_456",
      phone: "+91-9876543211",
      role: "CITIZEN",
    },
  });

  const officer1 = await prisma.user.create({
    data: {
      name: "Officer Suresh Yadav",
      email: "suresh.officer@ttaurban.gov",
      password: "hashed_password_789",
      phone: "+91-9876543212",
      role: "OFFICER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin Ramesh",
      email: "admin@ttaurban.gov",
      password: "hashed_password_admin",
      phone: "+91-9876543213",
      role: "ADMIN",
    },
  });

  console.log("✅ Created users");

  // Create complaints
  const complaint1 = await prisma.complaint.create({
    data: {
      title: "Large pothole on MG Road",
      description:
        "There is a large pothole near the traffic signal causing accidents. Immediate repair needed.",
      category: "ROAD_MAINTENANCE",
      status: "SUBMITTED",
      priority: "HIGH",
      latitude: 12.9716,
      longitude: 77.5946,
      address: "MG Road, Bangalore, Karnataka 560001",
      userId: citizen1.id,
      departmentId: roadDept.id,
    },
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      title: "Water leakage in residential area",
      description:
        "Major water pipe leakage causing flooding in the street. Water wastage is significant.",
      category: "WATER_SUPPLY",
      status: "VERIFIED",
      priority: "CRITICAL",
      latitude: 12.9352,
      longitude: 77.6245,
      address: "Whitefield, Bangalore, Karnataka 560066",
      userId: citizen2.id,
      departmentId: waterDept.id,
      assignedTo: officer1.id,
    },
  });

  const complaint3 = await prisma.complaint.create({
    data: {
      title: "Street light not working",
      description:
        "Street light has been out for 3 days, making the area unsafe at night.",
      category: "STREET_LIGHTS",
      status: "ASSIGNED",
      priority: "MEDIUM",
      latitude: 12.9141,
      longitude: 77.6411,
      address: "Koramangala, Bangalore, Karnataka 560034",
      userId: citizen1.id,
      departmentId: electricityDept.id,
      assignedTo: officer1.id,
    },
  });

  console.log("✅ Created complaints");

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      complaintId: complaint2.id,
      previousStatus: "SUBMITTED",
      newStatus: "VERIFIED",
      comment: "Complaint verified by department head",
      changedBy: "Admin Ramesh",
    },
  });

  await prisma.auditLog.create({
    data: {
      complaintId: complaint3.id,
      previousStatus: "VERIFIED",
      newStatus: "ASSIGNED",
      comment: "Assigned to Officer Suresh Yadav",
      changedBy: "Admin Ramesh",
    },
  });

  console.log("✅ Created audit logs");

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: citizen1.id,
      title: "Complaint Registered",
      message: "Your complaint #1 has been registered successfully.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: citizen2.id,
      title: "Complaint Verified",
      message:
        "Your complaint #2 has been verified and assigned to an officer.",
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: officer1.id,
      title: "New Assignment",
      message: "You have been assigned 2 new complaints.",
    },
  });

  console.log("✅ Created notifications");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

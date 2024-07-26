const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createSystemAdmin() {
  const email = process.env.SYSADMIN_EMAIL || "sysadmin@example.com";
  const password = "20242024";
  const name = "System Administrator";

  if (!password) {
    console.error("SYSADMIN_PASSWORD environment variable is not set");
    process.exit(1);
  }

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "SYS_ADMIN" },
    });

    if (existingAdmin) {
      console.log("System admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "SYS_ADMIN",
      },
    });

    console.log("System admin created successfully:", newAdmin.id);
  } catch (error) {
    console.error("Error creating system admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSystemAdmin();

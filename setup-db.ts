import { PrismaClient } from "./src/generated/prisma";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function setupDatabase(): Promise<void> {
  try {
    console.log("Checking database state...");

    // Check if tables already exist
    try {
      const result = await prisma.employee.findFirst();
      console.log("Database tables already exist, result:", result);
    } catch (error: any) {
      console.log("Database tables don't exist or error:", error.message);
    }

    console.log("Creating default admin...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log("Hashed password created");

    // Check if admin already exists
    const existingAdmin = await prisma.employee.findUnique({
      where: { email: "admin@posystem.com" }
    });

    console.log("Existing admin check result:", existingAdmin);

    if (!existingAdmin) {
      const newAdmin = await prisma.employee.create({
        data: {
          employee_id: "ADMIN001",
          name: "System Administrator",
          role: "Administrator",
          email: "admin@posystem.com",
          password_hash: hashedPassword
        }
      });
      console.log("Default admin created:", newAdmin);
    } else {
      console.log("Default admin already exists");
    }

    console.log("Creating default settings...");

    const defaultSettings = [
      {
        key: "companyName",
        value: "Your Company Name",
        type: "string",
        category: "general",
        description: "Your business name that appears on receipts and invoices"
      },
      {
        key: "license_activated",
        value: "false",
        type: "boolean",
        category: "license",
        description: "License activation status"
      }
    ];

    for (const setting of defaultSettings) {
      try {
        const result = await prisma.settings.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            type: setting.type,
            category: setting.category,
            description: setting.description
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type,
            category: setting.category,
            description: setting.description
          }
        });
        console.log(`Created/updated setting: ${setting.key}`, result);
      } catch (error: any) {
        console.log(`Setting ${setting.key} error:`, error.message);
      }
    }

    // Verify data was created
    const adminCount = await prisma.employee.count();
    const settingsCount = await prisma.settings.count();
    console.log(`Final counts - Admins: ${adminCount}, Settings: ${settingsCount}`);

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();

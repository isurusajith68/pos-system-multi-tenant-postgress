const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

async function check() {
  const employeeId = "cmi0bewz20000v82g80x59p12";

  console.log("🔍 Checking employee:", employeeId, "\n");

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      employeeRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                where: { granted: true },
                include: { permission: true }
              }
            }
          }
        }
      }
    }
  });

  if (!employee) {
    console.log("❌ Employee not found!");
  } else {
    console.log("✅ Employee:", employee.name, `(${employee.email})`);
    console.log("📋 Employee Roles:", employee.employeeRoles?.length || 0);

    if (employee.employeeRoles && employee.employeeRoles.length > 0) {
      employee.employeeRoles.forEach((er) => {
        console.log("\n  Role:", er.role.name);
        console.log("  Permissions:", er.role.rolePermissions?.length || 0);
        if (er.role.rolePermissions && er.role.rolePermissions.length > 0) {
          console.log("  Sample permissions:");
          er.role.rolePermissions.slice(0, 5).forEach((rp) => {
            console.log(`    • ${rp.permission.module}:${rp.permission.action}`);
          });
        }
      });
    } else {
      console.log("❌ No roles assigned to this employee!");
      console.log("\n🔧 This employee needs a role assigned.");
      console.log("   Run the app initialization to assign roles.");
    }
  }

  await prisma.$disconnect();
}

check().catch(console.error);

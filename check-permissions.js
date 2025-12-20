const { PrismaClient } = require("./src/generated/prisma");

const prisma = new PrismaClient();

async function checkPermissions() {
  console.log("🔍 Checking admin permissions...\n");

  const admin = await prisma.employee.findUnique({
    where: { email: "admin@posystem.com" },
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

  if (!admin) {
    console.log("❌ Admin user not found!");
    return;
  }

  console.log(`✅ Admin User: ${admin.name} (${admin.id})`);
  console.log(`📧 Email: ${admin.email}`);
  console.log(`📋 Employee Roles assigned: ${admin.employeeRoles?.length || 0}\n`);

  if (admin.employeeRoles && admin.employeeRoles.length > 0) {
    admin.employeeRoles.forEach((er, index) => {
      const role = er.role;
      console.log(`Role ${index + 1}: ${role.name}`);
      console.log(`  - Permissions: ${role.rolePermissions?.length || 0}`);

      if (role.rolePermissions && role.rolePermissions.length > 0) {
        console.log("  - Sample permissions:");
        role.rolePermissions.slice(0, 10).forEach((rp) => {
          const p = rp.permission;
          console.log(`    • ${p.module}:${p.action}${p.scope ? `:${p.scope}` : ""}`);
        });
        if (role.rolePermissions.length > 10) {
          console.log(`    ... and ${role.rolePermissions.length - 10} more`);
        }
      } else {
        console.log("    ⚠️ No permissions assigned to this role!");
      }
    });
  } else {
    console.log("❌ No roles assigned to admin user!");
  }

  // Check total permissions in system
  const allPermissions = await prisma.permission.findMany();
  console.log(`\n📊 Total permissions in system: ${allPermissions.length}`);

  // Check all roles
  const allRoles = await prisma.role.findMany();
  console.log(`📊 Total roles in system: ${allRoles.length}`);
  allRoles.forEach((r) => console.log(`  - ${r.name}`));

  await prisma.$disconnect();
}

checkPermissions().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

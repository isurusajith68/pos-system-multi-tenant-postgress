const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️ Clearing all data...");

  // Delete in order to respect foreign key constraints
  await prisma.customerTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.salesDetail.deleteMany();
  await prisma.salesInvoice.deleteMany();
  await prisma.shiftLog.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.productTagMap.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();

  // Delete role-based permission system tables
  await prisma.employeeRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  // Delete employees (must be after employeeRole)
  await prisma.employee.deleteMany();

  // Delete reports and settings
  await prisma.reportDailySalesSummary.deleteMany();
  await prisma.reportInventorySummary.deleteMany();
  await prisma.reportEmployeeSales.deleteMany();
  await prisma.reportCustomerInsights.deleteMany();
  await prisma.settings.deleteMany();

  console.log("✅ All data cleared including roles and permissions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

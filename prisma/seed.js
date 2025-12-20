const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🗑️ Clearing existing data...");
  await prisma.customerTransaction.deleteMany();
  await prisma.salesDetail.deleteMany();
  await prisma.salesInvoice.deleteMany();
  await prisma.shiftLog.deleteMany();
  await prisma.stockTransaction.deleteMany();
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
  await prisma.employee.deleteMany();
  await prisma.reportDailySalesSummary.deleteMany();
  await prisma.reportInventorySummary.deleteMany();
  await prisma.reportEmployeeSales.deleteMany();
  await prisma.reportCustomerInsights.deleteMany();

  // 1. Create Categories
  console.log("📦 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electronics"
      }
    }),
    prisma.category.create({
      data: {
        name: "Food & Beverages"
      }
    }),
    prisma.category.create({
      data: {
        name: "Clothing"
      }
    }),
    prisma.category.create({
      data: {
        name: "Books"
      }
    }),
    prisma.category.create({
      data: {
        name: "Home & Garden"
      }
    })
  ]);

  // Create subcategories
  const subcategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Smartphones",
        parentCategoryId: categories[0].id
      }
    }),
    prisma.category.create({
      data: {
        name: "Laptops",
        parentCategoryId: categories[0].id
      }
    }),
    prisma.category.create({
      data: {
        name: "Snacks",
        parentCategoryId: categories[1].id
      }
    }),
    prisma.category.create({
      data: {
        name: "Beverages",
        parentCategoryId: categories[1].id
      }
    })
  ]);

  // 2. Create Employees
  console.log("👥 Creating employees...");
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        employee_id: "EMP001",
        name: "John Doe",
        role: "Manager",
        email: "john.doe@company.com",
        password_hash: "$2b$10$dummy.hash.for.demo.purposes.only"
      }
    }),
    prisma.employee.create({
      data: {
        employee_id: "EMP002",
        name: "Jane Smith",
        role: "Cashier",
        email: "jane.smith@company.com",
        password_hash: "$2b$10$dummy.hash.for.demo.purposes.only"
      }
    }),
    prisma.employee.create({
      data: {
        employee_id: "EMP003",
        name: "Mike Johnson",
        role: "Sales Associate",
        email: "mike.johnson@company.com",
        password_hash: "$2b$10$dummy.hash.for.demo.purposes.only"
      }
    }),
    prisma.employee.create({
      data: {
        employee_id: "EMP004",
        name: "Sarah Wilson",
        role: "Supervisor",
        email: "sarah.wilson@company.com",
        password_hash: "$2b$10$dummy.hash.for.demo.purposes.only"
      }
    })
  ]);

  // 3. Create Customers
  console.log("👤 Creating customers...");
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Alice Brown",
        email: "alice.brown@email.com",
        phone: "+1-555-0101",
        loyaltyPoints: 250,
        preferences: "Electronics, Books"
      }
    }),
    prisma.customer.create({
      data: {
        name: "Bob Davis",
        email: "bob.davis@email.com",
        phone: "+1-555-0102",
        loyaltyPoints: 150,
        preferences: "Food, Beverages"
      }
    }),
    prisma.customer.create({
      data: {
        name: "Carol Miller",
        email: "carol.miller@email.com",
        phone: "+1-555-0103",
        loyaltyPoints: 320,
        preferences: "Clothing, Home & Garden"
      }
    }),
    prisma.customer.create({
      data: {
        name: "David Wilson",
        email: "david.wilson@email.com",
        phone: "+1-555-0104",
        loyaltyPoints: 75,
        preferences: "Electronics"
      }
    })
  ]);

  // 4. Create Products
  console.log("🛍️ Creating products...");
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: "ELEC001",
        barcode: "4792143134112",
        name: "iPhone 15 Pro",
        description: "Latest iPhone with advanced features",
        brand: "Apple",
        categoryId: subcategories[0].id, // Smartphones
        price: 999.99,
        discountedPrice: 949.99,
        taxRate: 0.08,
        taxInclusivePrice: 1079.99,
        unitSize: "pcs",
        stockLevel: 25
      }
    }),
    prisma.product.create({
      data: {
        sku: "ELEC002",
        barcode: "1234567890124",
        name: 'MacBook Pro 16"',
        description: "Professional laptop for creative work",
        brand: "Apple",
        categoryId: subcategories[1].id, // Laptops
        price: 2499.99,
        discountedPrice: null,
        taxRate: 0.08,
        taxInclusivePrice: 2699.99,
        unitSize: "pcs",
        stockLevel: 10
      }
    }),
    prisma.product.create({
      data: {
        sku: "FOOD001",
        barcode: "1234567890125",
        name: "Organic Potato Chips",
        description: "Healthy and delicious snack",
        brand: "Nature's Best",
        categoryId: subcategories[2].id, // Snacks
        price: 3.99,
        discountedPrice: 3.49,
        taxRate: 0.05,
        taxInclusivePrice: 4.19,
        unitSize: "g",
        stockLevel: 100
      }
    }),
    prisma.product.create({
      data: {
        sku: "BEV001",
        barcode: "1234567890126",
        name: "Coca Cola 330ml",
        description: "Classic refreshing cola drink",
        brand: "Coca Cola",
        categoryId: subcategories[3].id, // Beverages
        price: 1.99,
        discountedPrice: null,
        taxRate: 0.05,
        taxInclusivePrice: 2.09,
        unitSize: "330ml",
        stockLevel: 200
      }
    }),
    prisma.product.create({
      data: {
        sku: "CLOTH001",
        barcode: "1234567890127",
        name: "Cotton T-Shirt",
        description: "Comfortable everyday wear",
        brand: "BasicWear",
        categoryId: categories[2].id, // Clothing
        price: 19.99,
        discountedPrice: 15.99,
        taxRate: 0.08,
        taxInclusivePrice: 21.59,
        unitSize: "Medium",
        stockLevel: 50
      }
    }),
    prisma.product.create({
      data: {
        sku: "BOOK001",
        barcode: "1234567890128",
        name: "JavaScript Programming Guide",
        description: "Complete guide to modern JavaScript",
        brand: "TechBooks",
        categoryId: categories[3].id, // Books
        price: 49.99,
        discountedPrice: null,
        taxRate: 0.0,
        taxInclusivePrice: 49.99,
        unitSize: "pcs",
        stockLevel: 30
      }
    }),
    // Products with duplicate barcodes for testing
    prisma.product.create({
      data: {
        sku: "DUPLICATE001",
        barcode: "9999999999999", // Duplicate barcode
        name: "Premium Headphones",
        description: "High-quality wireless headphones",
        brand: "AudioTech",
        categoryId: subcategories[0].id, // Electronics
        price: 199.99,
        discountedPrice: 179.99,
        taxRate: 0.08,
        taxInclusivePrice: 215.99,
        unitSize: "pcs",
        stockLevel: 15
      }
    }),
    prisma.product.create({
      data: {
        sku: "DUPLICATE002",
        barcode: "9999999999999", // Same duplicate barcode
        name: "Wireless Earbuds",
        description: "Compact wireless earbuds with noise cancellation",
        brand: "AudioTech",
        categoryId: subcategories[0].id, // Electronics
        price: 149.99,
        discountedPrice: 129.99,
        taxRate: 0.08,
        taxInclusivePrice: 161.99,
        unitSize: "pcs",
        stockLevel: 25
      }
    }),
    prisma.product.create({
      data: {
        sku: "FOOD002",
        barcode: "8888888888888", // Another duplicate barcode
        name: "Chocolate Bar",
        description: "Rich dark chocolate bar",
        brand: "SweetTreats",
        categoryId: subcategories[2].id, // Snacks
        price: 2.99,
        discountedPrice: null,
        taxRate: 0.05,
        taxInclusivePrice: 3.14,
        unitSize: "g",
        stockLevel: 150
      }
    }),
    prisma.product.create({
      data: {
        sku: "FOOD003",
        barcode: "8888888888888", // Same duplicate barcode
        name: "Chocolate Cookies",
        description: "Delicious chocolate chip cookies",
        brand: "SweetTreats",
        categoryId: subcategories[2].id, // Snacks
        price: 4.99,
        discountedPrice: 4.49,
        taxRate: 0.05,
        taxInclusivePrice: 5.24,
        unitSize: "kg",
        stockLevel: 80
      }
    })
  ]);

  console.log(`   - ${categories.length + subcategories.length} categories created`);
  console.log(`   - ${employees.length} employees created`);
  console.log(`   - ${customers.length} customers created`);
  console.log(`   - ${products.length} products created`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

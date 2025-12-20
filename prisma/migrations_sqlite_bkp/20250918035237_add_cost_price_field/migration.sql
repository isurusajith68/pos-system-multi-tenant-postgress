-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "product_id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "english_name" TEXT,
    "description" TEXT,
    "brand" TEXT,
    "category_id" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "cost_price" REAL NOT NULL DEFAULT 0,
    "discounted_price" REAL,
    "tax_inclusive_price" REAL,
    "tax_rate" REAL,
    "unit_size" TEXT,
    "unit_type" TEXT,
    "unit" TEXT,
    "stock_level" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("barcode", "brand", "category_id", "created_at", "description", "discounted_price", "english_name", "name", "price", "product_id", "sku", "stock_level", "tax_inclusive_price", "tax_rate", "unit", "unit_size", "unit_type", "updated_at") SELECT "barcode", "brand", "category_id", "created_at", "description", "discounted_price", "english_name", "name", "price", "product_id", "sku", "stock_level", "tax_inclusive_price", "tax_rate", "unit", "unit_size", "unit_type", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE TABLE "new_sales_details" (
    "sales_detail_id" TEXT NOT NULL PRIMARY KEY,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "originalPrice" REAL NOT NULL DEFAULT 0,
    "cost_price" REAL NOT NULL DEFAULT 0,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "tax_rate" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_details_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices" ("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_details" ("created_at", "invoice_id", "originalPrice", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit", "unit_price", "updated_at") SELECT "created_at", "invoice_id", "originalPrice", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit", "unit_price", "updated_at" FROM "sales_details";
DROP TABLE "sales_details";
ALTER TABLE "new_sales_details" RENAME TO "sales_details";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

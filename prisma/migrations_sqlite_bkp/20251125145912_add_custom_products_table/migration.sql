-- CreateTable
CREATE TABLE "custom_products" (
    "custom_product_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sales_details" (
    "sales_detail_id" TEXT NOT NULL PRIMARY KEY,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT,
    "custom_product_id" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "originalPrice" REAL NOT NULL DEFAULT 0,
    "cost_price" REAL NOT NULL DEFAULT 0,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "tax_rate" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_details_custom_product_id_fkey" FOREIGN KEY ("custom_product_id") REFERENCES "custom_products" ("custom_product_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_details_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices" ("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_details" ("cost_price", "created_at", "invoice_id", "originalPrice", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit", "unit_price", "updated_at") SELECT "cost_price", "created_at", "invoice_id", "originalPrice", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit", "unit_price", "updated_at" FROM "sales_details";
DROP TABLE "sales_details";
ALTER TABLE "new_sales_details" RENAME TO "sales_details";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

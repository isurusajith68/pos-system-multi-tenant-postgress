/*
  Warnings:

  - You are about to alter the column `quantity` on the `inventory` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `quantity` on the `purchase_order_items` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `quantity` on the `report_inventory_summary` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `quantity` on the `sales_details` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `change_qty` on the `stock_transactions` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inventory" (
    "inventory_id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "batch_number" TEXT,
    "expiry_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_inventory" ("batch_number", "created_at", "expiry_date", "inventory_id", "product_id", "quantity", "reorder_level", "updated_at") SELECT "batch_number", "created_at", "expiry_date", "inventory_id", "product_id", "quantity", "reorder_level", "updated_at" FROM "inventory";
DROP TABLE "inventory";
ALTER TABLE "new_inventory" RENAME TO "inventory";
CREATE UNIQUE INDEX "inventory_product_id_key" ON "inventory"("product_id");
CREATE TABLE "new_purchase_order_items" (
    "po_item_id" TEXT NOT NULL PRIMARY KEY,
    "po_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "received_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "purchase_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_order_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders" ("po_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_purchase_order_items" ("created_at", "po_id", "po_item_id", "product_id", "quantity", "received_date", "unit_price", "updated_at") SELECT "created_at", "po_id", "po_item_id", "product_id", "quantity", "received_date", "unit_price", "updated_at" FROM "purchase_order_items";
DROP TABLE "purchase_order_items";
ALTER TABLE "new_purchase_order_items" RENAME TO "purchase_order_items";
CREATE TABLE "new_report_inventory_summary" (
    "report_id" TEXT NOT NULL PRIMARY KEY,
    "report_date" DATETIME NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_inventory_summary_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_report_inventory_summary" ("created_at", "product_id", "quantity", "report_date", "report_id") SELECT "created_at", "product_id", "quantity", "report_date", "report_id" FROM "report_inventory_summary";
DROP TABLE "report_inventory_summary";
ALTER TABLE "new_report_inventory_summary" RENAME TO "report_inventory_summary";
CREATE TABLE "new_sales_details" (
    "sales_detail_id" TEXT NOT NULL PRIMARY KEY,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "tax_rate" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_details_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices" ("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_details" ("created_at", "invoice_id", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit_price", "updated_at") SELECT "created_at", "invoice_id", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit_price", "updated_at" FROM "sales_details";
DROP TABLE "sales_details";
ALTER TABLE "new_sales_details" RENAME TO "sales_details";
CREATE TABLE "new_stock_transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OUT',
    "change_qty" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "transaction_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "related_invoice_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "stock_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_stock_transactions" ("change_qty", "created_at", "product_id", "reason", "related_invoice_id", "transaction_date", "transaction_id", "type", "updated_at") SELECT "change_qty", "created_at", "product_id", "reason", "related_invoice_id", "transaction_date", "transaction_id", "type", "updated_at" FROM "stock_transactions";
DROP TABLE "stock_transactions";
ALTER TABLE "new_stock_transactions" RENAME TO "stock_transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

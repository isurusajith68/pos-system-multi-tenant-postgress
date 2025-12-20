/*
  Warnings:

  - You are about to drop the `stores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `store_id` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `store_id` on the `report_inventory_summary` table. All the data in the column will be lost.
  - You are about to drop the column `store_id` on the `stock_transactions` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "stores";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inventory" (
    "inventory_id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
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
CREATE TABLE "new_report_inventory_summary" (
    "report_id" TEXT NOT NULL PRIMARY KEY,
    "report_date" DATETIME NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_inventory_summary_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_report_inventory_summary" ("created_at", "product_id", "quantity", "report_date", "report_id") SELECT "created_at", "product_id", "quantity", "report_date", "report_id" FROM "report_inventory_summary";
DROP TABLE "report_inventory_summary";
ALTER TABLE "new_report_inventory_summary" RENAME TO "report_inventory_summary";
CREATE TABLE "new_stock_transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "change_qty" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "transaction_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "related_invoice_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "stock_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_stock_transactions" ("change_qty", "created_at", "product_id", "reason", "related_invoice_id", "transaction_date", "transaction_id", "updated_at") SELECT "change_qty", "created_at", "product_id", "reason", "related_invoice_id", "transaction_date", "transaction_id", "updated_at" FROM "stock_transactions";
DROP TABLE "stock_transactions";
ALTER TABLE "new_stock_transactions" RENAME TO "stock_transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

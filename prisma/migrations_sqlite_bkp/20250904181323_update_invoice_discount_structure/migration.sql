/*
  Warnings:

  - You are about to drop the column `discount_amount` on the `sales_details` table. All the data in the column will be lost.
  - Added the required column `sub_total` to the `sales_invoices` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sales_details" (
    "sales_detail_id" TEXT NOT NULL PRIMARY KEY,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" REAL NOT NULL,
    "tax_rate" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_details_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices" ("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_details" ("created_at", "invoice_id", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit_price", "updated_at") SELECT "created_at", "invoice_id", "product_id", "quantity", "sales_detail_id", "tax_rate", "unit_price", "updated_at" FROM "sales_details";
DROP TABLE "sales_details";
ALTER TABLE "new_sales_details" RENAME TO "sales_details";
CREATE TABLE "new_sales_invoices" (
    "invoice_id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" TEXT,
    "employee_id" TEXT NOT NULL,
    "sub_total" REAL NOT NULL,
    "total_amount" REAL NOT NULL,
    "payment_mode" TEXT NOT NULL,
    "tax_amount" REAL NOT NULL DEFAULT 0,
    "discount_amount" REAL NOT NULL DEFAULT 0,
    "refund_invoice_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("customer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_invoices_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_invoices" ("created_at", "customer_id", "date", "discount_amount", "employee_id", "invoice_id", "payment_mode", "refund_invoice_id", "tax_amount", "total_amount", "updated_at") SELECT "created_at", "customer_id", "date", "discount_amount", "employee_id", "invoice_id", "payment_mode", "refund_invoice_id", "tax_amount", "total_amount", "updated_at" FROM "sales_invoices";
DROP TABLE "sales_invoices";
ALTER TABLE "new_sales_invoices" RENAME TO "sales_invoices";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

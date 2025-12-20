/*
  Warnings:

  - Added the required column `amount_received` to the `sales_invoices` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "amount_received" REAL NOT NULL,
    "refund_invoice_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("customer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_invoices_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_invoices" ("created_at", "customer_id", "date", "discount_amount", "employee_id", "invoice_id", "payment_mode", "refund_invoice_id", "sub_total", "tax_amount", "total_amount", "updated_at") SELECT "created_at", "customer_id", "date", "discount_amount", "employee_id", "invoice_id", "payment_mode", "refund_invoice_id", "sub_total", "tax_amount", "total_amount", "updated_at" FROM "sales_invoices";
DROP TABLE "sales_invoices";
ALTER TABLE "new_sales_invoices" RENAME TO "sales_invoices";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

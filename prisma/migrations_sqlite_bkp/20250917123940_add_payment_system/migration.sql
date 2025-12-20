-- CreateTable
CREATE TABLE "payments" (
    "payment_id" TEXT NOT NULL PRIMARY KEY,
    "invoice_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "payment_mode" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices" ("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "outstanding_balance" REAL NOT NULL DEFAULT 0,
    "payment_status" TEXT NOT NULL DEFAULT 'paid',
    "refund_invoice_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_invoices_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("customer_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sales_invoices" ("amount_received", "created_at", "customer_id", "date", "discount_amount", "employee_id", "invoice_id", "payment_mode", "refund_invoice_id", "sub_total", "tax_amount", "total_amount", "updated_at") SELECT "amount_received", "created_at", "customer_id", "date", "discount_amount", "employee_id", "invoice_id", "payment_mode", "refund_invoice_id", "sub_total", "tax_amount", "total_amount", "updated_at" FROM "sales_invoices";
DROP TABLE "sales_invoices";
ALTER TABLE "new_sales_invoices" RENAME TO "sales_invoices";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

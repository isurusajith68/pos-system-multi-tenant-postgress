-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stock_transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OUT',
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

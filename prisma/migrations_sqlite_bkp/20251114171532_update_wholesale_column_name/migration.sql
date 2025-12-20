/*
  Warnings:

  - You are about to drop the column `all_sale_price` on the `products` table. All the data in the column will be lost.

*/
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
    "wholesale" REAL,
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
INSERT INTO "new_products" ("barcode", "brand", "category_id", "cost_price", "created_at", "description", "discounted_price", "english_name", "name", "price", "product_id", "sku", "stock_level", "tax_inclusive_price", "tax_rate", "unit", "unit_size", "unit_type", "updated_at", "wholesale") 
SELECT "barcode", "brand", "category_id", "cost_price", "created_at", "description", "discounted_price", "english_name", "name", "price", "product_id", "sku", "stock_level", "tax_inclusive_price", "tax_rate", "unit", "unit_size", "unit_type", "updated_at", "all_sale_price" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

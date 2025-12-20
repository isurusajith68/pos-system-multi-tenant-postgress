/*
  Warnings:

  - You are about to drop the `license_validations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `licenses` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN "unit" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "license_validations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "licenses";
PRAGMA foreign_keys=on;

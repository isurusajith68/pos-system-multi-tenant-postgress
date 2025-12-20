-- CreateTable
CREATE TABLE "licenses" (
    "license_id" TEXT NOT NULL PRIMARY KEY,
    "license_key" TEXT NOT NULL,
    "license_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "max_users" INTEGER,
    "max_products" INTEGER,
    "max_transactions" INTEGER,
    "features" TEXT,
    "issued_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" DATETIME,
    "activated_date" DATETIME,
    "last_validated_date" DATETIME,
    "device_fingerprint" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "license_validations" (
    "validation_id" TEXT NOT NULL PRIMARY KEY,
    "license_id" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT false,
    "validation_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "licenses_license_key_key" ON "licenses"("license_key");

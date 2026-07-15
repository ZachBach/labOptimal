-- Create enum for scan lifecycle states.
CREATE TYPE "ScanStatus" AS ENUM ('PROCESSING', 'COMPLETE', 'FAILED');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "scan_id" TEXT NOT NULL,
    "protocol" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "foods_cache" (
    "id" TEXT NOT NULL,
    "cache_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "foods_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "scans_user_id_idx" ON "scans"("user_id");
CREATE UNIQUE INDEX "results_scan_id_key" ON "results"("scan_id");
CREATE UNIQUE INDEX "foods_cache_cache_key_key" ON "foods_cache"("cache_key");
CREATE INDEX "foods_cache_expires_at_idx" ON "foods_cache"("expires_at");

ALTER TABLE "scans"
ADD CONSTRAINT "scans_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "results"
ADD CONSTRAINT "results_scan_id_fkey"
FOREIGN KEY ("scan_id") REFERENCES "scans"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

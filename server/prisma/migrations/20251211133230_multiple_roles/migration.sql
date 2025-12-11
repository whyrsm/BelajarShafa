-- AlterTable: Add roles column and isActive column
ALTER TABLE "User" ADD COLUMN "roles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[];
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Migrate existing role data to roles array
UPDATE "User" SET "roles" = ARRAY["role"]::"UserRole"[] WHERE "role" IS NOT NULL;

-- Make roles column NOT NULL after migration
ALTER TABLE "User" ALTER COLUMN "roles" SET NOT NULL;

-- Drop the default (as per migration 20251211064051)
ALTER TABLE "User" ALTER COLUMN "roles" DROP DEFAULT;

-- Drop the old role column
ALTER TABLE "User" DROP COLUMN "role";

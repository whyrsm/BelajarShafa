-- AlterTable: Add whatsappNumber column
ALTER TABLE "User" ADD COLUMN "whatsappNumber" TEXT NOT NULL DEFAULT '';

-- Update existing users with a placeholder (you may want to update this with actual data)
-- For now, we'll set a default empty string, but in production you should backfill with actual data
-- UPDATE "User" SET "whatsappNumber" = '' WHERE "whatsappNumber" IS NULL;

-- Note: After backfilling data, you may want to remove the DEFAULT constraint
-- ALTER TABLE "User" ALTER COLUMN "whatsappNumber" DROP DEFAULT;



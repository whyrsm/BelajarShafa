-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_organizationId_fkey";

-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `createdBy` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ONLINE', 'OFFLINE');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "markedBy" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "checkInCloseMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "checkInWindowMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "meetingUrl" TEXT,
ADD COLUMN     "type" "SessionType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

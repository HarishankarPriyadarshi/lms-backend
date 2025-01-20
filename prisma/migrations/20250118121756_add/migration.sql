/*
  Warnings:

  - You are about to drop the column `classId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_classId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "classId",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

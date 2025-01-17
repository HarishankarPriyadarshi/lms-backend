/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `teacherVerificationDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationDetails` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentVerificationDetailId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherVerificationDetailId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentVerificationDetailId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherVerificationDetailId` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_classId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "teacherId";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "enrollmentNo" TEXT,
ADD COLUMN     "studentVerificationDetailId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "classId";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "teacherVerificationDetailId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "teacherVerificationDetails";

-- DropTable
DROP TABLE "verificationDetails";

-- CreateTable
CREATE TABLE "StudentVerificationDetail" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "resetOtp" TEXT,
    "otpExpiry" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "TeacherVerificationDetail" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "resetOtp" TEXT,
    "otpExpiry" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "_ClassToSubject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClassToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClassToTeacher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClassToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentVerificationDetail_id_key" ON "StudentVerificationDetail"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentVerificationDetail_email_key" ON "StudentVerificationDetail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherVerificationDetail_id_key" ON "TeacherVerificationDetail"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherVerificationDetail_email_key" ON "TeacherVerificationDetail"("email");

-- CreateIndex
CREATE INDEX "_ClassToSubject_B_index" ON "_ClassToSubject"("B");

-- CreateIndex
CREATE INDEX "_ClassToTeacher_B_index" ON "_ClassToTeacher"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentVerificationDetailId_key" ON "Student"("studentVerificationDetailId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacherVerificationDetailId_key" ON "Teacher"("teacherVerificationDetailId");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_teacherVerificationDetailId_fkey" FOREIGN KEY ("teacherVerificationDetailId") REFERENCES "TeacherVerificationDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_studentVerificationDetailId_fkey" FOREIGN KEY ("studentVerificationDetailId") REFERENCES "StudentVerificationDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToSubject" ADD CONSTRAINT "_ClassToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToSubject" ADD CONSTRAINT "_ClassToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToTeacher" ADD CONSTRAINT "_ClassToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToTeacher" ADD CONSTRAINT "_ClassToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

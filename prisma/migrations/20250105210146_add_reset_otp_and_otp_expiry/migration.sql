-- AlterTable
ALTER TABLE "verificationDetails" ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "resetOtp" TEXT;

-- CreateTable
CREATE TABLE "verificationDetails" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "verificationDetails_id_key" ON "verificationDetails"("id");

-- CreateIndex
CREATE UNIQUE INDEX "verificationDetails_email_key" ON "verificationDetails"("email");

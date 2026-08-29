-- CreateTable
CREATE TABLE "Whitelist" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminOTP" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminOTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_value_key" ON "Whitelist"("value");

-- CreateIndex
CREATE INDEX "Whitelist_type_idx" ON "Whitelist"("type");

-- CreateIndex
CREATE INDEX "AdminOTP_branchId_idx" ON "AdminOTP"("branchId");

-- CreateIndex
CREATE INDEX "AdminOTP_expiresAt_idx" ON "AdminOTP"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminOTP_contact_idx" ON "AdminOTP"("contact");

-- AddForeignKey
ALTER TABLE "AdminOTP" ADD CONSTRAINT "AdminOTP_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

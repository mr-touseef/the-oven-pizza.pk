-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "orderId" TEXT;

-- CreateIndex
CREATE INDEX "PushSubscription_orderId_idx" ON "PushSubscription"("orderId");

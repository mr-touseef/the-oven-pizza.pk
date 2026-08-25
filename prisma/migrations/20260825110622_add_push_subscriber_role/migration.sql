-- CreateEnum
CREATE TYPE "PushSubscriberRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "role" "PushSubscriberRole" NOT NULL DEFAULT 'CUSTOMER';

-- CreateIndex
CREATE INDEX "PushSubscription_role_idx" ON "PushSubscription"("role");

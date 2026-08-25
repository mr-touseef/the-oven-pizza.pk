-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'PICKUP', 'DINE_IN');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "isAdminOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'DELIVERY',
ALTER COLUMN "customerPhone" DROP NOT NULL;

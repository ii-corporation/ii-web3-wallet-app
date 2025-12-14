-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('EOA', 'SAFE');

-- CreateEnum
CREATE TYPE "SafeCreationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "user_wallets" ADD COLUMN     "safe_address" TEXT,
ADD COLUMN     "safe_created_at" TIMESTAMP(3),
ADD COLUMN     "safe_creation_error" TEXT,
ADD COLUMN     "safe_creation_status" "SafeCreationStatus",
ADD COLUMN     "safe_creation_tx_hash" TEXT,
ADD COLUMN     "wallet_type" "WalletType" NOT NULL DEFAULT 'EOA';

-- CreateIndex
CREATE INDEX "user_wallets_safe_creation_status_idx" ON "user_wallets"("safe_creation_status");

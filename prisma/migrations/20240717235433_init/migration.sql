-- AlterTable
ALTER TABLE "Redeem" ALTER COLUMN "amount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Supply" ALTER COLUMN "amount" SET DATA TYPE TEXT,
ALTER COLUMN "left_amount" SET DATA TYPE TEXT;

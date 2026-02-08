-- CreateEnum
CREATE TYPE "CreatorTier" AS ENUM ('NEW', 'VERIFIED', 'PRO');

-- CreateEnum
CREATE TYPE "CompensationType" AS ENUM ('FLAT_FEE', 'FREE_PRODUCT', 'DISCOUNT_CODE', 'HYBRID');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'CANCELLED');

-- AlterTable
ALTER TABLE "BrandProfile" ADD COLUMN     "contentNoGos" TEXT,
ADD COLUMN     "guestExperienceKeywords" JSONB,
ADD COLUMN     "vibeScales" JSONB,
ADD COLUMN     "visualRefUrls" JSONB;

-- AlterTable
ALTER TABLE "ContentRequest" ADD COLUMN     "briefTemplate" JSONB,
ADD COLUMN     "compensationDetails" JSONB,
ADD COLUMN     "compensationType" "CompensationType" NOT NULL DEFAULT 'FLAT_FEE',
ADD COLUMN     "contentGoal" TEXT,
ADD COLUMN     "creativeDirection" TEXT,
ADD COLUMN     "deliverables" JSONB,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "usageRights" TEXT;

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "tier" "CreatorTier" DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "matchSignals" JSONB;

-- AlterTable
ALTER TABLE "PortfolioItem" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "compensationDetails" JSONB,
ADD COLUMN     "compensationType" "CompensationType" NOT NULL DEFAULT 'FLAT_FEE',
ADD COLUMN     "usageRightsDoc" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'HELD';

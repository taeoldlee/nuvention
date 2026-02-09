-- AlterTable
ALTER TABLE "BrandProfile" ADD COLUMN     "cuisineTypes" JSONB;

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "cuisineSpecialties" JSONB;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "matchInsights" JSONB;

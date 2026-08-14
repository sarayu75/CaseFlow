-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "contentUpdatedAt" TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT;

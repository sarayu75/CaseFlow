/*
  Warnings:

  - The `summary` column on the `Case` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Open',
DROP COLUMN "summary",
ADD COLUMN     "summary" JSONB;

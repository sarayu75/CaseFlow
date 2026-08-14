/*
  Warnings:

  - You are about to drop the column `summary` on the `Case` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Case" DROP COLUMN "summary",
ADD COLUMN     "analysis" JSONB;

/*
  Warnings:

  - You are about to alter the column `min_value` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `DoublePrecision`.
  - You are about to alter the column `max_value` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `DoublePrecision`.
  - You are about to alter the column `correct_answer` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `DoublePrecision`.
  - You are about to alter the column `tolerance` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."Question" ALTER COLUMN "min_value" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "max_value" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "unit" SET DATA TYPE TEXT,
ALTER COLUMN "correct_answer" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "tolerance" SET DATA TYPE DOUBLE PRECISION;

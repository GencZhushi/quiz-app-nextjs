-- CreateEnum: Add NUMERIC to QuestionType
ALTER TYPE "QuestionType" ADD VALUE 'NUMERIC';

-- Add numeric-specific fields to Question table
ALTER TABLE "Question" ADD COLUMN "min_value" DECIMAL;
ALTER TABLE "Question" ADD COLUMN "max_value" DECIMAL;
ALTER TABLE "Question" ADD COLUMN "decimal_places" INTEGER DEFAULT 2;
ALTER TABLE "Question" ADD COLUMN "unit" VARCHAR(50);
ALTER TABLE "Question" ADD COLUMN "correct_answer" DECIMAL;
ALTER TABLE "Question" ADD COLUMN "tolerance" DECIMAL DEFAULT 0;

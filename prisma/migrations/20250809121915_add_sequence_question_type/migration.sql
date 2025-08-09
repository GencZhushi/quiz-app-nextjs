-- AlterEnum
ALTER TYPE "public"."QuestionType" ADD VALUE 'SEQUENCE';

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "correct_sequence" TEXT;

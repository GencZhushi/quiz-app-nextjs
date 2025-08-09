-- AlterEnum
ALTER TYPE "public"."QuestionType" ADD VALUE 'RATING';

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "rating_labels" TEXT,
ADD COLUMN     "rating_max" INTEGER DEFAULT 5,
ADD COLUMN     "rating_min" INTEGER DEFAULT 1,
ADD COLUMN     "rating_type" TEXT DEFAULT 'stars';

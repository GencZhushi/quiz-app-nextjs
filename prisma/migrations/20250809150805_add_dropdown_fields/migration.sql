-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "allow_search" BOOLEAN DEFAULT false,
ADD COLUMN     "placeholder" TEXT DEFAULT 'Select an option...',
ADD COLUMN     "show_option_numbers" BOOLEAN DEFAULT false;

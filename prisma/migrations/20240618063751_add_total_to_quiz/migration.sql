/*
  Warnings:

  - Made the column `score` on table `quizzes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;

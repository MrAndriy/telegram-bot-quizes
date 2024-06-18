-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_quizId_fkey";

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

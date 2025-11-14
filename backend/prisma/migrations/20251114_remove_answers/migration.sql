-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_id_fkey";

-- DropTable
DROP TABLE "answers";

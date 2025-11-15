-- DropForeignKey
ALTER TABLE IF EXISTS "answers" DROP CONSTRAINT IF EXISTS "answers_user_id_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "answers" DROP CONSTRAINT IF EXISTS "answers_question_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "answers";

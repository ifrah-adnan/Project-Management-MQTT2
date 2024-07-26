/*
  Warnings:

  - You are about to drop the column `user_id` on the `expertises` table. All the data in the column will be lost.
  - Added the required column `userId` to the `expertises` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expertises" DROP CONSTRAINT "expertises_user_id_fkey";

-- AlterTable
ALTER TABLE "expertises" DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "expertises" ADD CONSTRAINT "expertises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `userId` on the `expertises` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `expertises` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expertises" DROP CONSTRAINT "expertises_userId_fkey";

-- AlterTable
ALTER TABLE "expertises" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "expertises" ADD CONSTRAINT "expertises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

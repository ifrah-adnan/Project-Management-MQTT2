/*
  Warnings:

  - Added the required column `organizationId` to the `operations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "operations" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

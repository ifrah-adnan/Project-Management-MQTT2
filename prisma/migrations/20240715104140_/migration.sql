/*
  Warnings:

  - Added the required column `organization_id` to the `command_projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `sprints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "command_projects" ADD COLUMN     "organization_id" TEXT NOT NULL,
ALTER COLUMN "user_id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "sprints" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "command_projects" ADD CONSTRAINT "command_projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

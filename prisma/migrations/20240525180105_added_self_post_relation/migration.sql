-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "canRepost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

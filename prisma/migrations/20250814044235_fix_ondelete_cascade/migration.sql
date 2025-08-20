-- DropForeignKey
ALTER TABLE "public"."chat_history" DROP CONSTRAINT "chat_history_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."chat_history" ADD CONSTRAINT "chat_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

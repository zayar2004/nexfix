ALTER TABLE "knowledge_articles" ADD COLUMN IF NOT EXISTS "category" varchar(100);--> statement-breakpoint
ALTER TABLE "article_content" ADD COLUMN IF NOT EXISTS "summary" text;

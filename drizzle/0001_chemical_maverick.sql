CREATE TABLE "homepage_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" varchar(5) NOT NULL,
	"hero_heading" text NOT NULL,
	"hero_description" text NOT NULL,
	"hero_image_url" text NOT NULL,
	"is_published" varchar(10) DEFAULT 'draft' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "homepage_config_locale_unique" UNIQUE("locale")
);

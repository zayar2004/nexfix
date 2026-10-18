CREATE TYPE "public"."role" AS ENUM('user', 'staff', 'senior_admin', 'super_admin');--> statement-breakpoint
CREATE TABLE "error_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"title" varchar(300) NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "error_codes_machine_code_unique" UNIQUE("machine_id","code")
);
--> statement-breakpoint
CREATE TABLE "error_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"error_code_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"cause" text,
	"troubleshooting" text,
	"solution" text,
	"safety" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "error_content_error_locale_unique" UNIQUE("error_code_id","locale")
);
--> statement-breakpoint
CREATE TABLE "machines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "machines_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_type" varchar(20) NOT NULL,
	"owner_id" uuid NOT NULL,
	"mime" varchar(100) NOT NULL,
	"size" varchar(20) NOT NULL,
	"storage_key" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"display_name" varchar(100),
	"locale" varchar(5) DEFAULT 'my' NOT NULL,
	"theme" varchar(10) DEFAULT 'dark' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp,
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "error_codes" ADD CONSTRAINT "error_codes_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_content" ADD CONSTRAINT "error_content_error_code_id_error_codes_id_fk" FOREIGN KEY ("error_code_id") REFERENCES "public"."error_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "error_codes_code_idx" ON "error_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "error_codes_status_idx" ON "error_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "machines_code_idx" ON "machines" USING btree ("code");--> statement-breakpoint
CREATE INDEX "machines_status_idx" ON "machines" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_owner_idx" ON "media" USING btree ("owner_type","owner_id");--> statement-breakpoint
CREATE INDEX "media_status_idx" ON "media" USING btree ("status");
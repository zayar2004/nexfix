import { pgTable, uuid, text, timestamp, pgEnum, varchar, boolean, index, unique } from "drizzle-orm/pg-core";

// 1. Roles Enum
export const roleEnum = pgEnum("role", ["user", "staff", "senior_admin", "super_admin"]);

// 2. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: varchar("public_id", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("user").notNull(),
  displayName: varchar("display_name", { length: 100 }),
  locale: varchar("locale", { length: 5 }).default("my").notNull(),
  theme: varchar("theme", { length: 10 }).default("dark").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at"),
});

// 3. Sessions Table
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").notNull(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
});

// 4. Machines Table
export const machines = pgTable("machines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  archivedAt: timestamp("archived_at"),
}, (table) => ({
  codeIdx: index("machines_code_idx").on(table.code),
  statusIdx: index("machines_status_idx").on(table.status),
}));

// 5. Error Codes Table
export const errorCodes = pgTable("error_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  machineId: uuid("machine_id").references(() => machines.id, { onDelete: "cascade" }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  videoUrl: text("video_url"),
  status: varchar("status", { length: 20 }).default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  archivedAt: timestamp("archived_at"),
}, (table) => ({
  machineCodeUnique: unique("error_codes_machine_code_unique").on(table.machineId, table.code),
  codeIdx: index("error_codes_code_idx").on(table.code),
  statusIdx: index("error_codes_status_idx").on(table.status),
}));

// 6. Error Content Table
export const errorContent = pgTable("error_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  errorCodeId: uuid("error_code_id").references(() => errorCodes.id, { onDelete: "cascade" }).notNull(),
  locale: varchar("locale", { length: 5 }).notNull(),
  cause: text("cause"),
  troubleshooting: text("troubleshooting"),
  solution: text("solution"),
  safety: text("safety"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  errorLocaleUnique: unique("error_content_error_locale_unique").on(table.errorCodeId, table.locale),
}));

// 7. Media Table (Images)
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: varchar("owner_type", { length: 20 }).notNull(),
  ownerId: uuid("owner_id").notNull(),
  mime: varchar("mime", { length: 100 }).notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  storageKey: text("storage_key").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("media_owner_idx").on(table.ownerType, table.ownerId),
  statusIdx: index("media_status_idx").on(table.status),
}));

// 8. Homepage Config Table (UPDATED with new fields)
export const homepageConfig = pgTable("homepage_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  locale: varchar("locale", { length: 5 }).notNull(),
  heroHeading: text("hero_heading").notNull(),
  heroDescription: text("hero_description").notNull(),
  heroImageUrl: text("hero_image_url"),
  heroImages: text("hero_images"),
  heroConfig: text("hero_config"),
  isPublished: varchar("is_published", { length: 10 }).default("draft").notNull(),
  // NEW FIELDS
  showRecentDiagnostics: boolean("show_recent_diagnostics").default(true).notNull(),
  showRecentArticles: boolean("show_recent_articles").default(true).notNull(),
  showQuickStats: boolean("show_quick_stats").default(true).notNull(),
  announcementText: text("announcement_text"),
  announcementLink: text("announcement_link"),
  announcementEnabled: boolean("announcement_enabled").default(false).notNull(),
  announcementFontSize: varchar("announcement_font_size", { length: 10 }).default("sm").notNull(),
  announcementTextColor: varchar("announcement_text_color", { length: 10 }).default("#000000").notNull(),
  announcementBgColor: varchar("announcement_bg_color", { length: 10 }).default("#20E3FF").notNull(),
  announcementPosition: varchar("announcement_position", { length: 20 }).default("top").notNull(),
  showArcadeLabel: boolean("show_arcade_label").default(true).notNull(),
  showHeroText: boolean("show_hero_text").default(true).notNull(),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaLink: text("cta_link"),
  ctaEnabled: boolean("cta_enabled").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  localeUnique: unique("homepage_config_locale_unique").on(table.locale),
}));

// 9. Knowledge Articles Table
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).unique().notNull(),
  status: varchar("status", { length: 20 }).default("published").notNull(),
  type: varchar("type", { length: 30 }).default("article").notNull(),
  category: varchar("category", { length: 100 }),
  coverImageUrl: text("cover_image_url"),
  galleryImages: text("gallery_images"),
  heroImages: text("hero_images"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 10. Article Content Table
export const articleContent = pgTable("article_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").references(() => knowledgeArticles.id, { onDelete: "cascade" }).notNull(),
  locale: varchar("locale", { length: 5 }).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  summary: text("summary"),
  body: text("body").notNull(),
}, (table) => ({
  articleLocaleUnique: unique("article_content_article_locale_unique").on(table.articleId, table.locale),
}));

// 11. Media Videos Table
export const mediaVideos = pgTable("media_videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: varchar("owner_type", { length: 20 }).notNull(),
  ownerId: uuid("owner_id").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  title: varchar("title", { length: 200 }),
  displayOrder: varchar("display_order", { length: 10 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("media_videos_owner_idx").on(table.ownerType, table.ownerId),
}));

// 12. Presence Table
export const presence = pgTable("presence", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),
});

// 13. Notes Table
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  reminderAt: timestamp("reminder_at"),
  recurrence: varchar("recurrence", { length: 20 }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 14. Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 15. Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.isRead),
}));

// 13. Library Bookmarks Table
export const libraryBookmarks = pgTable("library_bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  articleId: uuid("article_id").references(() => knowledgeArticles.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userArticleUnique: unique("library_bookmarks_user_article_unique").on(table.userId, table.articleId),
  userIdx: index("library_bookmarks_user_idx").on(table.userId),
}));

// 14. Library Article-Machine Association (Many-to-Many)
export const libraryArticleMachines = pgTable("library_article_machines", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").references(() => knowledgeArticles.id, { onDelete: "cascade" }).notNull(),
  machineId: uuid("machine_id").references(() => machines.id, { onDelete: "cascade" }).notNull(),
}, (table) => ({
  articleMachineUnique: unique("library_article_machine_unique").on(table.articleId, table.machineId),
  articleIdx: index("library_article_machine_article_idx").on(table.articleId),
}));

// 15. Library Content Reports Table
export const libraryContentReports = pgTable("library_content_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").references(() => knowledgeArticles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  articleIdx: index("report_article_idx").on(table.articleId),
  statusIdx: index("report_status_idx").on(table.status),
}));

// 16. Admin Audit Logs Table
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  actorIdx: index("audit_actor_idx").on(table.actorId),
  entityIdx: index("audit_entity_idx").on(table.entityType, table.entityId),
}));

// 17. Library PDF Manuals Table
export const libraryPdfs = pgTable("library_pdfs", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").references(() => knowledgeArticles.id, { onDelete: "cascade" }),
  machineId: uuid("machine_id").references(() => machines.id, { onDelete: "set null" }),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  storageKey: text("storage_key").notNull(),
  size: varchar("size", { length: 20 }),
  language: varchar("language", { length: 5 }).default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  articleIdx: index("pdf_article_idx").on(table.articleId),
  machineIdx: index("pdf_machine_idx").on(table.machineId),
}));

// 18. Library View History
export const libraryViewHistory = pgTable("library_view_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  articleId: uuid("article_id").references(() => knowledgeArticles.id, { onDelete: "cascade" }).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (table) => ({
  userArticleUnique: unique("view_history_user_article_unique").on(table.userId, table.articleId),
  userViewedIdx: index("view_history_user_viewed_idx").on(table.userId, table.viewedAt),
}));

// 19. Library Page Config Table
export const libraryPageConfig = pgTable("library_page_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  locale: varchar("locale", { length: 5 }).notNull(),
  pageTitle: text("page_title").notNull().default("Knowledge Library"),
  heroImages: text("hero_images"),
  pageSubtitle: text("page_subtitle").notNull().default("Find solutions. Keep machines running."),
  heroLabel: text("hero_label").notNull().default("TECHNICAL KNOWLEDGE"),
  heroTitle: text("hero_title").notNull().default("Find Solutions. Keep Machines Running."),
  heroDescription: text("hero_description").notNull().default("Explore error codes, repair guides, machine manuals, and video tutorials."),
  heroCtaText: text("hero_cta_text").notNull().default("Explore Library"),
  searchPlaceholder: text("search_placeholder").notNull().default("Search machines, error codes, solutions..."),
  categoriesTitle: text("categories_title").notNull().default("Browse Categories"),
  machineFilterTitle: text("machine_filter_title").notNull().default("Filter by Machine"),
  recentlyViewedTitle: text("recently_viewed_title").notNull().default("Recently Viewed"),
  popularTitle: text("popular_title").notNull().default("Popular Resources"),
  isPublished: boolean("is_published").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  localeUnique: unique("library_page_config_locale_unique").on(table.locale),
}));

// 20. Library Categories Table
export const libraryCategories = pgTable("library_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("book"),
  sortOrder: varchar("sort_order", { length: 10 }).default("0"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 21. Article Versions Table
export const articleVersions = pgTable("article_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").references(() => knowledgeArticles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
}, (table) => ({
  articleIdx: index("article_version_article_idx").on(table.articleId),
}));

// 22. Lab Progress Table
export const labProgress = pgTable("lab_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  scenarioId: varchar("scenario_id", { length: 20 }).notNull(),
  attempts: varchar("attempts", { length: 10 }).default("0").notNull(),
  completed: boolean("completed").default(false).notNull(),
  score: varchar("score", { length: 10 }).default("0").notNull(),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
}, (table) => ({
  userScenarioUnique: unique("lab_progress_user_scenario_unique").on(table.userId, table.scenarioId),
  userIdx: index("lab_progress_user_idx").on(table.userId),
}));

// 23. Lab Badges Table
export const labBadges = pgTable("lab_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  badgeId: varchar("badge_id", { length: 50 }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
}, (table) => ({
  userBadgeUnique: unique("lab_badges_user_badge_unique").on(table.userId, table.badgeId),
}));

import { pgTable, uuid, text, timestamp, pgEnum, varchar, index, unique } from "drizzle-orm/pg-core";

// 1. Roles Enum
export const roleEnum = pgEnum("role", ["user", "staff", "senior_admin", "super_admin"]);

// 2. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: varchar("public_id", { length: 20 }).unique().notNull(), // e.g., NXF-12345
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("user").notNull(),
  displayName: varchar("display_name", { length: 100 }),
  locale: varchar("locale", { length: 5 }).default("my").notNull(), // 'my' or 'en'
  theme: varchar("theme", { length: 10 }).default("dark").notNull(), // 'dark' or 'light'
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

// ============================================
// PHASE 3: MACHINES, ERROR CODES, MEDIA
// ============================================

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
  status: varchar("status", { length: 20 }).default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  archivedAt: timestamp("archived_at"),
}, (table) => ({
  machineCodeUnique: unique("error_codes_machine_code_unique").on(table.machineId, table.code),
  codeIdx: index("error_codes_code_idx").on(table.code),
  statusIdx: index("error_codes_status_idx").on(table.status),
}));

// 6. Error Content (Myanmar + English)
export const errorContent = pgTable("error_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  errorCodeId: uuid("error_code_id").references(() => errorCodes.id, { onDelete: "cascade" }).notNull(),
  locale: varchar("locale", { length: 5 }).notNull(), // 'my' or 'en'
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

// 7. Media Table (Polymorphic Owner)
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: varchar("owner_type", { length: 20 }).notNull(), // 'error_code' | 'article' | 'chat'
  ownerId: uuid("owner_id").notNull(),
  mime: varchar("mime", { length: 100 }).notNull(),
  size: varchar("size", { length: 20 }).notNull(), // bytes as text
  storageKey: text("storage_key").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("media_owner_idx").on(table.ownerType, table.ownerId),
  statusIdx: index("media_status_idx").on(table.status),
}));

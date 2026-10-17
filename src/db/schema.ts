import { pgTable, uuid, text, timestamp, pgEnum, varchar } from "drizzle-orm/pg-core";

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

import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isSpotlighted: integer("is_spotlighted", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  adults: integer("adults").default(0).notNull(),
  kids: integer("kids").default(0).notNull(),
  newsletterSignups: integer("newsletter_signups").default(0).notNull(),
  volunteers: integer("volunteers").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;

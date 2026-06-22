/**
 * Users table — stores all registered students and admin users.
 * Swap the mock data in frontend pages for real API calls to /api/users
 */
import { pgTable, serial, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  college: text("college").notNull(),
  department: text("department").notNull(),
  year: integer("year").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  // role: student | low_admin | high_admin
  role: text("role").notNull().default("student"),
  reputationScore: integer("reputation_score").notNull().default(0),
  // reputationLevel: bronze | silver | gold | platinum
  reputationLevel: text("reputation_level").notNull().default("bronze"),
  verified: boolean("verified").notNull().default(false),
  cgpa: real("cgpa"),
  attendance: real("attendance"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

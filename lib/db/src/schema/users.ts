/**
 * Users table — stores all registered students and admin users.
 */
import { pgTable, serial, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  college: text("college").notNull().default(""),
  department: text("department").notNull().default(""),
  courseName: text("course_name"),
  passInYear: integer("pass_in_year"),
  passOutYear: integer("pass_out_year"),
  year: integer("year").notNull().default(1),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("student"),
  reputationScore: integer("reputation_score").notNull().default(0),
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

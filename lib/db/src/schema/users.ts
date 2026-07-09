/**
 * Users table — stores all registered students and admin users.
 */
import { pgTable, serial, text, integer, boolean, timestamp, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { collegesTable, coursesTable, courseSemestersTable } from "./academic";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  // Legacy free-text fields — kept for backward compatibility with existing
  // rows/UI. New code should prefer collegeId/courseId/semesterId below.
  college: text("college").notNull().default(""),
  department: text("department").notNull().default(""),
  courseName: text("course_name"),
  // Normalized academic scoping (nullable during rollout; backfill then
  // consider making notNull once every user is migrated).
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  courseId: integer("course_id").references(() => coursesTable.id, { onDelete: "set null" }),
  semesterId: integer("semester_id").references(() => courseSemestersTable.id, { onDelete: "set null" }),
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
  // Account-level status, independent of `verified`. Soft delete via deletedAt.
  status: text("status").notNull().default("active"), // "active" | "suspended" | "disabled"
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("users_college_id_idx").on(t.collegeId),
  index("users_course_id_idx").on(t.courseId),
  index("users_semester_id_idx").on(t.semesterId),
  index("users_role_idx").on(t.role),
  index("users_status_idx").on(t.status),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

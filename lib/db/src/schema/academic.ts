/**
 * Academic hierarchy — the core master data for a multi-college platform.
 *
 *   College ──▶ Course ──▶ Semester ──▶ Subject
 *
 * Every other table that needs to scope data to a college/course/semester/
 * subject stores a foreign key here (nullable = "global / not scoped")
 * instead of a free-text label. This is what lets the platform host many
 * colleges without a schema change: adding a college is an INSERT, not a
 * migration.
 *
 * Soft delete: every table has `status` ("active" | "disabled") plus
 * `deletedAt`. Admin "delete" sets deletedAt (data is preserved for
 * students/materials that reference it); "disable" just flips status.
 * Nothing is ever hard-deleted from these tables in normal operation.
 */
import {
  pgTable, serial, text, integer, timestamp, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ─── Colleges ─────────────────────────────────────────────── */
export const collegesTable = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),   // short code, e.g. "MIT01"
  slug: text("slug").notNull().unique(),   // url-safe, e.g. "mit-college"
  city: text("city"),
  state: text("state"),
  logoUrl: text("logo_url"),
  status: text("status").notNull().default("active"), // "active" | "disabled"
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("colleges_status_idx").on(t.status),
]);

/* ─── Courses (belong to a college) ───────────────────────── */
export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").notNull().references(() => collegesTable.id, { onDelete: "restrict" }),
  name: text("name").notNull(),            // "B.Tech Computer Science"
  code: text("code").notNull(),            // "CSE"
  durationSemesters: integer("duration_semesters").notNull().default(8),
  status: text("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex("courses_college_code_idx").on(t.collegeId, t.code),
  index("courses_college_id_idx").on(t.collegeId),
  index("courses_status_idx").on(t.status),
]);

/* ─── Course Semesters (belong to a course) ───────────────── */
export const courseSemestersTable = pgTable("course_semesters", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "restrict" }),
  number: integer("number").notNull(),     // 1..durationSemesters
  name: text("name").notNull(),            // "Semester 5"
  startDate: text("start_date"),
  endDate: text("end_date"),
  // "active" | "disabled" | "upcoming" | "archived"
  status: text("status").notNull().default("upcoming"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex("course_semesters_course_number_idx").on(t.courseId, t.number),
  index("course_semesters_course_id_idx").on(t.courseId),
  index("course_semesters_status_idx").on(t.status),
]);

/* ─── Subjects (belong to a course semester) ──────────────── */
export const subjectsTable = pgTable("subjects", {
  id: serial("id").primaryKey(),
  semesterId: integer("semester_id").notNull().references(() => courseSemestersTable.id, { onDelete: "restrict" }),
  name: text("name").notNull(),            // "Data Structures & Algorithms"
  code: text("code").notNull(),            // "CS301"
  credits: integer("credits").notNull().default(3),
  status: text("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex("subjects_semester_code_idx").on(t.semesterId, t.code),
  index("subjects_semester_id_idx").on(t.semesterId),
  index("subjects_status_idx").on(t.status),
]);

/* ─── Zod + inferred types ────────────────────────────────── */
export const insertCollegeSchema = createInsertSchema(collegesTable).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type College = typeof collegesTable.$inferSelect;

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const insertCourseSemesterSchema = createInsertSchema(courseSemestersTable).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export type InsertCourseSemester = z.infer<typeof insertCourseSemesterSchema>;
export type CourseSemester = typeof courseSemestersTable.$inferSelect;

export const insertSubjectSchema = createInsertSchema(subjectsTable).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjectsTable.$inferSelect;

/**
 * Admin & Moderator operational tables.
 * Semesters, feature registry, per-scope toggles,
 * exam schedules, and class timetables.
 */
import {
  pgTable, serial, text, integer, boolean, timestamp, index,
} from "drizzle-orm/pg-core";
import { collegesTable, coursesTable, courseSemestersTable, subjectsTable } from "./academic";

/* ─── Semesters ────────────────────────────────────────────── */
export const semestersTable = pgTable("semesters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),           // "Semester 5"
  code: text("code").notNull().unique(),  // "sem5"
  startDate: text("start_date"),
  endDate: text("end_date"),
  // "active" | "archived" | "upcoming"
  status: text("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ─── Feature Registry (admin-managed master list) ─────────── */
export const featureRegistryTable = pgTable("feature_registry", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),  // internal key, e.g. "study_hub"
  label: text("label").notNull(),         // display label, e.g. "Study Hub"
  description: text("description"),
  defaultEnabled: boolean("default_enabled").notNull().default(true),
  forcedActive: boolean("forced_active").notNull().default(false),
  retired: boolean("retired").notNull().default(false),
  // Global platform-wide switch — when off, feature disappears for every student everywhere.
  globalEnabled: boolean("global_enabled").notNull().default(true),
  // References another feature_registry.name — null for top-level features.
  // When the parent's globalEnabled is false, all children are treated as disabled too.
  parentName: text("parent_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ─── Feature Toggles (per Course × Semester scope) ───────── */
export const featureTogglesTable = pgTable("feature_toggles", {
  id: serial("id").primaryKey(),
  featureName: text("feature_name").notNull(),
  // Legacy free-text scope — kept for backward compatibility.
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  // Normalized scope. All null = platform-wide default.
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "cascade" }),
  courseId: integer("course_id").references(() => coursesTable.id, { onDelete: "cascade" }),
  semesterId: integer("semester_id").references(() => courseSemestersTable.id, { onDelete: "cascade" }),
  // Optional finer-grained scope; null = applies to every subject in the course × semester.
  subjectId: integer("subject_id").references(() => subjectsTable.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(true),
  updatedById: integer("updated_by_id"),
  updatedByName: text("updated_by_name"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("feature_toggles_scope_idx").on(t.collegeId, t.courseId, t.semesterId),
]);

/* ─── Moderator Scopes ─────────────────────────────────────── */
export const moderatorScopesTable = pgTable("moderator_scopes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Legacy free-text scope — kept for backward compatibility.
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  // Normalized scope.
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "cascade" }),
  courseId: integer("course_id").references(() => coursesTable.id, { onDelete: "cascade" }),
  semesterId: integer("semester_id").references(() => courseSemestersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("moderator_scopes_user_id_idx").on(t.userId),
]);

/* ─── Exam Schedules ───────────────────────────────────────── */
export const examSchedulesTable = pgTable("exam_schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  // Normalized scope (nullable during rollout) — powers the moderator filter bar.
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  courseId: integer("course_id").references(() => coursesTable.id, { onDelete: "set null" }),
  semesterId: integer("semester_id").references(() => courseSemestersTable.id, { onDelete: "set null" }),
  subjectId: integer("subject_id").references(() => subjectsTable.id, { onDelete: "set null" }),
  examSession: text("exam_session").notNull(),  // "End-Semester Dec 2025"
  dateFrom: text("date_from"),
  dateTo: text("date_to"),
  fileUrl: text("file_url"),
  description: text("description"),
  uploaderName: text("uploader_name"),
  uploadedById: integer("uploaded_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("exam_schedules_scope_idx").on(t.collegeId, t.courseId, t.semesterId),
]);

/* ─── Class Timetables ─────────────────────────────────────── */
export const classTimetablesTable = pgTable("class_timetables", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  section: text("section").notNull(),   // "Section A"
  // Normalized scope (nullable during rollout) — powers the moderator filter bar.
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  courseId: integer("course_id").references(() => coursesTable.id, { onDelete: "set null" }),
  semesterId: integer("semester_id").references(() => courseSemestersTable.id, { onDelete: "set null" }),
  subjectId: integer("subject_id").references(() => subjectsTable.id, { onDelete: "set null" }),
  effectiveFrom: text("effective_from"),
  effectiveTo: text("effective_to"),
  fileUrl: text("file_url"),
  description: text("description"),
  uploaderName: text("uploader_name"),
  uploadedById: integer("uploaded_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("class_timetables_scope_idx").on(t.collegeId, t.courseId, t.semesterId),
]);

/* ─── Audit Log ────────────────────────────────────────────── */
export const auditLogTable = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id"),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),        // "approve_material" | "toggle_feature" | ...
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  entityLabel: text("entity_label"),
  beforeState: text("before_state"),
  afterState: text("after_state"),
  scope: text("scope"),                    // "CS301 × Semester 5"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

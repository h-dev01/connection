/**
 * Admin & Moderator operational tables.
 * Semesters, feature registry, per-scope toggles,
 * exam schedules, and class timetables.
 */
import {
  pgTable, serial, text, integer, boolean, timestamp,
} from "drizzle-orm/pg-core";

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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ─── Feature Toggles (per Course × Semester scope) ───────── */
export const featureTogglesTable = pgTable("feature_toggles", {
  id: serial("id").primaryKey(),
  featureName: text("feature_name").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  updatedById: integer("updated_by_id"),
  updatedByName: text("updated_by_name"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ─── Moderator Scopes ─────────────────────────────────────── */
export const moderatorScopesTable = pgTable("moderator_scopes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ─── Exam Schedules ───────────────────────────────────────── */
export const examSchedulesTable = pgTable("exam_schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  examSession: text("exam_session").notNull(),  // "End-Semester Dec 2025"
  dateFrom: text("date_from"),
  dateTo: text("date_to"),
  fileUrl: text("file_url"),
  description: text("description"),
  uploaderName: text("uploader_name"),
  uploadedById: integer("uploaded_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ─── Class Timetables ─────────────────────────────────────── */
export const classTimetablesTable = pgTable("class_timetables", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  section: text("section").notNull(),   // "Section A"
  effectiveFrom: text("effective_from"),
  effectiveTo: text("effective_to"),
  fileUrl: text("file_url"),
  description: text("description"),
  uploaderName: text("uploader_name"),
  uploadedById: integer("uploaded_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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

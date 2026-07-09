/**
 * Study materials table — notes, PDFs, slides uploaded by students.
 * status lifecycle: "pending" → "approved" | "rejected"
 */
import { pgTable, serial, text, integer, boolean, timestamp, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { collegesTable, coursesTable, courseSemestersTable, subjectsTable } from "./academic";

export const studyMaterialsTable = pgTable("study_materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  // Legacy free-text labels — kept for backward compatibility.
  subject: text("subject").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  // Normalized scoping (nullable during rollout).
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  courseId: integer("course_id").references(() => coursesTable.id, { onDelete: "set null" }),
  semesterId: integer("semester_id").references(() => courseSemestersTable.id, { onDelete: "set null" }),
  subjectId: integer("subject_id").references(() => subjectsTable.id, { onDelete: "set null" }),
  fileType: text("file_type").notNull().default("pdf"),
  fileSizeMb: real("file_size_mb").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  // Approval workflow
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected"
  rejectionReason: text("rejection_reason"),
  approvedBy: text("approved_by"),
  rejectedBy: text("rejected_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  uploadedBy: text("uploaded_by").notNull(),
  sharedWith: text("shared_with"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("study_materials_college_id_idx").on(t.collegeId),
  index("study_materials_subject_id_idx").on(t.subjectId),
  index("study_materials_status_idx").on(t.status),
]);

export const insertStudyMaterialSchema = createInsertSchema(studyMaterialsTable).omit({
  id: true, createdAt: true,
});
export type InsertStudyMaterial = z.infer<typeof insertStudyMaterialSchema>;
export type StudyMaterial = typeof studyMaterialsTable.$inferSelect;

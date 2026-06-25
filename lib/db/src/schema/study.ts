/**
 * Study materials table — notes, PDFs, slides uploaded by students.
 */
import { pgTable, serial, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const studyMaterialsTable = pgTable("study_materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  course: text("course").notNull(),
  semester: text("semester").notNull(),
  // fileType: pdf | pptx | docx | figma | other
  fileType: text("file_type").notNull().default("pdf"),
  fileSizeMb: real("file_size_mb").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  uploadedBy: text("uploaded_by").notNull(),
  sharedWith: text("shared_with"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudyMaterialSchema = createInsertSchema(studyMaterialsTable).omit({
  id: true, createdAt: true,
});
export type InsertStudyMaterial = z.infer<typeof insertStudyMaterialSchema>;
export type StudyMaterial = typeof studyMaterialsTable.$inferSelect;

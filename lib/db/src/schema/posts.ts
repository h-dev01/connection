/**
 * Posts table — campus feed posts and anonymous Q&A.
 */
import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { collegesTable } from "./academic";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  authorId: integer("author_id"),
  authorName: text("author_name"),
  authorAvatar: text("author_avatar"),
  authorDept: text("author_dept"),
  authorLevel: text("author_level"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  // category: academics | events | campus_life | entertainment | announcement
  category: text("category").notNull().default("campus_life"),
  likes: integer("likes").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  anonymous: boolean("anonymous").notNull().default(false),
  status: text("status").notNull().default("active"), // "active" | "hidden" | "removed"
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("posts_college_id_idx").on(t.collegeId),
  index("posts_author_id_idx").on(t.authorId),
  index("posts_status_idx").on(t.status),
]);

export const qaTable = pgTable("qa_questions", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  authorId: integer("author_id"),
  question: text("question").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  status: text("status").notNull().default("active"), // "active" | "hidden" | "removed"
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("qa_questions_college_id_idx").on(t.collegeId),
  index("qa_questions_status_idx").on(t.status),
]);

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;

export const insertQASchema = createInsertSchema(qaTable).omit({ id: true, createdAt: true });
export type InsertQA = z.infer<typeof insertQASchema>;
export type QAQuestion = typeof qaTable.$inferSelect;

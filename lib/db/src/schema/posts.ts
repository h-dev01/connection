/**
 * Posts table — campus feed posts and anonymous Q&A.
 */
import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const qaTable = pgTable("qa_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;

export const insertQASchema = createInsertSchema(qaTable).omit({ id: true, createdAt: true });
export type InsertQA = z.infer<typeof insertQASchema>;
export type QAQuestion = typeof qaTable.$inferSelect;

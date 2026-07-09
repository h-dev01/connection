/**
 * Clubs, communities, events, internships tables.
 */
import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { collegesTable } from "./academic";

export const clubsTable = pgTable("clubs", {
  id: serial("id").primaryKey(),
  // Nullable = cross-college / platform-wide club.
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  official: boolean("official").notNull().default(false),
  trending: boolean("trending").notNull().default(false),
  imageUrl: text("image_url"),
  badge: text("badge"),
  nextEvent: text("next_event"),
  nextEventDate: text("next_event_date"),
  status: text("status").notNull().default("active"), // "active" | "disabled"
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("clubs_college_id_idx").on(t.collegeId),
  index("clubs_status_idx").on(t.status),
]);

export const communitiesTable = pgTable("communities", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  icon: text("icon").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  status: text("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("communities_college_id_idx").on(t.collegeId),
]);

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  venue: text("venue").notNull(),
  organizer: text("organizer").notNull(),
  // status: upcoming | approved | pending | cancelled
  status: text("status").notNull().default("upcoming"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("events_college_id_idx").on(t.collegeId),
  index("events_status_idx").on(t.status),
]);

export const internshipsTable = pgTable("internships", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  salary: text("salary").notNull(),
  // status: open | closed
  status: text("status").notNull().default("open"),
  logoUrl: text("logo_url"),
  isNew: boolean("is_new").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("internships_college_id_idx").on(t.collegeId),
  index("internships_status_idx").on(t.status),
]);

export const insertClubSchema = createInsertSchema(clubsTable).omit({ id: true, createdAt: true });
export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubsTable.$inferSelect;

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;

export const insertInternshipSchema = createInsertSchema(internshipsTable).omit({ id: true, createdAt: true });
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Internship = typeof internshipsTable.$inferSelect;

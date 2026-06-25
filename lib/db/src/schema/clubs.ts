/**
 * Clubs, communities, events, internships tables.
 */
import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clubsTable = pgTable("clubs", {
  id: serial("id").primaryKey(),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const communitiesTable = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  icon: text("icon").notNull(),
  color: text("color").notNull().default("#3b82f6"),
});

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  venue: text("venue").notNull(),
  organizer: text("organizer").notNull(),
  // status: upcoming | approved | pending | cancelled
  status: text("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const internshipsTable = pgTable("internships", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  salary: text("salary").notNull(),
  // status: open | closed
  status: text("status").notNull().default("open"),
  logoUrl: text("logo_url"),
  isNew: boolean("is_new").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClubSchema = createInsertSchema(clubsTable).omit({ id: true, createdAt: true });
export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubsTable.$inferSelect;

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;

export const insertInternshipSchema = createInsertSchema(internshipsTable).omit({ id: true, createdAt: true });
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Internship = typeof internshipsTable.$inferSelect;

/**
 * Ad Banners — rotating promo banners shown on the Study Hub and Marketplace
 * pages. Uploaded and managed by moderators only; students only ever see
 * `status: "active"` rows for their placement.
 *
 * Photo size is fixed on the display side (all banners render inside the
 * same 1200×400 box via `object-cover`, regardless of the uploaded image's
 * original dimensions) — see BannerCarousel on the frontend.
 */
import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  // Colleges this banner targets. Empty array = shown to every college (global banner).
  // Stored as a native Postgres integer array so we can filter with `= ANY(...)`.
  collegeIds: integer("college_ids").array().notNull().default([]),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  // Public URL of the banner image (uploaded via POST /api/moderator/upload).
  imageUrl: text("image_url").notNull(),
  // Where the banner is shown: "study" | "marketplace" | "both"
  placement: text("placement").notNull().default("both"),
  // What clicking the banner connects to: "restaurant" | "pg" | "local_service" | "none"
  linkType: text("link_type").notNull().default("none"),
  // Fixed rotation duration for this slide, in milliseconds (moderator-set, default 5s).
  durationMs: integer("duration_ms").notNull().default(5000),
  // "active" | "inactive"
  status: text("status").notNull().default("active"),
  addedByModerator: text("added_by_moderator").notNull().default("Moderator"),
  addedByModeratorId: integer("added_by_moderator_id"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("banners_placement_idx").on(t.placement),
  index("banners_status_idx").on(t.status),
]);

export const insertBannerSchema = createInsertSchema(bannersTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type BannerRow = typeof bannersTable.$inferSelect;

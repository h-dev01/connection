/**
 * Local Listings — Housing, Restaurants, Local Services near campus.
 * Managed by moderators; visible to students once approved.
 */
import {
  pgTable, serial, text, integer, timestamp, index,
} from "drizzle-orm/pg-core";
import { collegesTable } from "./academic";

export const localListingsTable = pgTable("local_listings", {
  id: serial("id").primaryKey(),
  // College scope
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  collegeName: text("college_name").notNull().default(""),
  // "housing" | "restaurant" | "local_service"
  category: text("category").notNull(),
  name: text("name").notNull(),
  // JSON array of photo URLs, e.g. '["https://...","https://..."]'
  photos: text("photos").notNull().default("[]"),
  description: text("description"),
  address: text("address"),
  contactNumber: text("contact_number"),
  googleMapsLink: text("google_maps_link"),
  // Category-specific metadata stored as JSON string.
  // Housing:       { roomType, gender, rentMin, rentMax }
  // Restaurant:    { cuisineType, deliveryAvailable }
  // Local Service: { serviceType }
  metadata: text("metadata").notNull().default("{}"),
  // "pending" | "approved" | "rejected"
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  addedByModerator: text("added_by_moderator").notNull().default("Moderator"),
  addedByModeratorId: integer("added_by_moderator_id"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("local_listings_college_id_idx").on(t.collegeId),
  index("local_listings_category_idx").on(t.category),
  index("local_listings_status_idx").on(t.status),
]);

export type LocalListing = typeof localListingsTable.$inferSelect;

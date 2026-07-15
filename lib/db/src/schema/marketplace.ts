/**
 * Marketplace listings — buy/sell items, housing (PGs), local services.
 */
import { pgTable, serial, text, integer, boolean, timestamp, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { collegesTable } from "./academic";
import { usersTable } from "./users";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => collegesTable.id, { onDelete: "set null" }),
  sellerId: integer("seller_id").references(() => usersTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  priceUnit: text("price_unit").notNull().default(""),
  category: text("category").notNull(),
  // listingType: buy_sell | housing | service | roommate
  listingType: text("listing_type").notNull().default("buy_sell"),
  imageUrl: text("image_url"),
  sellerName: text("seller_name").notNull(),
  sellerRating: real("seller_rating").notNull().default(0),
  sellerVerified: boolean("seller_verified").notNull().default(false),
  location: text("location"),
  condition: text("condition"),
  /** Roll number extracted from seller's email (before the @ sign). */
  sellerRollNo: text("seller_roll_no"),
  /** Structured contact info as JSON: { phone?, email?, instagram? } */
  contact: text("contact"),
  featured: boolean("featured").notNull().default(false),
  // status: active | sold | disabled
  status: text("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("listings_college_id_idx").on(t.collegeId),
  index("listings_seller_id_idx").on(t.sellerId),
  index("listings_status_idx").on(t.status),
]);

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true, createdAt: true,
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;

/**
 * Marketplace listings — buy/sell items, housing (PGs), local services.
 */
import { pgTable, serial, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  priceUnit: text("price_unit").notNull().default(""),
  category: text("category").notNull(),
  // listingType: buy_sell | housing | service
  listingType: text("listing_type").notNull().default("buy_sell"),
  imageUrl: text("image_url"),
  sellerName: text("seller_name").notNull(),
  sellerRating: real("seller_rating").notNull().default(0),
  sellerVerified: boolean("seller_verified").notNull().default(false),
  location: text("location"),
  condition: text("condition"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true, createdAt: true,
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;

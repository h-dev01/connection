/**
 * Marketplace routes — listings for buy/sell, housing, services.
 */
import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db, listingsTable } from "@workspace/db";

const router: IRouter = Router();

// GET /marketplace/listings — all listings
router.get("/marketplace/listings", async (_req, res): Promise<void> => {
  const listings = await db.select().from(listingsTable).orderBy(desc(listingsTable.createdAt)).limit(50);
  res.json(listings);
});

// GET /marketplace/highlights — featured listings for dashboard
router.get("/marketplace/highlights", async (_req, res): Promise<void> => {
  const listings = await db.select().from(listingsTable).where(eq(listingsTable.featured, true)).limit(3);
  res.json(listings);
});

// GET /marketplace/listings/:id
router.get("/marketplace/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!listing) { res.status(404).json({ error: "Not found" }); return; }
  res.json(listing);
});

// POST /marketplace/listings — create a listing
const CreateListing = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number(),
  priceUnit: z.string().default(""),
  category: z.string().min(1),
  listingType: z.enum(["buy_sell", "housing", "service"]).default("buy_sell"),
  imageUrl: z.string().optional(),
  sellerName: z.string().min(1),
  location: z.string().optional(),
  condition: z.string().optional(),
});

router.post("/marketplace/listings", async (req, res): Promise<void> => {
  const parsed = CreateListing.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [listing] = await db.insert(listingsTable).values(parsed.data).returning();
  res.status(201).json(listing);
});

// PATCH /marketplace/listings/:id
router.patch("/marketplace/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [listing] = await db.update(listingsTable).set(req.body).where(eq(listingsTable.id, id)).returning();
  if (!listing) { res.status(404).json({ error: "Not found" }); return; }
  res.json(listing);
});

// DELETE /marketplace/listings/:id
router.delete("/marketplace/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  res.sendStatus(204);
});

export default router;

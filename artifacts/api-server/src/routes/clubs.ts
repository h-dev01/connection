/**
 * Clubs, communities, events, internships routes.
 */
import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db, clubsTable, communitiesTable, eventsTable, internshipsTable } from "@workspace/db";

const router: IRouter = Router();

// --- Clubs ---
router.get("/clubs", async (_req, res): Promise<void> => {
  const clubs = await db.select().from(clubsTable).orderBy(desc(clubsTable.memberCount));
  res.json(clubs);
});

router.get("/clubs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [club] = await db.select().from(clubsTable).where(eq(clubsTable.id, id));
  if (!club) { res.status(404).json({ error: "Not found" }); return; }
  res.json(club);
});

router.post("/clubs", async (req, res): Promise<void> => {
  const parsed = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    imageUrl: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [club] = await db.insert(clubsTable).values(parsed.data).returning();
  res.status(201).json(club);
});

// PATCH /clubs/:id/join — toggle membership (increments member count as demo)
router.patch("/clubs/:id/join", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [club] = await db.select().from(clubsTable).where(eq(clubsTable.id, id));
  if (!club) { res.status(404).json({ error: "Not found" }); return; }
  const [updated] = await db.update(clubsTable).set({ memberCount: club.memberCount + 1 }).where(eq(clubsTable.id, id)).returning();
  res.json(updated);
});

// --- Communities ---
router.get("/communities", async (_req, res): Promise<void> => {
  const communities = await db.select().from(communitiesTable).orderBy(desc(communitiesTable.memberCount));
  res.json(communities);
});

// --- Events ---
router.get("/events", async (_req, res): Promise<void> => {
  const events = await db.select().from(eventsTable).orderBy(eventsTable.date);
  res.json(events);
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = z.object({
    title: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    venue: z.string().min(1),
    organizer: z.string().min(1),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [event] = await db.insert(eventsTable).values(parsed.data).returning();
  res.status(201).json(event);
});

// --- Internships ---
router.get("/careers/internships", async (_req, res): Promise<void> => {
  const internships = await db.select().from(internshipsTable).orderBy(desc(internshipsTable.createdAt));
  res.json(internships);
});

router.post("/careers/internships", async (req, res): Promise<void> => {
  const parsed = z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    location: z.string().min(1),
    salary: z.string().min(1),
    logoUrl: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [internship] = await db.insert(internshipsTable).values(parsed.data).returning();
  res.status(201).json(internship);
});

export default router;

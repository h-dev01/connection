/**
 * Study materials routes.
 */
import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db, studyMaterialsTable } from "@workspace/db";

const router: IRouter = Router();

// GET /study/materials — list with optional filters
router.get("/study/materials", async (req, res): Promise<void> => {
  const materials = await db.select().from(studyMaterialsTable).orderBy(desc(studyMaterialsTable.downloads)).limit(50);
  res.json(materials);
});

// GET /study/recent — for dashboard widget
router.get("/study/recent", async (_req, res): Promise<void> => {
  const materials = await db.select().from(studyMaterialsTable).orderBy(desc(studyMaterialsTable.createdAt)).limit(4);
  res.json(materials);
});

// GET /study/materials/:id
router.get("/study/materials/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [m] = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.id, id));
  if (!m) { res.status(404).json({ error: "Not found" }); return; }
  res.json(m);
});

// POST /study/materials — upload
const CreateMaterial = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  course: z.string().min(1),
  semester: z.string().min(1),
  fileType: z.string().default("pdf"),
  fileSizeMb: z.number().default(0),
  uploadedBy: z.string().min(1),
  sharedWith: z.string().optional(),
});

router.post("/study/materials", async (req, res): Promise<void> => {
  const parsed = CreateMaterial.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [m] = await db.insert(studyMaterialsTable).values(parsed.data).returning();
  res.status(201).json(m);
});

// PATCH /study/materials/:id/download — increment download counter
router.patch("/study/materials/:id/download", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [m] = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.id, id));
  if (!m) { res.status(404).json({ error: "Not found" }); return; }
  const [updated] = await db.update(studyMaterialsTable).set({ downloads: m.downloads + 1 }).where(eq(studyMaterialsTable.id, id)).returning();
  res.json(updated);
});

export default router;

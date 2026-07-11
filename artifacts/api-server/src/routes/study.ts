/**
 * Study materials routes.
 * Student-facing GET returns only approved materials.
 * Moderator approval handled in moderator.ts.
 */
import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { db, studyMaterialsTable, featureRegistryTable } from "@workspace/db";

const router: IRouter = Router();

// GET /study/feature-status — public, read-only map of featureName -> effective on/off.
// A child feature is only "on" if both it and its parent are globalEnabled (and not retired).
router.get("/study/feature-status", async (_req, res): Promise<void> => {
  const rows = await db.select().from(featureRegistryTable);
  const byName = new Map(rows.map((r) => [r.name, r]));
  const status: Record<string, boolean> = {};
  for (const r of rows) {
    if (r.retired) { status[r.name] = false; continue; }
    let enabled = r.forcedActive || r.globalEnabled;
    if (r.parentName) {
      const parent = byName.get(r.parentName);
      if (parent && !parent.retired) {
        const parentEnabled = parent.forcedActive || parent.globalEnabled;
        enabled = enabled && parentEnabled;
      }
    }
    status[r.name] = enabled;
  }
  res.json(status);
});

// GET /study/materials — approved only; supports ?collegeId=&courseId=&semesterId=&subjectId=&search=
router.get("/study/materials", async (req, res): Promise<void> => {
  const { collegeId, courseId, semesterId, subjectId, search } = req.query as Record<string, string>;

  const toInt = (v: string | undefined) => { const n = parseInt(v ?? "", 10); return isNaN(n) ? undefined : n; };
  const cid  = toInt(collegeId);
  const crid = toInt(courseId);
  const sid  = toInt(semesterId);
  const suid = toInt(subjectId);

  const materials = await db
    .select()
    .from(studyMaterialsTable)
    .where(and(
      eq(studyMaterialsTable.status, "approved"),
      cid  ? eq(studyMaterialsTable.collegeId,  cid)  : undefined,
      crid ? eq(studyMaterialsTable.courseId,   crid) : undefined,
      sid  ? eq(studyMaterialsTable.semesterId, sid)  : undefined,
      suid ? eq(studyMaterialsTable.subjectId,  suid) : undefined,
    ))
    .orderBy(desc(studyMaterialsTable.downloads))
    .limit(100);

  const result = search
    ? materials.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.subject ?? "").toLowerCase().includes(search.toLowerCase()))
    : materials;

  res.json(result);
});

// GET /study/recent — for dashboard widget (approved only)
router.get("/study/recent", async (_req, res): Promise<void> => {
  const materials = await db
    .select()
    .from(studyMaterialsTable)
    .where(eq(studyMaterialsTable.status, "approved"))
    .orderBy(desc(studyMaterialsTable.createdAt))
    .limit(4);
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

// POST /study/materials — student upload (lands in "pending")
const CreateMaterial = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  course: z.string().min(1),
  semester: z.string().min(1),
  description: z.string().optional(),
  fileType: z.string().default("pdf"),
  fileSizeMb: z.number().default(0),
  uploadedBy: z.string().min(1),
  sharedWith: z.string().optional(),
  collegeId:  z.number().int().optional(),
  courseId:   z.number().int().optional(),
  semesterId: z.number().int().optional(),
  subjectId:  z.number().int().optional(),
});

router.post("/study/materials", async (req, res): Promise<void> => {
  const parsed = CreateMaterial.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [m] = await db.insert(studyMaterialsTable)
    .values({ ...parsed.data, status: "pending" })
    .returning();
  res.status(201).json(m);
});

// PATCH /study/materials/:id/download — increment download counter
router.patch("/study/materials/:id/download", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [m] = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.id, id));
  if (!m) { res.status(404).json({ error: "Not found" }); return; }
  const [updated] = await db
    .update(studyMaterialsTable)
    .set({ downloads: m.downloads + 1 })
    .where(eq(studyMaterialsTable.id, id))
    .returning();
  res.json(updated);
});

export default router;

/**
 * Moderator routes — feature toggles, material approval, schedules.
 */
import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  studyMaterialsTable,
  featureRegistryTable,
  featureTogglesTable,
  examSchedulesTable,
  classTimetablesTable,
  auditLogTable,
} from "@workspace/db";

const router: IRouter = Router();

async function writeAudit(entry: {
  actorName: string; actorRole: string; action: string;
  entityType: string; entityId?: string; entityLabel?: string;
  beforeState?: string; afterState?: string; scope?: string;
}) {
  await db.insert(auditLogTable).values(entry);
}

/* ══════════════════════════════════════════════════════════════
   STUDY MATERIALS — approval queue
══════════════════════════════════════════════════════════════ */

// GET /api/moderator/materials?status=&collegeId=&courseId=&semesterId=&subjectId=&search=
router.get("/moderator/materials", async (req, res): Promise<void> => {
  const { status, course, semester, search } = req.query as Record<string, string>;
  const toInt = (v: string | undefined) => { const n = parseInt(v ?? "", 10); return isNaN(n) ? undefined : n; };
  const collegeId  = toInt(req.query.collegeId  as string);
  const courseId   = toInt(req.query.courseId   as string);
  const semesterId = toInt(req.query.semesterId as string);
  const subjectId  = toInt(req.query.subjectId  as string);

  let query = db.select().from(studyMaterialsTable).$dynamic();

  const conditions = [];
  if (status)     conditions.push(eq(studyMaterialsTable.status, status));
  // FK-based filters (from cascading dropdowns)
  if (collegeId)  conditions.push(eq(studyMaterialsTable.collegeId,  collegeId));
  if (courseId)   conditions.push(eq(studyMaterialsTable.courseId,   courseId));
  if (semesterId) conditions.push(eq(studyMaterialsTable.semesterId, semesterId));
  if (subjectId)  conditions.push(eq(studyMaterialsTable.subjectId,  subjectId));
  // Legacy text filters (backwards compat)
  if (!collegeId && !courseId && course) conditions.push(eq(studyMaterialsTable.course, course));
  if (!semesterId && semester) conditions.push(eq(studyMaterialsTable.semester, semester));

  if (conditions.length > 0) query = query.where(and(...conditions));

  let rows = await query.orderBy(desc(studyMaterialsTable.createdAt)).limit(200);

  // JS-side text search on title / subject
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(r =>
      r.title.toLowerCase().includes(q) ||
      (r.subject ?? "").toLowerCase().includes(q) ||
      (r.uploadedBy ?? "").toLowerCase().includes(q)
    );
  }

  res.json(rows);
});

// PATCH /api/moderator/materials/:id/approve
router.patch("/moderator/materials/:id/approve", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { approvedBy = "Moderator", note } = req.body as { approvedBy?: string; note?: string };

  const [before] = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }

  const [updated] = await db
    .update(studyMaterialsTable)
    .set({ status: "approved", verified: true, approvedBy, reviewedAt: new Date(), rejectionReason: null })
    .where(eq(studyMaterialsTable.id, id))
    .returning();

  await writeAudit({
    actorName: approvedBy, actorRole: "low_admin", action: "approve_material",
    entityType: "study_material", entityId: String(id), entityLabel: before.title,
    beforeState: before.status, afterState: "approved",
    scope: `${before.course} × ${before.semester}`,
  });

  res.json(updated);
});

// PATCH /api/moderator/materials/:id/reject
const RejectSchema = z.object({
  rejectedBy: z.string().default("Moderator"),
  rejectionReason: z.string().min(1, "Reason is required"),
});

router.patch("/moderator/materials/:id/reject", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = RejectSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const [before] = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }

  const [updated] = await db
    .update(studyMaterialsTable)
    .set({ status: "rejected", verified: false, ...parsed.data, reviewedAt: new Date() })
    .where(eq(studyMaterialsTable.id, id))
    .returning();

  await writeAudit({
    actorName: parsed.data.rejectedBy, actorRole: "low_admin", action: "reject_material",
    entityType: "study_material", entityId: String(id), entityLabel: before.title,
    beforeState: before.status, afterState: "rejected",
    scope: `${before.course} × ${before.semester}`,
  });

  res.json(updated);
});

// PATCH /api/moderator/materials/:id — edit metadata
router.patch("/moderator/materials/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const allowed = z.object({
    title: z.string().optional(),
    subject: z.string().optional(),
    course: z.string().optional(),
    semester: z.string().optional(),
  });
  const parsed = allowed.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.update(studyMaterialsTable).set(parsed.data).where(eq(studyMaterialsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// DELETE /api/moderator/materials/:id — soft delete (set status to "archived")
router.delete("/moderator/materials/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db
    .update(studyMaterialsTable)
    .set({ status: "archived" as string })
    .where(eq(studyMaterialsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await writeAudit({
    actorName: req.body?.deletedBy ?? "Moderator", actorRole: "low_admin", action: "delete_material",
    entityType: "study_material", entityId: String(id), entityLabel: row.title,
    afterState: "archived",
  });
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════════
   FEATURE TOGGLES
══════════════════════════════════════════════════════════════ */

// GET /api/moderator/toggles?course=...&semester=...
// Returns merged registry + per-scope toggle state
router.get("/moderator/toggles", async (req, res): Promise<void> => {
  const { course = "", semester = "" } = req.query as Record<string, string>;

  const registry = await db.select().from(featureRegistryTable).where(eq(featureRegistryTable.retired, false));
  const existingToggles = await db
    .select()
    .from(featureTogglesTable)
    .where(and(eq(featureTogglesTable.course, course), eq(featureTogglesTable.semester, semester)));

  const toggleMap = new Map(existingToggles.map((t) => [t.featureName, t]));

  const merged = registry.map((f) => {
    const toggle = toggleMap.get(f.name);
    return {
      featureName: f.name,
      label: f.label,
      description: f.description,
      forcedActive: f.forcedActive,
      enabled: toggle ? toggle.enabled : f.defaultEnabled,
      updatedByName: toggle?.updatedByName ?? null,
      updatedAt: toggle?.updatedAt ?? null,
    };
  });

  res.json(merged);
});

// PATCH /api/moderator/toggles/:featureName
const ToggleSchema = z.object({
  course: z.string().min(1),
  semester: z.string().min(1),
  enabled: z.boolean(),
  updatedByName: z.string().default("Moderator"),
  updatedById: z.number().optional(),
});

router.patch("/moderator/toggles/:featureName", async (req, res): Promise<void> => {
  const featureName = req.params.featureName as string;
  const parsed = ToggleSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const { course, semester, enabled, updatedByName, updatedById } = parsed.data;

  // Check if not forced active
  const [feature] = await db.select().from(featureRegistryTable).where(eq(featureRegistryTable.name, featureName));
  if (feature?.forcedActive && !enabled) {
    res.status(403).json({ error: "This feature is forced active and cannot be disabled." });
    return;
  }

  // Upsert toggle
  const existing = await db
    .select()
    .from(featureTogglesTable)
    .where(and(
      eq(featureTogglesTable.featureName, featureName),
      eq(featureTogglesTable.course, course),
      eq(featureTogglesTable.semester, semester),
    ));

  let row;
  if (existing.length > 0) {
    [row] = await db
      .update(featureTogglesTable)
      .set({ enabled, updatedByName, updatedById, updatedAt: new Date() })
      .where(eq(featureTogglesTable.id, existing[0].id))
      .returning();
  } else {
    [row] = await db
      .insert(featureTogglesTable)
      .values({ featureName, course, semester, enabled, updatedByName, updatedById })
      .returning();
  }

  await writeAudit({
    actorName: updatedByName, actorRole: "low_admin", action: "toggle_feature",
    entityType: "feature_toggle", entityLabel: featureName,
    afterState: enabled ? "enabled" : "disabled",
    scope: `${course} × ${semester}`,
  });

  res.json(row);
});

/* ══════════════════════════════════════════════════════════════
   EXAM SCHEDULES
══════════════════════════════════════════════════════════════ */

// GET /api/moderator/exam-schedules?course=...&semester=...
router.get("/moderator/exam-schedules", async (req, res): Promise<void> => {
  const { course, semester } = req.query as Record<string, string>;
  const conditions = [];
  if (course) conditions.push(eq(examSchedulesTable.course, course));
  if (semester) conditions.push(eq(examSchedulesTable.semester, semester));

  let query = db.select().from(examSchedulesTable).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  const rows = await query.orderBy(desc(examSchedulesTable.createdAt));
  res.json(rows);
});

const ExamScheduleSchema = z.object({
  title: z.string().min(1),
  course: z.string().min(1),
  semester: z.string().min(1),
  examSession: z.string().min(1),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  fileUrl: z.string().optional(),
  description: z.string().optional(),
  uploaderName: z.string().default("Moderator"),
  uploadedById: z.number().optional(),
});

// POST /api/moderator/exam-schedules
router.post("/moderator/exam-schedules", async (req, res): Promise<void> => {
  const parsed = ExamScheduleSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.insert(examSchedulesTable).values(parsed.data).returning();
  await writeAudit({ actorName: parsed.data.uploaderName, actorRole: "low_admin", action: "upload_exam_schedule", entityType: "exam_schedule", entityId: String(row.id), entityLabel: row.title, scope: `${row.course} × ${row.semester}` });
  res.status(201).json(row);
});

// PATCH /api/moderator/exam-schedules/:id
router.patch("/moderator/exam-schedules/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = ExamScheduleSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.update(examSchedulesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(examSchedulesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// DELETE /api/moderator/exam-schedules/:id
router.delete("/moderator/exam-schedules/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(examSchedulesTable).where(eq(examSchedulesTable.id, id));
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════════
   CLASS TIMETABLES
══════════════════════════════════════════════════════════════ */

// GET /api/moderator/timetables?course=...&semester=...&section=...
router.get("/moderator/timetables", async (req, res): Promise<void> => {
  const { course, semester, section } = req.query as Record<string, string>;
  const conditions = [];
  if (course) conditions.push(eq(classTimetablesTable.course, course));
  if (semester) conditions.push(eq(classTimetablesTable.semester, semester));
  if (section) conditions.push(eq(classTimetablesTable.section, section));

  let query = db.select().from(classTimetablesTable).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  const rows = await query.orderBy(desc(classTimetablesTable.createdAt));
  res.json(rows);
});

const TimetableSchema = z.object({
  title: z.string().min(1),
  course: z.string().min(1),
  semester: z.string().min(1),
  section: z.string().min(1),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  fileUrl: z.string().optional(),
  description: z.string().optional(),
  uploaderName: z.string().default("Moderator"),
  uploadedById: z.number().optional(),
});

// POST /api/moderator/timetables
router.post("/moderator/timetables", async (req, res): Promise<void> => {
  const parsed = TimetableSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.insert(classTimetablesTable).values(parsed.data).returning();
  await writeAudit({ actorName: parsed.data.uploaderName, actorRole: "low_admin", action: "upload_timetable", entityType: "timetable", entityId: String(row.id), entityLabel: row.title, scope: `${row.course} × ${row.semester} × ${row.section}` });
  res.status(201).json(row);
});

// PATCH /api/moderator/timetables/:id
router.patch("/moderator/timetables/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = TimetableSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.update(classTimetablesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(classTimetablesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// DELETE /api/moderator/timetables/:id
router.delete("/moderator/timetables/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(classTimetablesTable).where(eq(classTimetablesTable.id, id));
  res.json({ ok: true });
});

export default router;

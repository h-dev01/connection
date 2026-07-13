/**
 * Moderator routes — feature toggles, material approval, schedules.
 */
import { Router, type IRouter } from "express";
import { eq, and, desc, isNull } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  studyMaterialsTable,
  featureRegistryTable,
  featureTogglesTable,
  examSchedulesTable,
  classTimetablesTable,
  auditLogTable,
  localListingsTable,
} from "@workspace/db";
import { gte, lte, type SQL } from "drizzle-orm";

const router: IRouter = Router();

async function writeAudit(entry: {
  actorName: string; actorRole: string; action: string;
  entityType: string; entityId?: string; entityLabel?: string;
  beforeState?: string; afterState?: string; scope?: string;
}) {
  await db.insert(auditLogTable).values(entry);
}

/**
 * Shared "Moderator Filters" bar helpers — Time range (today / last 7 days /
 * last 30 days / custom range) plus College → Course → Semester → Subject
 * scoping, used across Feature Toggles, Study Materials, Exam Schedules and
 * Timetables tabs.
 */
const toInt = (v: string | undefined) => {
  const n = parseInt(v ?? "", 10);
  return isNaN(n) ? undefined : n;
};

/** Parses `dateFrom`/`dateTo` query params (ISO strings) into a date-range condition on `column`. */
function dateRangeCondition(column: Parameters<typeof gte>[0], dateFrom?: string, dateTo?: string): SQL | undefined {
  const conditions: SQL[] = [];
  if (dateFrom) {
    const d = new Date(dateFrom);
    if (!isNaN(d.getTime())) conditions.push(gte(column, d));
  }
  if (dateTo) {
    const d = new Date(dateTo);
    if (!isNaN(d.getTime())) conditions.push(lte(column, d));
  }
  if (conditions.length === 0) return undefined;
  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

/* ══════════════════════════════════════════════════════════════
   STUDY MATERIALS — approval queue
══════════════════════════════════════════════════════════════ */

// GET /api/moderator/materials?status=&collegeId=&courseId=&semesterId=&subjectId=&search=&dateFrom=&dateTo=
router.get("/moderator/materials", async (req, res): Promise<void> => {
  const { status, course, semester, search, dateFrom, dateTo } = req.query as Record<string, string>;
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
  const dateCond = dateRangeCondition(studyMaterialsTable.createdAt, dateFrom, dateTo);
  if (dateCond) conditions.push(dateCond);

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

// GET /api/moderator/toggles?course=...&semester=...&collegeId=&courseId=&semesterId=&subjectId=&dateFrom=&dateTo=
// Returns merged registry + per-scope toggle state
router.get("/moderator/toggles", async (req, res): Promise<void> => {
  const { course = "", semester = "", dateFrom, dateTo } = req.query as Record<string, string>;
  const collegeId  = toInt(req.query.collegeId  as string);
  const courseId   = toInt(req.query.courseId   as string);
  const semesterId = toInt(req.query.semesterId as string);
  const subjectId  = toInt(req.query.subjectId  as string);

  const registry = await db.select().from(featureRegistryTable).where(eq(featureRegistryTable.retired, false));

  const scopeConditions = [];
  if (courseId && semesterId) {
    scopeConditions.push(and(eq(featureTogglesTable.courseId, courseId), eq(featureTogglesTable.semesterId, semesterId)));
  } else {
    scopeConditions.push(and(eq(featureTogglesTable.course, course), eq(featureTogglesTable.semester, semester)));
  }
  if (collegeId) scopeConditions.push(eq(featureTogglesTable.collegeId, collegeId));
  if (subjectId) scopeConditions.push(eq(featureTogglesTable.subjectId, subjectId));
  const dateCond = dateRangeCondition(featureTogglesTable.updatedAt, dateFrom, dateTo);
  if (dateCond) scopeConditions.push(dateCond);

  const existingToggles = await db.select().from(featureTogglesTable).where(and(...scopeConditions));

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
  collegeId: z.number().optional(),
  courseId: z.number().optional(),
  semesterId: z.number().optional(),
  subjectId: z.number().optional(),
  enabled: z.boolean(),
  updatedByName: z.string().default("Moderator"),
  updatedById: z.number().optional(),
});

router.patch("/moderator/toggles/:featureName", async (req, res): Promise<void> => {
  const featureName = req.params.featureName as string;
  const parsed = ToggleSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const { course, semester, collegeId, courseId, semesterId, subjectId, enabled, updatedByName, updatedById } = parsed.data;

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
      .set({ enabled, updatedByName, updatedById, collegeId, courseId, semesterId, subjectId, updatedAt: new Date() })
      .where(eq(featureTogglesTable.id, existing[0].id))
      .returning();
  } else {
    [row] = await db
      .insert(featureTogglesTable)
      .values({ featureName, course, semester, collegeId, courseId, semesterId, subjectId, enabled, updatedByName, updatedById })
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

// GET /api/moderator/exam-schedules?course=...&semester=...&collegeId=&courseId=&semesterId=&subjectId=&dateFrom=&dateTo=
router.get("/moderator/exam-schedules", async (req, res): Promise<void> => {
  const { course, semester, dateFrom, dateTo } = req.query as Record<string, string>;
  const collegeId  = toInt(req.query.collegeId  as string);
  const courseId   = toInt(req.query.courseId   as string);
  const semesterId = toInt(req.query.semesterId as string);
  const subjectId  = toInt(req.query.subjectId  as string);

  const conditions = [];
  if (collegeId)  conditions.push(eq(examSchedulesTable.collegeId,  collegeId));
  if (courseId)   conditions.push(eq(examSchedulesTable.courseId,   courseId));
  if (semesterId) conditions.push(eq(examSchedulesTable.semesterId, semesterId));
  if (subjectId)  conditions.push(eq(examSchedulesTable.subjectId,  subjectId));
  if (!collegeId && !courseId && course) conditions.push(eq(examSchedulesTable.course, course));
  if (!semesterId && semester) conditions.push(eq(examSchedulesTable.semester, semester));
  const dateCond = dateRangeCondition(examSchedulesTable.createdAt, dateFrom, dateTo);
  if (dateCond) conditions.push(dateCond);

  let query = db.select().from(examSchedulesTable).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  const rows = await query.orderBy(desc(examSchedulesTable.createdAt));
  res.json(rows);
});

const ExamScheduleSchema = z.object({
  title: z.string().min(1),
  course: z.string().min(1),
  semester: z.string().min(1),
  collegeId: z.number().optional(),
  courseId: z.number().optional(),
  semesterId: z.number().optional(),
  subjectId: z.number().optional(),
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

// GET /api/moderator/timetables?course=...&semester=...&section=...&collegeId=&courseId=&semesterId=&subjectId=&dateFrom=&dateTo=
router.get("/moderator/timetables", async (req, res): Promise<void> => {
  const { course, semester, section, dateFrom, dateTo } = req.query as Record<string, string>;
  const collegeId  = toInt(req.query.collegeId  as string);
  const courseId   = toInt(req.query.courseId   as string);
  const semesterId = toInt(req.query.semesterId as string);
  const subjectId  = toInt(req.query.subjectId  as string);

  const conditions = [];
  if (collegeId)  conditions.push(eq(classTimetablesTable.collegeId,  collegeId));
  if (courseId)   conditions.push(eq(classTimetablesTable.courseId,   courseId));
  if (semesterId) conditions.push(eq(classTimetablesTable.semesterId, semesterId));
  if (subjectId)  conditions.push(eq(classTimetablesTable.subjectId,  subjectId));
  if (!collegeId && !courseId && course) conditions.push(eq(classTimetablesTable.course, course));
  if (!semesterId && semester) conditions.push(eq(classTimetablesTable.semester, semester));
  if (section) conditions.push(eq(classTimetablesTable.section, section));
  const dateCond = dateRangeCondition(classTimetablesTable.createdAt, dateFrom, dateTo);
  if (dateCond) conditions.push(dateCond);

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
  collegeId: z.number().optional(),
  courseId: z.number().optional(),
  semesterId: z.number().optional(),
  subjectId: z.number().optional(),
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

/* ══════════════════════════════════════════════════════════════
   LOCAL LISTINGS — Housing / Restaurants / Local Services
══════════════════════════════════════════════════════════════ */

// GET /api/moderator/local-listings
router.get("/moderator/local-listings", async (req, res): Promise<void> => {
  const toInt = (v: string | undefined) => { const n = parseInt(v ?? "", 10); return isNaN(n) ? undefined : n; };
  const collegeId = toInt(req.query.collegeId as string);
  const { category, status, search, roomType, gender, cuisineTypes, deliveryAvailable, serviceType } = req.query as Record<string, string>;
  // Comma-separated list of selected cuisines — a listing matches if it has ANY of them.
  const cuisineList = cuisineTypes ? cuisineTypes.split(",").map(s => s.trim()).filter(Boolean) : [];

  let query = db.select().from(localListingsTable).$dynamic();
  const conditions: ReturnType<typeof isNull | typeof eq>[] = [isNull(localListingsTable.deletedAt)];

  if (collegeId) conditions.push(eq(localListingsTable.collegeId, collegeId));
  if (category)  conditions.push(eq(localListingsTable.category, category));
  if (status)    conditions.push(eq(localListingsTable.status, status));

  query = query.where(and(...conditions));
  // Order: higher priorityScore first, then newer displayDate, then newer createdAt
  let rows = await query
    .orderBy(desc(localListingsTable.priorityScore), desc(localListingsTable.displayDate), desc(localListingsTable.createdAt))
    .limit(500);

  // JS-side filters for search and metadata fields
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      (r.address ?? "").toLowerCase().includes(q)
    );
  }

  // Metadata filters (parsed from JSON)
  if (roomType || gender || cuisineList.length > 0 || deliveryAvailable !== undefined && deliveryAvailable !== "" || serviceType) {
    rows = rows.filter(r => {
      let meta: Record<string, unknown> = {};
      try { meta = JSON.parse(r.metadata); } catch { /* skip */ }
      if (roomType && meta.roomType !== roomType) return false;
      if (gender && meta.gender !== gender) return false;
      if (cuisineList.length > 0) {
        // Support both the new multi-select `cuisineTypes` array and the legacy single `cuisineType` string.
        const listingCuisines: string[] = Array.isArray(meta.cuisineTypes)
          ? meta.cuisineTypes as string[]
          : (meta.cuisineType ? [meta.cuisineType as string] : []);
        if (!listingCuisines.some(c => cuisineList.includes(c))) return false;
      }
      if (deliveryAvailable === "true" && meta.deliveryAvailable !== true) return false;
      if (deliveryAvailable === "false" && meta.deliveryAvailable !== false) return false;
      if (serviceType && meta.serviceType !== serviceType) return false;
      return true;
    });
  }

  res.json(rows);
});

const LocalListingSchema = z.object({
  collegeId: z.number().optional(),
  collegeName: z.string().default(""),
  category: z.enum(["housing", "restaurant", "local_service"]),
  name: z.string().min(1, "Name is required"),
  photos: z.string().default("[]"),       // JSON array string
  description: z.string().optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  googleMapsLink: z.string().optional(),
  metadata: z.string().default("{}"),     // JSON object string
  addedByModerator: z.string().default("Moderator"),
  addedByModeratorId: z.number().optional(),
  // Internal ordering fields — moderator-only, never shown to students
  priorityScore: z.number().int().min(0).default(0),
  displayDate: z.string().datetime({ offset: true }).optional().or(z.literal("")).transform(v => v ? new Date(v) : null),
});

// POST /api/moderator/local-listings
router.post("/moderator/local-listings", async (req, res): Promise<void> => {
  const parsed = LocalListingSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const [row] = await db.insert(localListingsTable).values(parsed.data).returning();

  await writeAudit({
    actorName: parsed.data.addedByModerator, actorRole: "low_admin",
    action: "create_local_listing", entityType: "local_listing",
    entityId: String(row.id), entityLabel: row.name,
    afterState: JSON.stringify({ category: row.category, status: row.status }),
    scope: row.collegeName || String(row.collegeId ?? ""),
  });

  res.status(201).json(row);
});

// PATCH /api/moderator/local-listings/:id
router.patch("/moderator/local-listings/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = LocalListingSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const [row] = await db
    .update(localListingsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(localListingsTable.id, id))
    .returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  await writeAudit({
    actorName: parsed.data.addedByModerator ?? "Moderator", actorRole: "low_admin",
    action: "update_local_listing", entityType: "local_listing",
    entityId: String(id), entityLabel: row.name,
  });

  res.json(row);
});

// PATCH /api/moderator/local-listings/:id/approve
router.patch("/moderator/local-listings/:id/approve", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { approvedBy = "Moderator" } = req.body as { approvedBy?: string };

  const [before] = await db.select().from(localListingsTable).where(eq(localListingsTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }

  const [row] = await db
    .update(localListingsTable)
    .set({ status: "approved", rejectionReason: null, updatedAt: new Date() })
    .where(eq(localListingsTable.id, id))
    .returning();

  await writeAudit({
    actorName: approvedBy, actorRole: "low_admin", action: "approve_local_listing",
    entityType: "local_listing", entityId: String(id), entityLabel: before.name,
    beforeState: before.status, afterState: "approved",
    scope: before.collegeName || String(before.collegeId ?? ""),
  });

  res.json(row);
});

// PATCH /api/moderator/local-listings/:id/reject
const RejectListingSchema = z.object({
  rejectedBy: z.string().default("Moderator"),
  rejectionReason: z.string().min(1, "Reason is required"),
});

router.patch("/moderator/local-listings/:id/reject", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = RejectListingSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const [before] = await db.select().from(localListingsTable).where(eq(localListingsTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }

  const [row] = await db
    .update(localListingsTable)
    .set({ status: "rejected", rejectionReason: parsed.data.rejectionReason, updatedAt: new Date() })
    .where(eq(localListingsTable.id, id))
    .returning();

  await writeAudit({
    actorName: parsed.data.rejectedBy, actorRole: "low_admin", action: "reject_local_listing",
    entityType: "local_listing", entityId: String(id), entityLabel: before.name,
    beforeState: before.status, afterState: "rejected",
    scope: before.collegeName || String(before.collegeId ?? ""),
  });

  res.json(row);
});

// DELETE /api/moderator/local-listings/:id — soft delete
router.delete("/moderator/local-listings/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .update(localListingsTable)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(localListingsTable.id, id))
    .returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  await writeAudit({
    actorName: (req.body as { deletedBy?: string })?.deletedBy ?? "Moderator",
    actorRole: "low_admin", action: "delete_local_listing",
    entityType: "local_listing", entityId: String(id), entityLabel: row.name,
    afterState: "deleted",
  });

  res.json({ ok: true });
});

export default router;

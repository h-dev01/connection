/**
 * Academic hierarchy routes — Admin manages Colleges → Courses → Semesters → Subjects.
 * These are the master-data tables every other feature scopes itself against.
 * All endpoints require the caller to be admin (enforced client-side for now).
 */
import { Router, type IRouter } from "express";
import { eq, desc, isNull, and, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  collegesTable,
  coursesTable,
  courseSemestersTable,
  subjectsTable,
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

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ══════════════════════════════════════════════════════════════
   COLLEGES
══════════════════════════════════════════════════════════════ */

// GET /api/admin/colleges — list all (excluding hard-deleted)
router.get("/admin/colleges", async (_req, res): Promise<void> => {
  const rows = await db.select().from(collegesTable)
    .where(isNull(collegesTable.deletedAt))
    .orderBy(desc(collegesTable.createdAt));
  res.json(rows);
});

const CollegeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  slug: z.string().min(1).optional(),
  emailDomain: z.string().min(3, "Email domain is required (e.g. dit.edu)")
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Enter a valid domain, e.g. dit.edu")
    .transform((v) => v.toLowerCase().replace(/^@/, "")),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  logoUrl: z.string().optional(),
  status: z.enum(["active", "disabled"]).default("active"),
});

// POST /api/admin/colleges
router.post("/admin/colleges", async (req, res): Promise<void> => {
  const parsed = CollegeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const { name, slug, ...rest } = parsed.data;
  try {
    const [row] = await db.insert(collegesTable).values({ name, slug: slug || slugify(name), ...rest }).returning();
    await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "create_college", entityType: "college", entityId: String(row.id), entityLabel: row.name });
    res.status(201).json(row);
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "A college with this code, slug, or email domain already exists." }); return; }
    throw err;
  }
});

// PATCH /api/admin/colleges/:id — edit or disable (status: "disabled")
router.patch("/admin/colleges/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CollegeSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [before] = await db.select().from(collegesTable).where(eq(collegesTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }
  try {
    const [row] = await db.update(collegesTable).set(parsed.data).where(eq(collegesTable.id, id)).returning();
    await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "update_college", entityType: "college", entityId: String(id), entityLabel: row.name, beforeState: before.status, afterState: row.status });
    res.json(row);
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "A college with this code, slug, or email domain already exists." }); return; }
    throw err;
  }
});

// DELETE /api/admin/colleges/:id — soft delete (sets deletedAt)
router.delete("/admin/colleges/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.update(collegesTable).set({ status: "disabled", deletedAt: new Date() }).where(eq(collegesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "delete_college", entityType: "college", entityId: String(id), entityLabel: row.name });
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════════
   PUBLIC READ ENDPOINTS (used by the signup form — active rows only,
   no sensitive fields, no auth required)
══════════════════════════════════════════════════════════════ */

// GET /api/colleges — active colleges for the signup dropdown
router.get("/colleges", async (_req, res): Promise<void> => {
  const rows = await db.select({
    id: collegesTable.id,
    name: collegesTable.name,
    slug: collegesTable.slug,
    emailDomain: collegesTable.emailDomain,
    city: collegesTable.city,
    state: collegesTable.state,
  }).from(collegesTable)
    .where(and(isNull(collegesTable.deletedAt), eq(collegesTable.status, "active")))
    .orderBy(collegesTable.name);
  res.json(rows);
});

// GET /api/colleges/:id/courses — active courses for a college
router.get("/colleges/:id/courses", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const rows = await db.select({
    id: coursesTable.id,
    name: coursesTable.name,
    code: coursesTable.code,
    durationSemesters: coursesTable.durationSemesters,
  }).from(coursesTable)
    .where(and(eq(coursesTable.collegeId, id), isNull(coursesTable.deletedAt), eq(coursesTable.status, "active")))
    .orderBy(coursesTable.name);
  res.json(rows);
});

// GET /api/courses/:id/semesters — active/upcoming semesters for a course
router.get("/courses/:id/semesters", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const rows = await db.select({
    id: courseSemestersTable.id,
    number: courseSemestersTable.number,
    name: courseSemestersTable.name,
  }).from(courseSemestersTable)
    .where(and(
      eq(courseSemestersTable.courseId, id),
      isNull(courseSemestersTable.deletedAt),
      inArray(courseSemestersTable.status, ["active", "upcoming"]),
    ))
    .orderBy(courseSemestersTable.number);
  res.json(rows);
});

// GET /api/semesters/:id/subjects — active subjects for a semester (public, no auth)
router.get("/semesters/:id/subjects", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const rows = await db.select({
    id: subjectsTable.id,
    name: subjectsTable.name,
    code: subjectsTable.code,
    credits: subjectsTable.credits,
  }).from(subjectsTable)
    .where(and(
      eq(subjectsTable.semesterId, id),
      isNull(subjectsTable.deletedAt),
      eq(subjectsTable.status, "active"),
    ))
    .orderBy(subjectsTable.name);
  res.json(rows);
});

/* ══════════════════════════════════════════════════════════════
   COURSES
══════════════════════════════════════════════════════════════ */

// GET /api/admin/courses?collegeId=1
router.get("/admin/courses", async (req, res): Promise<void> => {
  const { collegeId } = req.query as Record<string, string>;
  const conditions = [isNull(coursesTable.deletedAt)];
  if (collegeId) {
    const id = parseInt(collegeId, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid collegeId" }); return; }
    conditions.push(eq(coursesTable.collegeId, id));
  }
  const rows = await db.select().from(coursesTable).where(and(...conditions)).orderBy(desc(coursesTable.createdAt));
  res.json(rows);
});

const CourseSchema = z.object({
  collegeId: z.number().int(),
  name: z.string().min(1),
  code: z.string().min(1),
  durationSemesters: z.number().int().min(1).max(20).default(8),
  status: z.enum(["active", "disabled"]).default("active"),
});

// POST /api/admin/courses
router.post("/admin/courses", async (req, res): Promise<void> => {
  const parsed = CourseSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.insert(coursesTable).values(parsed.data).returning();
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "create_course", entityType: "course", entityId: String(row.id), entityLabel: row.name });
  res.status(201).json(row);
});

// PATCH /api/admin/courses/:id
router.patch("/admin/courses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CourseSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [before] = await db.select().from(coursesTable).where(eq(coursesTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.update(coursesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(coursesTable.id, id)).returning();
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "update_course", entityType: "course", entityId: String(id), entityLabel: row.name, beforeState: before.status, afterState: row.status });
  res.json(row);
});

// DELETE /api/admin/courses/:id — soft delete
router.delete("/admin/courses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.update(coursesTable).set({ status: "disabled", deletedAt: new Date() }).where(eq(coursesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "delete_course", entityType: "course", entityId: String(id), entityLabel: row.name });
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════════
   COURSE SEMESTERS
══════════════════════════════════════════════════════════════ */

// GET /api/admin/course-semesters?courseId=1
router.get("/admin/course-semesters", async (req, res): Promise<void> => {
  const { courseId } = req.query as Record<string, string>;
  const conditions = [isNull(courseSemestersTable.deletedAt)];
  if (courseId) {
    const id = parseInt(courseId, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid courseId" }); return; }
    conditions.push(eq(courseSemestersTable.courseId, id));
  }
  const rows = await db.select().from(courseSemestersTable).where(and(...conditions)).orderBy(courseSemestersTable.number);
  res.json(rows);
});

const CourseSemesterSchema = z.object({
  courseId: z.number().int(),
  number: z.number().int().min(1).max(20),
  name: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "disabled", "upcoming", "archived"]).default("upcoming"),
});

// POST /api/admin/course-semesters
router.post("/admin/course-semesters", async (req, res): Promise<void> => {
  const parsed = CourseSemesterSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.insert(courseSemestersTable).values(parsed.data).returning();
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "create_course_semester", entityType: "course_semester", entityId: String(row.id), entityLabel: row.name });
  res.status(201).json(row);
});

// PATCH /api/admin/course-semesters/:id
router.patch("/admin/course-semesters/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CourseSemesterSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [before] = await db.select().from(courseSemestersTable).where(eq(courseSemestersTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.update(courseSemestersTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(courseSemestersTable.id, id)).returning();
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "update_course_semester", entityType: "course_semester", entityId: String(id), entityLabel: row.name, beforeState: before.status, afterState: row.status });
  res.json(row);
});

// DELETE /api/admin/course-semesters/:id — soft delete
router.delete("/admin/course-semesters/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.update(courseSemestersTable).set({ status: "disabled", deletedAt: new Date() }).where(eq(courseSemestersTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "delete_course_semester", entityType: "course_semester", entityId: String(id), entityLabel: row.name });
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════════
   SUBJECTS
══════════════════════════════════════════════════════════════ */

// GET /api/admin/subjects?semesterId=1
router.get("/admin/subjects", async (req, res): Promise<void> => {
  const { semesterId } = req.query as Record<string, string>;
  const conditions = [isNull(subjectsTable.deletedAt)];
  if (semesterId) {
    const id = parseInt(semesterId, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid semesterId" }); return; }
    conditions.push(eq(subjectsTable.semesterId, id));
  }
  const rows = await db.select().from(subjectsTable).where(and(...conditions)).orderBy(subjectsTable.name);
  res.json(rows);
});

const SubjectSchema = z.object({
  semesterId: z.number().int(),
  name: z.string().min(1),
  code: z.string().min(1),
  credits: z.number().int().min(0).max(20).default(3),
  status: z.enum(["active", "disabled"]).default("active"),
});

// POST /api/admin/subjects
router.post("/admin/subjects", async (req, res): Promise<void> => {
  const parsed = SubjectSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.insert(subjectsTable).values(parsed.data).returning();
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "create_subject", entityType: "subject", entityId: String(row.id), entityLabel: row.name });
  res.status(201).json(row);
});

// PATCH /api/admin/subjects/:id
router.patch("/admin/subjects/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = SubjectSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [before] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.update(subjectsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(subjectsTable.id, id)).returning();
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "update_subject", entityType: "subject", entityId: String(id), entityLabel: row.name, beforeState: before.status, afterState: row.status });
  res.json(row);
});

// DELETE /api/admin/subjects/:id — soft delete
router.delete("/admin/subjects/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.update(subjectsTable).set({ status: "disabled", deletedAt: new Date() }).where(eq(subjectsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await writeAudit({ actorName: req.body?.actorName ?? "Admin", actorRole: "admin", action: "delete_subject", entityType: "subject", entityId: String(id), entityLabel: row.name });
  res.json({ ok: true });
});

export default router;

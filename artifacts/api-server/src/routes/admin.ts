/**
 * Admin routes — semester management, feature registry, moderator accounts.
 * All endpoints require the caller to be admin (enforced client-side for now).
 */
import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  semestersTable,
  featureRegistryTable,
  moderatorScopesTable,
  usersTable,
  auditLogTable,
} from "@workspace/db";

const router: IRouter = Router();

/* ─── Helpers ──────────────────────────────────────────────── */
async function writeAudit(entry: {
  actorName: string; actorRole: string; action: string;
  entityType: string; entityId?: string; entityLabel?: string;
  beforeState?: string; afterState?: string; scope?: string;
}) {
  await db.insert(auditLogTable).values(entry);
}

/* ══════════════════════════════════════════════════════════════
   SEMESTERS
══════════════════════════════════════════════════════════════ */

// GET /api/admin/semesters
router.get("/admin/semesters", async (_req, res): Promise<void> => {
  const rows = await db.select().from(semestersTable).orderBy(desc(semestersTable.createdAt));
  res.json(rows);
});

const SemesterSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "archived", "upcoming"]).default("upcoming"),
});

// POST /api/admin/semesters
router.post("/admin/semesters", async (req, res): Promise<void> => {
  const parsed = SemesterSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.insert(semestersTable).values(parsed.data).returning();
  await writeAudit({ actorName: req.body.actorName ?? "Admin", actorRole: "admin", action: "create_semester", entityType: "semester", entityId: String(row.id), entityLabel: row.name, afterState: row.status });
  res.status(201).json(row);
});

// PATCH /api/admin/semesters/:id
router.patch("/admin/semesters/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = SemesterSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [before] = await db.select().from(semestersTable).where(eq(semestersTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.update(semestersTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(semestersTable.id, id)).returning();
  await writeAudit({ actorName: req.body.actorName ?? "Admin", actorRole: "admin", action: "update_semester", entityType: "semester", entityId: String(id), entityLabel: row.name, beforeState: before.status, afterState: row.status });
  res.json(row);
});

// DELETE /api/admin/semesters/:id
router.delete("/admin/semesters/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(semestersTable).where(eq(semestersTable.id, id));
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════════
   FEATURE REGISTRY
══════════════════════════════════════════════════════════════ */

// GET /api/admin/features
router.get("/admin/features", async (_req, res): Promise<void> => {
  const rows = await db.select().from(featureRegistryTable).orderBy(featureRegistryTable.label);
  res.json(rows);
});

const FeatureSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  defaultEnabled: z.boolean().default(true),
  forcedActive: z.boolean().default(false),
  globalEnabled: z.boolean().default(true),
  parentName: z.string().nullable().optional(),
});

// POST /api/admin/features
router.post("/admin/features", async (req, res): Promise<void> => {
  const parsed = FeatureSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [row] = await db.insert(featureRegistryTable).values(parsed.data).returning();
  await writeAudit({ actorName: req.body.actorName ?? "Admin", actorRole: "admin", action: "create_feature", entityType: "feature", entityId: String(row.id), entityLabel: row.label });
  res.status(201).json(row);
});

// PATCH /api/admin/features/:id
router.patch("/admin/features/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = FeatureSchema.partial().extend({ retired: z.boolean().optional() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const [before] = await db.select().from(featureRegistryTable).where(eq(featureRegistryTable.id, id));
  if (!before) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.update(featureRegistryTable).set(parsed.data).where(eq(featureRegistryTable.id, id)).returning();
  await writeAudit({
    actorName: req.body.actorName ?? "Admin", actorRole: "admin", action: "update_feature",
    entityType: "feature", entityId: String(id), entityLabel: row.label,
    beforeState: `globalEnabled=${before.globalEnabled}`, afterState: `globalEnabled=${row.globalEnabled}`,
  });
  res.json(row);
});

/* ══════════════════════════════════════════════════════════════
   MODERATOR MANAGEMENT
══════════════════════════════════════════════════════════════ */

// GET /api/admin/moderators — list all moderator users with their scopes
router.get("/admin/moderators", async (_req, res): Promise<void> => {
  const mods = await db.select().from(usersTable).where(eq(usersTable.role, "low_admin"));
  const scopes = await db.select().from(moderatorScopesTable);
  const result = mods.map((m) => ({
    ...m,
    passwordHash: undefined,
    scopes: scopes.filter((s) => s.userId === m.id),
  }));
  res.json(result);
});

// POST /api/admin/moderators — create moderator account
const CreateModSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  scopes: z.array(z.object({ course: z.string(), semester: z.string() })).default([]),
});

router.post("/admin/moderators", async (req, res): Promise<void> => {
  const parsed = CreateModSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }
  const { name, email, scopes } = parsed.data;

  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing) { res.status(409).json({ error: "Email already registered." }); return; }

  const [mod] = await db.insert(usersTable).values({
    name,
    email: email.toLowerCase(),
    role: "low_admin",
    college: "",
    department: "",
    year: 0,
    verified: true,
  }).returning();

  if (scopes.length > 0) {
    await db.insert(moderatorScopesTable).values(scopes.map((s) => ({ userId: mod.id, ...s })));
  }

  await writeAudit({ actorName: req.body.actorName ?? "Admin", actorRole: "admin", action: "create_moderator", entityType: "user", entityId: String(mod.id), entityLabel: mod.name });
  const { passwordHash: _p, ...safe } = mod;
  res.status(201).json({ ...safe, scopes });
});

// PATCH /api/admin/moderators/:id — update status or scope
router.patch("/admin/moderators/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, scopes, actorName } = req.body as { status?: string; scopes?: { course: string; semester: string }[]; actorName?: string };

  if (status) {
    // "active" maps to verified=true, "suspended" to verified=false
    await db.update(usersTable).set({ verified: status === "active" }).where(eq(usersTable.id, id));
  }

  if (Array.isArray(scopes)) {
    await db.delete(moderatorScopesTable).where(eq(moderatorScopesTable.userId, id));
    if (scopes.length > 0) {
      await db.insert(moderatorScopesTable).values(scopes.map((s) => ({ userId: id, ...s })));
    }
  }

  await writeAudit({ actorName: actorName ?? "Admin", actorRole: "admin", action: "update_moderator", entityType: "user", entityId: String(id) });
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════════
   AUDIT LOG
══════════════════════════════════════════════════════════════ */

// GET /api/admin/audit-log
router.get("/admin/audit-log", async (_req, res): Promise<void> => {
  const rows = await db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(100);
  res.json(rows);
});

export default router;

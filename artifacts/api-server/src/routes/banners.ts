/**
 * Ad Banner routes.
 * Public GET is student-facing (active banners only, scoped by placement).
 * Moderator CRUD manages the full lifecycle, including soft delete.
 */
import { Router, type IRouter } from "express";
import { eq, and, desc, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { db, bannersTable, auditLogTable } from "@workspace/db";

const router: IRouter = Router();

async function writeAudit(entry: {
  actorName: string; actorRole: string; action: string;
  entityType: string; entityId?: string; entityLabel?: string;
  beforeState?: string; afterState?: string; scope?: string;
}) {
  await db.insert(auditLogTable).values(entry);
}

// GET /api/banners?placement=study|marketplace — public, active banners only
router.get("/banners", async (req, res): Promise<void> => {
  const placement = (req.query.placement as string | undefined)?.trim();
  const conditions = [
    isNull(bannersTable.deletedAt),
    eq(bannersTable.status, "active"),
  ];
  if (placement === "study" || placement === "marketplace") {
    conditions.push(or(eq(bannersTable.placement, placement), eq(bannersTable.placement, "both"))!);
  }
  const rows = await db
    .select()
    .from(bannersTable)
    .where(and(...conditions))
    .orderBy(desc(bannersTable.createdAt))
    .limit(20);
  res.json(rows);
});

// GET /api/moderator/banners — moderator view, all statuses
router.get("/moderator/banners", async (req, res): Promise<void> => {
  const { placement, status } = req.query as Record<string, string>;
  const conditions = [isNull(bannersTable.deletedAt)];
  if (placement) conditions.push(eq(bannersTable.placement, placement));
  if (status) conditions.push(eq(bannersTable.status, status));
  const rows = await db
    .select()
    .from(bannersTable)
    .where(and(...conditions))
    .orderBy(desc(bannersTable.createdAt))
    .limit(200);
  res.json(rows);
});

const BannerSchema = z.object({
  collegeId: z.number().int().optional(),
  collegeName: z.string().default(""),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().default(""),
  imageUrl: z.string().min(1, "Banner image is required"),
  placement: z.enum(["study", "marketplace", "both"]).default("both"),
  linkType: z.enum(["restaurant", "pg", "local_service", "none"]).default("none"),
  durationMs: z.number().int().min(2000).max(15000).default(5000),
  status: z.enum(["active", "inactive"]).default("active"),
  addedByModerator: z.string().default("Moderator"),
  addedByModeratorId: z.number().int().optional(),
});

// POST /api/moderator/banners
router.post("/moderator/banners", async (req, res): Promise<void> => {
  const parsed = BannerSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const [row] = await db.insert(bannersTable).values(parsed.data).returning();

  await writeAudit({
    actorName: parsed.data.addedByModerator, actorRole: "low_admin",
    action: "create_banner", entityType: "banner",
    entityId: String(row.id), entityLabel: row.title,
    afterState: JSON.stringify({ placement: row.placement, linkType: row.linkType, status: row.status }),
    scope: row.collegeName || String(row.collegeId ?? ""),
  });

  res.status(201).json(row);
});

// PATCH /api/moderator/banners/:id
router.patch("/moderator/banners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = BannerSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message }); return; }

  const [row] = await db
    .update(bannersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(bannersTable.id, id))
    .returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  await writeAudit({
    actorName: parsed.data.addedByModerator ?? "Moderator", actorRole: "low_admin",
    action: "update_banner", entityType: "banner",
    entityId: String(id), entityLabel: row.title,
  });

  res.json(row);
});

// DELETE /api/moderator/banners/:id — soft delete
router.delete("/moderator/banners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .update(bannersTable)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(bannersTable.id, id))
    .returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  await writeAudit({
    actorName: (req.body as { deletedBy?: string })?.deletedBy ?? "Moderator",
    actorRole: "low_admin", action: "delete_banner",
    entityType: "banner", entityId: String(id), entityLabel: row.title,
    afterState: "deleted",
  });

  res.json({ ok: true });
});

export default router;

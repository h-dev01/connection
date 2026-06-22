/**
 * User routes — CRUD for student profiles.
 * Connect these to real auth later (replace hardcoded userId with session).
 */
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, usersTable } from "@workspace/db";

const router: IRouter = Router();

// GET /users — list all users
router.get("/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

// GET /users/:id — get a single user
router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
});

// POST /users — create a user
const CreateUser = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  college: z.string().min(1),
  department: z.string().min(1),
  year: z.number().int().min(1).max(6),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  cgpa: z.number().optional(),
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUser.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [user] = await db.insert(usersTable).values(parsed.data).returning();
  res.status(201).json(user);
});

// PATCH /users/:id — update user profile
const UpdateUser = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  cgpa: z.number().optional(),
  attendance: z.number().optional(),
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateUser.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
});

// GET /reputation/leaders — top users by reputation score
router.get("/reputation/leaders", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.reputationScore).limit(10);
  const leaders = users.map((u, i) => ({
    id: u.id,
    name: u.name,
    avatarUrl: u.avatarUrl,
    reputationScore: u.reputationScore,
    reputationLevel: u.reputationLevel,
    rank: i + 1,
  }));
  res.json(leaders);
});

export default router;

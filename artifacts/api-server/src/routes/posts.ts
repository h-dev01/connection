/**
 * Posts routes — campus feed, anonymous Q&A.
 */
import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod/v4";
import { db, postsTable, qaTable } from "@workspace/db";

const router: IRouter = Router();

// GET /posts — list feed posts
router.get("/posts", async (req, res): Promise<void> => {
  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(50);
  res.json(posts);
});

// GET /posts/trending — top liked posts
router.get("/posts/trending", async (_req, res): Promise<void> => {
  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.likes)).limit(10);
  res.json(posts);
});

// POST /posts — create a post
const CreatePost = z.object({
  authorId: z.number().optional(),
  authorName: z.string().optional(),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  category: z.string().default("campus_life"),
  anonymous: z.boolean().default(false),
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePost.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [post] = await db.insert(postsTable).values(parsed.data).returning();
  res.status(201).json(post);
});

// PATCH /posts/:id/like — increment likes
router.patch("/posts/:id/like", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  const [updated] = await db.update(postsTable).set({ likes: post.likes + 1 }).where(eq(postsTable.id, id)).returning();
  res.json(updated);
});

// DELETE /posts/:id
router.delete("/posts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(postsTable).where(eq(postsTable.id, id));
  res.sendStatus(204);
});

// GET /qa — anonymous Q&A
router.get("/qa", async (_req, res): Promise<void> => {
  const questions = await db.select().from(qaTable).orderBy(desc(qaTable.upvotes)).limit(20);
  res.json(questions);
});

// POST /qa — ask anonymously
router.post("/qa", async (req, res): Promise<void> => {
  const parsed = z.object({ question: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [q] = await db.insert(qaTable).values(parsed.data).returning();
  res.status(201).json(q);
});

export default router;

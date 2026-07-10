/**
 * Auth routes — signup (3-step) and signin (2-step) with OTP verification.
 *
 * OTPs are stored in-memory with a 5-minute TTL.
 * Passwords are hashed with bcryptjs.
 *
 * Security note: signin never reveals whether an email is registered.
 */
import { Router, type IRouter } from "express";
import { eq, isNull, and, inArray } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, usersTable, collegesTable, coursesTable, courseSemestersTable } from "@workspace/db";

const router: IRouter = Router();

/* ─── In-memory OTP store ─────────────────────────────────────── */
interface PendingOtp {
  otp: string;
  expiresAt: number;
  /** For signup: carries the full registration payload */
  signupData?: SignupPayload;
}
const otpStore = new Map<string, PendingOtp>();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOtp(email: string, otp: string, signupData?: SignupPayload) {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    signupData,
  });
}

function consumeOtp(email: string, otp: string): { ok: boolean; signupData?: SignupPayload } {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return { ok: false };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { ok: false };
  }
  if (entry.otp !== otp.trim()) return { ok: false };
  otpStore.delete(email.toLowerCase());
  return { ok: true, signupData: entry.signupData };
}

/* ─── Validation schemas ──────────────────────────────────────── */
interface SignupPayload {
  name: string;
  email: string;
  passwordHash: string;
  collegeId: number;
  collegeName: string;
  courseId: number;
  courseName: string;
  semesterId: number;
  passInYear: number;
  passOutYear: number;
}

const SignupInitiateSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  collegeId: z.number().int("Please select your college"),
  courseId: z.number().int("Please select your course"),
  semesterId: z.number().int("Please select your current semester"),
  passInYear: z.number().int().min(1990).max(2030),
  passOutYear: z.number().int().min(1990).max(2035),
}).refine(d => d.passOutYear >= d.passInYear, {
  message: "Pass-out year must be on or after pass-in year",
  path: ["passOutYear"],
});

const OtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/* ─── Helpers ─────────────────────────────────────────────────── */
function safeUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash: _p, ...rest } = u;
  return rest;
}

/* ─── POST /api/auth/signup/initiate ─────────────────────────── */
router.post("/auth/signup/initiate", async (req, res): Promise<void> => {
  const parsed = SignupInitiateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
    return;
  }
  const { name, email, password, collegeId, courseId, semesterId, passInYear, passOutYear } = parsed.data;
  const lowerEmail = email.toLowerCase();

  // Check if email already registered
  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, lowerEmail));
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists. Please sign in." });
    return;
  }

  // College must exist and be active — its emailDomain gates which addresses may sign up
  const [college] = await db.select().from(collegesTable)
    .where(and(eq(collegesTable.id, collegeId), isNull(collegesTable.deletedAt), eq(collegesTable.status, "active")));
  if (!college) { res.status(400).json({ error: "Selected college was not found." }); return; }

  const emailDomain = lowerEmail.split("@")[1];
  if (emailDomain !== college.emailDomain.toLowerCase()) {
    res.status(400).json({ error: `Use your college email ending in @${college.emailDomain} to sign up for ${college.name}.` });
    return;
  }

  // Course must belong to the selected college
  const [course] = await db.select().from(coursesTable)
    .where(and(eq(coursesTable.id, courseId), eq(coursesTable.collegeId, collegeId), isNull(coursesTable.deletedAt), eq(coursesTable.status, "active")));
  if (!course) { res.status(400).json({ error: "Selected course was not found for this college." }); return; }

  // Semester must belong to the selected course and be active/upcoming
  const [semester] = await db.select().from(courseSemestersTable)
    .where(and(
      eq(courseSemestersTable.id, semesterId),
      eq(courseSemestersTable.courseId, courseId),
      isNull(courseSemestersTable.deletedAt),
      inArray(courseSemestersTable.status, ["active", "upcoming"]),
    ));
  if (!semester) { res.status(400).json({ error: "Selected semester was not found for this course." }); return; }

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  storeOtp(email, otp, {
    name, email: lowerEmail, passwordHash,
    collegeId, collegeName: college.name,
    courseId, courseName: course.name,
    semesterId, passInYear, passOutYear,
  });

  // In production: send real email. For demo, return OTP in response.
  res.json({ ok: true, demoOtp: otp });
});

/* ─── POST /api/auth/signup/complete ─────────────────────────── */
router.post("/auth/signup/complete", async (req, res): Promise<void> => {
  const parsed = OtpVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { email, otp } = parsed.data;
  const result = consumeOtp(email, otp);
  if (!result.ok || !result.signupData) {
    res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    return;
  }

  const { name, passwordHash, collegeId, collegeName, courseId, courseName, semesterId, passInYear, passOutYear } = result.signupData;

  // Derive current year from pass-in/pass-out
  const currentYear = new Date().getFullYear();
  const yearOfStudy = Math.max(1, Math.min(6, currentYear - passInYear + 1));

  const [user] = await db.insert(usersTable).values({
    name,
    email: email.toLowerCase(),
    passwordHash,
    college: collegeName,
    department: courseName,
    courseName,
    collegeId,
    courseId,
    semesterId,
    passInYear,
    passOutYear,
    year: yearOfStudy,
    role: "student",
    verified: false,
  }).returning();

  res.status(201).json(safeUser(user));
});

/* ─── POST /api/auth/signup/resend ───────────────────────────── */
router.post("/auth/signup/resend", async (req, res): Promise<void> => {
  const email = (req.body?.email ?? "").toLowerCase();
  if (!email) { res.status(400).json({ error: "Email required" }); return; }

  const entry = otpStore.get(email);
  if (!entry?.signupData) {
    res.status(400).json({ error: "No pending signup found. Please start again." });
    return;
  }
  const newOtp = generateOtp();
  storeOtp(email, newOtp, entry.signupData);
  res.json({ ok: true, demoOtp: newOtp });
});

/* ─── POST /api/auth/signin ──────────────────────────────────── */
router.post("/auth/signin", async (req, res): Promise<void> => {
  const parsed = SigninSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));

  // Always compare — prevents timing-based enumeration
  const hashToCheck = user?.passwordHash ?? "$2b$12$invalidhashpadding000000000000000000000000000000000000000";
  const passwordOk = await bcrypt.compare(password, hashToCheck);

  if (!user || !passwordOk) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const otp = generateOtp();
  storeOtp(email, otp);
  // In production: send real email. For demo, return OTP.
  res.json({ ok: true, demoOtp: otp });
});

/* ─── POST /api/auth/signin/verify ──────────────────────────── */
router.post("/auth/signin/verify", async (req, res): Promise<void> => {
  const parsed = OtpVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { email, otp } = parsed.data;
  const result = consumeOtp(email, otp);
  if (!result.ok) {
    res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(safeUser(user));
});

/* ─── POST /api/auth/signin/resend ──────────────────────────── */
router.post("/auth/signin/resend", async (req, res): Promise<void> => {
  const parsed = SigninSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  const hashToCheck = user?.passwordHash ?? "$2b$12$invalidhashpadding000000000000000000000000000000000000000";
  const passwordOk = await bcrypt.compare(password, hashToCheck);

  if (!user || !passwordOk) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const newOtp = generateOtp();
  storeOtp(email, newOtp);
  res.json({ ok: true, demoOtp: newOtp });
});

export default router;

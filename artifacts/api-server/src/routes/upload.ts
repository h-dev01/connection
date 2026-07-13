/**
 * Image upload — used by the Moderator panel to attach real photo files to
 * local listings (Housing / Restaurant / Local Service) instead of pasting
 * external image links.
 *
 * Files are stored on local disk under `uploads/` and served statically by
 * `app.ts` at `/uploads/<filename>`. Returns the public URL to store on the
 * listing's `photos` JSON array.
 */
import { Router, type IRouter } from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";

const router: IRouter = Router();

export const UPLOADS_DIR = path.resolve(import.meta.dirname, "../../uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Only image files (jpeg, png, webp, gif, avif) are allowed"));
      return;
    }
    cb(null, true);
  },
});

// POST /api/moderator/upload — multipart/form-data, field name "image"
router.post("/moderator/upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message ?? "Upload failed" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;

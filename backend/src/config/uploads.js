import fs from "node:fs";
import path from "node:path";
import multer from "multer";

export const UPLOADS_DIR = path.resolve("uploads/receipts");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

// Import lazily to avoid pulling node:crypto at module load twice.
import crypto from "node:crypto";

export const receiptUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new Error("Formato file non supportato: usa JPG, PNG, WEBP o HEIC"),
      );
    }
    cb(null, true);
  },
});

import { Router } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import WebApplicationController from './webApplication.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRecruiter } from '@middleware/role.middleware';

const router = Router();

// ── File upload config (memory storage, same as resume module) ──────────────
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_MB = 5;

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

// ── CORS options for the public submit endpoint ─────────────────────────────
// Allow requests from any origin so the main website (ashtatech.com) can POST
const publicCors = cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
});

// ── PUBLIC route — no authentication required ───────────────────────────────
/**
 * POST /api/web-applications/submit
 *
 * Form fields (multipart/form-data):
 *   fullName         string  (required)
 *   email            string  (required)
 *   phone            string  (optional)
 *   positionApplied  string  (required)
 *   coverLetter      string  (optional)
 *   resume           file    (optional) — PDF / DOC / DOCX, max 5 MB
 */
router.options('/submit', publicCors);
router.post(
  '/submit',
  publicCors,
  upload.single('resume'),
  WebApplicationController.submit.bind(WebApplicationController)
);

// ── INTERNAL routes — require recruiter/admin auth ──────────────────────────
router.use(authMiddleware, requireRecruiter);

/** GET /api/web-applications?status=new&page=1&limit=20 */
router.get('/', WebApplicationController.list.bind(WebApplicationController));

/** GET /api/web-applications/summary */
router.get('/summary', WebApplicationController.summary.bind(WebApplicationController));

/** GET /api/web-applications/:id */
router.get('/:id', WebApplicationController.getOne.bind(WebApplicationController));

/** PATCH /api/web-applications/:id/status  body: { status: "reviewed" } */
router.patch('/:id/status', WebApplicationController.updateStatus.bind(WebApplicationController));

export default router;

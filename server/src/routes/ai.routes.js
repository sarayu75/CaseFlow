import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as aiController from "../controllers/ai.controller.js";

const router = Router();

// AI endpoints are the expensive (real API cost) and abusable ones,
// unlike plain CRUD reads/writes -- rate limit them specifically rather
// than throttling the whole API uniformly.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please wait a moment and try again." },
});

router.post("/cases/:id/summary", aiLimiter, aiController.postSummary);
router.post("/api/ask-caseflow", aiLimiter, aiController.postAskCaseflow);

export default router;
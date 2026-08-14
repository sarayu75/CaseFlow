import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";

const router = Router();

router.post("/cases/:id/summary", aiController.postSummary);
router.post("/api/ask-caseflow", aiController.postAskCaseflow);

export default router;
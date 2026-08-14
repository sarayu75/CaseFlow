import { Router } from "express";
import * as casesController from "../controllers/cases.controller.js";

const router = Router();

router.get("/", casesController.getCases);
router.get("/:id", casesController.getCase);
router.post("/", casesController.postCase);
router.put("/:id", casesController.putCase);
router.delete("/:id", casesController.deleteCaseHandler);

export default router;
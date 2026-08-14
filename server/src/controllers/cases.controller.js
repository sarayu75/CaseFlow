import * as casesService from "../services/cases.service.js";
import { ValidationError } from "../services/cases.service.js";

export async function getCases(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 8, 50);
    const search = req.query.search?.trim() || "";
    const status = req.query.status || "all";
    const aiReady = req.query.aiReady || "all";

    const result = await casesService.listCases({ page, limit, search, status, aiReady });
    res.json(result);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Pagination Error:", err);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
}

export async function getCase(req, res) {
  try {
    const id = Number(req.params.id);
    const caseData = await casesService.getCaseById(id);
    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json(caseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch case" });
  }
}

export async function postCase(req, res) {
  try {
    const newCase = await casesService.createCase(req.body);
    res.status(201).json(newCase);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Prisma Error:", err);
    res.status(500).json({ error: "Failed to create case" });
  }
}

export async function putCase(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }
    const updatedCase = await casesService.updateCase(id, req.body);
    res.json(updatedCase);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Prisma Error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Case not found" });
    }
    res.status(500).json({ error: "Failed to update case" });
  }
}

export async function deleteCaseHandler(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }
    await casesService.deleteCase(id);
    res.json({ message: "Case deleted successfully" });
  } catch (err) {
    console.error("Prisma Error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Case not found" });
    }
    res.status(500).json({ error: "Failed to delete case" });
  }
}
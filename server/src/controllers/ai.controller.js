import { prisma } from "../lib/prisma.js";
import * as aiService from "../services/ai.service.js";
import { RateLimitError } from "../services/ai.service.js";

export async function postSummary(req, res) {
  const { id } = req.params;

  try {
    const caseData = await prisma.case.findUnique({ where: { id: Number(id) } });
    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    let summary;
    try {
      summary = await aiService.generateCaseSummary(caseData.content);
    } catch (err) {
      if (err instanceof RateLimitError) {
        return res.status(503).json({ error: err.message, unavailable: true });
      }
      console.error("OpenAI Summary Error:", err.message);
      return res.status(500).json({ error: "Failed to generate AI analysis." });
    }

    const updatedCase = await prisma.case.update({
    where: { id: Number(id) },
    data: { analysis: summary, analyzedAt: new Date() },
    });
    res.json(updatedCase);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
}

export async function postAskCaseflow(req, res) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const cases = await prisma.case.findMany();
    const result = await aiService.answerCaseQuery(query, cases);
    res.json(result);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return res.json({ answer: err.message, caseIds: [], unavailable: true });
    }
    console.error("CaseFlow Search Error:", err.message);
    res.status(500).json({ error: "Failed to process CaseFlow search" });
  }
}
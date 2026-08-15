import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/lib/openai.js", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

import { openai } from "../../src/lib/openai.js";
import {
  generateCaseSummary,
  answerCaseQuery,
  RateLimitError,
  InvalidAnalysisError,
} from "../../src/services/ai.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

function validAnalysis(overrides = {}) {
  return {
    executiveSummary: "A test case.",
    entities: { people: [], locations: [], organizations: [], objects: [] },
    timeline: [],
    evidence: [],
    witnessAnalysis: [],
    witnesses: [],
    contradictions: [],
    recommendedNextSteps: [],
    riskAssessment: { score: 50, level: "Medium", factors: [] },
    relationships: [],
    ...overrides,
  };
}

function mockResponse(content) {
  return { choices: [{ message: { content } }] };
}

describe("generateCaseSummary", () => {
  it("parses and returns a valid, complete analysis on the first try", async () => {
    const analysis = validAnalysis();
    openai.chat.completions.create.mockResolvedValue(mockResponse(JSON.stringify(analysis)));

    const result = await generateCaseSummary("Some case report text.");

    expect(result).toEqual(analysis);
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it("retries once on malformed JSON and succeeds if the retry is valid", async () => {
    const goodAnalysis = validAnalysis();
    openai.chat.completions.create
      .mockResolvedValueOnce(mockResponse("{ this is not valid JSON"))
      .mockResolvedValueOnce(mockResponse(JSON.stringify(goodAnalysis)));

    const result = await generateCaseSummary("Some case report text.");

    expect(result).toEqual(goodAnalysis);
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it("retries once when witnesses and witnessAnalysis disagree, and succeeds once fixed", async () => {
    const badAnalysis = validAnalysis({
      witnesses: [],
      witnessAnalysis: [{ name: "Maya Patel", credibility: "High" }],
    });
    const fixedAnalysis = validAnalysis({
      witnesses: ["Maya Patel"],
      witnessAnalysis: [{ name: "Maya Patel", credibility: "High" }],
    });

    openai.chat.completions.create
      .mockResolvedValueOnce(mockResponse(JSON.stringify(badAnalysis)))
      .mockResolvedValueOnce(mockResponse(JSON.stringify(fixedAnalysis)));

    const result = await generateCaseSummary("Some case report text.");

    expect(result).toEqual(fixedAnalysis);
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);

    const retryCallMessages = openai.chat.completions.create.mock.calls[1][0].messages;
    const correctionMessage = retryCallMessages[retryCallMessages.length - 1].content;
    expect(correctionMessage).toContain("witnesses");
  });

  it("throws InvalidAnalysisError if still invalid after one retry", async () => {
    const missingFieldsAnalysis = { executiveSummary: "Incomplete." };
    openai.chat.completions.create.mockResolvedValue(
      mockResponse(JSON.stringify(missingFieldsAnalysis))
    );

    await expect(generateCaseSummary("text")).rejects.toThrow(InvalidAnalysisError);
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it("converts an OpenAI 429 on the first call into a RateLimitError", async () => {
    const rateLimitErr = new Error("Rate limited");
    rateLimitErr.status = 429;
    openai.chat.completions.create.mockRejectedValue(rateLimitErr);

    await expect(generateCaseSummary("Some case report text.")).rejects.toThrow(RateLimitError);
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it("converts a 429 encountered during the retry call into a RateLimitError", async () => {
    const rateLimitErr = new Error("Rate limited");
    rateLimitErr.status = 429;
    openai.chat.completions.create
      .mockResolvedValueOnce(mockResponse("not valid json"))
      .mockRejectedValueOnce(rateLimitErr);

    await expect(generateCaseSummary("Some case report text.")).rejects.toThrow(RateLimitError);
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it("propagates non-rate-limit, non-validation errors unchanged", async () => {
    openai.chat.completions.create.mockRejectedValue(new Error("Something else broke"));

    await expect(generateCaseSummary("text")).rejects.toThrow("Something else broke");
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
  });
});

describe("answerCaseQuery", () => {
  it("only sends id/title/content/analysis/status per case, not extra fields", async () => {
    openai.chat.completions.create.mockResolvedValue(
      mockResponse(JSON.stringify({ answer: "ok", caseIds: [1] }))
    );

    const cases = [
      { id: 1, title: "T", content: "C", analysis: null, status: "Open", secretField: "should not leak" },
    ];
    await answerCaseQuery("Who was involved?", cases);

    const sentMessages = openai.chat.completions.create.mock.calls[0][0].messages;
    const userMessage = sentMessages.find((m) => m.role === "user").content;
    expect(userMessage).not.toContain("secretField");
    expect(userMessage).not.toContain("should not leak");
  });

  it("converts a 429 into a RateLimitError", async () => {
    const rateLimitErr = new Error("Rate limited");
    rateLimitErr.status = 429;
    openai.chat.completions.create.mockRejectedValue(rateLimitErr);

    await expect(answerCaseQuery("query", [])).rejects.toThrow(RateLimitError);
  });
});
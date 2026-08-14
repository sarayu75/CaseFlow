import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the shared OpenAI client so these tests run instantly, cost
// nothing, and don't require a real OPENAI_API_KEY to be set.
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
import { generateCaseSummary, answerCaseQuery, RateLimitError } from "../../src/services/ai.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateCaseSummary", () => {
  it("parses and returns the structured JSON analysis", async () => {
    const fakeAnalysis = { executiveSummary: "A test case.", entities: { people: [] } };
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(fakeAnalysis) } }],
    });

    const result = await generateCaseSummary("Some case report text.");

    expect(result).toEqual(fakeAnalysis);
  });

  it("converts an OpenAI 429 into a RateLimitError instead of a raw crash", async () => {
    const rateLimitErr = new Error("Rate limited");
    rateLimitErr.status = 429;
    openai.chat.completions.create.mockRejectedValue(rateLimitErr);

    await expect(generateCaseSummary("Some case report text.")).rejects.toThrow(RateLimitError);
  });

  it("propagates non-rate-limit errors unchanged", async () => {
    openai.chat.completions.create.mockRejectedValue(new Error("Something else broke"));

    await expect(generateCaseSummary("text")).rejects.toThrow("Something else broke");
  });
});

describe("answerCaseQuery", () => {
  it("only sends id/title/content/analysis/status per case, not extra fields", async () => {
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ answer: "ok", caseIds: [1] }) } }],
    });

    const cases = [{ id: 1, title: "T", content: "C", analysis: null, status: "Open", secretField: "should not leak" }];
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
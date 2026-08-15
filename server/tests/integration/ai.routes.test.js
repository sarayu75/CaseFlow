import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    case: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/openai.js", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

import { prisma } from "../../src/lib/prisma.js";
import { openai } from "../../src/lib/openai.js";
import { createApp } from "../../src/app.js";

const app = createApp();

describe("AI endpoint rate limiting", () => {
  it("allows up to the configured limit, then blocks with 429", async () => {
    prisma.case.findMany.mockResolvedValue([]);
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ answer: "ok", caseIds: [] }) } }],
    });

    const statuses = [];
    for (let i = 0; i < 11; i++) {
      const res = await request(app).post("/api/ask-caseflow").send({ query: "test" });
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(200));
    expect(statuses[10]).toBe(429);
  }, 15000);
});
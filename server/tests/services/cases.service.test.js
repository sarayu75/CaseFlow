import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the shared Prisma client BEFORE importing the service that uses
// it, so no real database connection is ever needed to run these tests —
// important, since a reviewer running `npm test` shouldn't need Postgres
// running locally just to see the tests pass.
vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    case: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/lib/prisma.js";
import { listCases, createCase, updateCase, ValidationError } from "../../src/services/cases.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listCases", () => {
  it("rejects an invalid status filter", async () => {
    await expect(listCases({ status: "NotARealStatus" })).rejects.toThrow(ValidationError);
  });

  it("rejects an invalid aiReady filter", async () => {
    await expect(listCases({ aiReady: "bogus" })).rejects.toThrow(ValidationError);
  });

  it("queries with correct pagination and returns stats", async () => {
    prisma.case.findMany.mockResolvedValue([{ id: 1, title: "Test case" }]);
    prisma.case.count
      .mockResolvedValueOnce(1) // total matching the filter
      .mockResolvedValueOnce(3) // aiReadyCount
      .mockResolvedValueOnce(5); // openCasesCount

    const result = await listCases({ page: 2, limit: 8 });

    expect(result.cases).toHaveLength(1);
    expect(result.pagination).toEqual({ page: 2, limit: 8, total: 1, totalPages: 1 });
    expect(result.stats).toEqual({ aiReady: 3, openCases: 5 });
    // page 2 with limit 8 should skip the first 8 results
    expect(prisma.case.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 8, take: 8 })
    );
  });

  it("builds a case-insensitive search filter across title and content", async () => {
    prisma.case.findMany.mockResolvedValue([]);
    prisma.case.count.mockResolvedValue(0);

    await listCases({ search: "witness" });

    expect(prisma.case.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: "witness", mode: "insensitive" } },
            { content: { contains: "witness", mode: "insensitive" } },
          ],
        }),
      })
    );
  });
});

describe("createCase", () => {
  it("rejects a blank title", async () => {
    await expect(createCase({ title: "   ", content: "Some content" })).rejects.toThrow(ValidationError);
  });

  it("rejects missing content", async () => {
    await expect(createCase({ title: "A real title" })).rejects.toThrow(ValidationError);
  });

  it("trims whitespace and sets status to Open", async () => {
    prisma.case.create.mockResolvedValue({ id: 1, title: "Hello", content: "World", status: "Open" });

    await createCase({ title: "  Hello  ", content: "  World  " });

    expect(prisma.case.create).toHaveBeenCalledWith({
      data: { title: "Hello", content: "World", status: "Open" },
    });
  });
});

describe("updateCase", () => {
  it("rejects invalid input the same way createCase does", async () => {
    await expect(updateCase(1, { title: "", content: "x", status: "Open" })).rejects.toThrow(ValidationError);
  });

  it("passes trimmed fields through to Prisma", async () => {
    prisma.case.update.mockResolvedValue({ id: 1, title: "New title" });

    await updateCase(1, { title: "  New title  ", content: "  New content  ", status: "Closed" });

    expect(prisma.case.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        title: "New title",
        content: "New content",
        status: "Closed",
        contentUpdatedAt: expect.any(Date),
      },
    });
  });
});
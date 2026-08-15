import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

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
import { createApp } from "../../src/app.js";

const app = createApp();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /", () => {
  it("returns a health check message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("CaseFlow API running");
  });
});

describe("GET /cases", () => {
  it("returns paginated cases with stats", async () => {
    prisma.case.findMany.mockResolvedValue([{ id: 1, title: "Test" }]);
    prisma.case.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    const res = await request(app).get("/cases");

    expect(res.status).toBe(200);
    expect(res.body.cases).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it("returns 400 for an invalid status filter, through real HTTP validation", async () => {
    const res = await request(app).get("/cases?status=NotReal");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/i);
  });
});

describe("GET /cases/:id", () => {
  it("returns 404 when the case doesn't exist", async () => {
    prisma.case.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/cases/999");

    expect(res.status).toBe(404);
  });

  it("returns the case when it exists", async () => {
    prisma.case.findUnique.mockResolvedValue({ id: 1, title: "Found" });

    const res = await request(app).get("/cases/1");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Found");
  });
});

describe("POST /cases", () => {
  it("creates a case and returns 201", async () => {
    prisma.case.create.mockResolvedValue({ id: 1, title: "New", content: "Body", status: "Open" });

    const res = await request(app).post("/cases").send({ title: "New", content: "Body" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New");
  });

  it("returns 400 when content is missing, through real HTTP validation", async () => {
    const res = await request(app).post("/cases").send({ title: "No content" });

    expect(res.status).toBe(400);
  });
});

describe("PUT /cases/:id", () => {
  it("returns 400 for a non-numeric id", async () => {
    const res = await request(app)
      .put("/cases/not-a-number")
      .send({ title: "T", content: "C", status: "Open" });

    expect(res.status).toBe(400);
  });

  it("updates and returns the case", async () => {
    prisma.case.update.mockResolvedValue({ id: 1, title: "Updated" });

    const res = await request(app)
      .put("/cases/1")
      .send({ title: "Updated", content: "Body", status: "Open" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
  });
});

describe("DELETE /cases/:id", () => {
  it("deletes and returns a confirmation message", async () => {
    prisma.case.delete.mockResolvedValue({ id: 1 });

    const res = await request(app).delete("/cases/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
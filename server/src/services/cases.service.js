import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const VALID_STATUSES = ["all", "Open", "In Review", "Closed"];
const VALID_AI_READY = ["all", "ready", "missing"];

export class ValidationError extends Error {}

export async function listCases({ page = 1, limit = 8, search = "", status = "all", aiReady = "all" }) {
  if (!VALID_STATUSES.includes(status)) {
    throw new ValidationError("Invalid status filter");
  }
  if (!VALID_AI_READY.includes(aiReady)) {
    throw new ValidationError("Invalid AI status filter");
  }

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status !== "all" ? { status } : {}),
    ...(aiReady === "ready" ? { analysis: { not: null } } : {}),
    ...(aiReady === "missing" ? { analysis: { equals: Prisma.DbNull } } : {}),
  };

  const [cases, total, aiReadyCount, openCasesCount] = await Promise.all([
    prisma.case.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.case.count({ where }),
    prisma.case.count({ where: { analysis: { not: Prisma.DbNull } } }),
    prisma.case.count({ where: { status: "Open" } }),
  ]);

  return {
    cases,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: { aiReady: aiReadyCount, openCases: openCasesCount },
  };
}

export async function getCaseById(id) {
  return prisma.case.findUnique({ where: { id } });
}

export async function createCase({ title, content }) {
  if (typeof title !== "string" || typeof content !== "string" || !title.trim() || !content.trim()) {
    throw new ValidationError("Title and content are required");
  }
  return prisma.case.create({
    data: { title: title.trim(), content: content.trim(), status: "Open" },
  });
}

export async function updateCase(id, { title, content, status }) {
  if (typeof title !== "string" || typeof content !== "string" || !title.trim() || !content.trim()) {
    throw new ValidationError("Title and content are required");
  }
  return prisma.case.update({
    where: { id },
    data: {
      title: title.trim(),
      content: content.trim(),
      status,
      contentUpdatedAt: new Date(),
    },
  });
}

export async function deleteCase(id) {
  return prisma.case.delete({ where: { id } });
}
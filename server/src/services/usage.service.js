import { prisma } from "../lib/prisma.js";

// Hard cap on total AI calls (analysis + search combined), enforced
// entirely in-app -- independent of, and in addition to, whatever
// spending limits are configured on the OpenAI account itself. Two
// independent backstops are safer than relying on one.
//
// Configurable via env var so it's easy to raise/lower without a code
// change; defaults to a conservative number appropriate for a portfolio
// demo running on a small prepaid credit balance.
const MAX_AI_CALLS = Number(process.env.MAX_AI_CALLS || 50);

export class UsageLimitError extends Error {}

/**
 * Atomically increments the shared usage counter and throws
 * UsageLimitError if the cap has been exceeded. Call this BEFORE making
 * any real OpenAI call, so a call that would exceed the limit never
 * actually happens.
 */
export async function incrementAndCheckUsage() {
  await prisma.usageCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, count: 0 },
  });

  const updated = await prisma.usageCounter.update({
    where: { id: 1 },
    data: { count: { increment: 1 } },
  });

  if (updated.count > MAX_AI_CALLS) {
    throw new UsageLimitError(
      `This demo has reached its usage limit (${MAX_AI_CALLS} AI calls). Please check back later.`
    );
  }

  return updated.count;
}

/** Returns the current count without incrementing -- for a status/debug endpoint if wanted later. */
export async function getUsageCount() {
  const row = await prisma.usageCounter.findUnique({ where: { id: 1 } });
  return row?.count ?? 0;
}
// A real evaluation harness for CaseFlow's AI analysis: runs a set of
// hand-labeled test cases through the actual generateCaseSummary service
// (real OpenAI calls, temperature 0) and scores the output against
// known-correct expectations. This is what turns "the AI seems to work"
// into an actual measured, citable number for the README.
//
// Two of the checks below (witness/witnessAnalysis consistency, footage
// evidence-type tagging) are direct regression tests for real bugs found
// during manual testing -- this harness makes sure they never silently
// come back.
//
// Run with: npm run eval   (from the server/ directory)
// Costs real OpenAI API calls -- one per fixture in eval/fixtures.js.

import "dotenv/config";
import { fixtures } from "./fixtures.js";
import { generateCaseSummary } from "../src/services/ai.service.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function namesMatch(a, b) {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  return na === nb || na.includes(nb) || nb.includes(na);
}

function scoreEntityExtraction(expectedPeople, extractedPeopleRaw) {
  const extracted = (extractedPeopleRaw || []).map((p) =>
    typeof p === "object" ? p.name ?? "" : String(p)
  );

  const truePositives = expectedPeople.filter((expectedName) =>
    extracted.some((name) => namesMatch(name, expectedName))
  );

  const recall = expectedPeople.length
    ? truePositives.length / expectedPeople.length
    : 1;
  const precision = extracted.length
    ? truePositives.length / extracted.length
    : expectedPeople.length === 0
    ? 1
    : 0;

  return {
    recall,
    precision,
    extractedCount: extracted.length,
    expectedCount: expectedPeople.length,
  };
}

function scoreWitnessConsistency(analysis) {
  const witnessNames = new Set(
    (analysis.witnesses || []).map((w) =>
      (typeof w === "object" ? w.name ?? "" : String(w)).toLowerCase().trim()
    )
  );
  const analysisNames = new Set(
    (analysis.witnessAnalysis || []).map((w) => (w.name ?? "").toLowerCase().trim())
  );

  if (witnessNames.size === 0 && analysisNames.size === 0) return true;
  if (witnessNames.size !== analysisNames.size) return false;

  for (const name of witnessNames) {
    if (!analysisNames.has(name)) return false;
  }
  return true;
}

function scoreEvidenceTypeTagging(analysis) {
  const footageEvents = (analysis.timeline || []).filter((event) =>
    /footage|camera|video|recording/i.test(event.event || "")
  );

  if (footageEvents.length === 0) {
    return { applicable: false, correct: 0, total: 0 };
  }

  const correct = footageEvents.filter((event) => event.type === "evidence").length;
  return { applicable: true, correct, total: footageEvents.length };
}

async function runEval() {
  console.log(`\nRunning CaseFlow eval harness: ${fixtures.length} fixtures\n`);

  const results = [];

  for (const fixture of fixtures) {
    process.stdout.write(`  ${fixture.id} ... `);

    try {
      const analysis = await generateCaseSummary(fixture.content);

      const entityScore = scoreEntityExtraction(
        fixture.expected.people,
        analysis.entities?.people
      );
      const hasContradiction = (analysis.contradictions || []).length > 0;
      const contradictionCorrect = hasContradiction === fixture.expected.hasContradiction;
      const witnessConsistent = scoreWitnessConsistency(analysis);
      const evidenceTagging = scoreEvidenceTypeTagging(analysis);
      const timelineOk = (analysis.timeline || []).length >= fixture.expected.minTimelineEvents;

      results.push({
        id: fixture.id,
        error: null,
        entityScore,
        contradictionCorrect,
        witnessConsistent,
        evidenceTagging,
        timelineOk,
      });

      console.log("done");
    } catch (err) {
      results.push({ id: fixture.id, error: err.message });
      console.log(`ERROR: ${err.message}`);
    }

    await sleep(500);
  }

  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const avgRecall = avg(successful.map((r) => r.entityScore.recall));
  const avgPrecision = avg(successful.map((r) => r.entityScore.precision));
  const contradictionAccuracy = avg(successful.map((r) => (r.contradictionCorrect ? 1 : 0)));
  const witnessConsistencyRate = avg(successful.map((r) => (r.witnessConsistent ? 1 : 0)));

  const evidenceApplicable = successful.filter((r) => r.evidenceTagging.applicable);
  const evidenceTaggingAccuracy = evidenceApplicable.length
    ? avg(evidenceApplicable.map((r) => r.evidenceTagging.correct / r.evidenceTagging.total))
    : null;

  const timelineCompletionRate = avg(successful.map((r) => (r.timelineOk ? 1 : 0)));

  console.log("\n─────────────────────────────────────────");
  console.log("CaseFlow AI Evaluation Results");
  console.log("─────────────────────────────────────────\n");

  console.log(`Fixtures run:               ${results.length}`);
  console.log(`Succeeded:                  ${successful.length}`);
  console.log(`Failed (API/parse errors):  ${failed.length}\n`);

  console.log(`Entity extraction recall:      ${(avgRecall * 100).toFixed(1)}%`);
  console.log(`Entity extraction precision:   ${(avgPrecision * 100).toFixed(1)}%`);
  console.log(`Contradiction detection acc.:  ${(contradictionAccuracy * 100).toFixed(1)}%`);
  console.log(`Witness/witnessAnalysis sync:  ${(witnessConsistencyRate * 100).toFixed(1)}%`);
  if (evidenceTaggingAccuracy !== null) {
    console.log(
      `Footage evidence tagging acc.: ${(evidenceTaggingAccuracy * 100).toFixed(1)}% (${evidenceApplicable.length} applicable cases)`
    );
  }
  console.log(`Timeline completeness:         ${(timelineCompletionRate * 100).toFixed(1)}%`);

  if (failed.length) {
    console.log("\nFailed fixtures:");
    failed.forEach((r) => console.log(`  - ${r.id}: ${r.error}`));
  }

  console.log("\nPer-fixture detail:");
  successful.forEach((r) => {
    console.log(
      `  ${r.id.padEnd(35)} recall=${(r.entityScore.recall * 100).toFixed(0)}%  ` +
        `precision=${(r.entityScore.precision * 100).toFixed(0)}%  ` +
        `contradiction=${r.contradictionCorrect ? "OK" : "WRONG"}  ` +
        `witnessSync=${r.witnessConsistent ? "OK" : "MISMATCH"}  ` +
        `timeline=${r.timelineOk ? "OK" : "SHORT"}`
    );
  });

  console.log("\n─────────────────────────────────────────\n");
}

runEval().catch((err) => {
  console.error("Eval run failed:", err);
  process.exit(1);
});
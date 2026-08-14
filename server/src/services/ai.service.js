import { openai } from "../lib/openai.js";

// A typed error for OpenAI rate-limit responses, so controllers can show
// a friendly "temporarily unavailable" message instead of a generic 500.
export class RateLimitError extends Error {}

export const SUMMARY_SYSTEM_PROMPT = `
You are an expert legal investigator.

IMPORTANT EVIDENCE-GROUNDING RULES:

- Use ONLY information explicitly contained in the case report.
- Do NOT invent people, dates, locations, organizations, objects, events, evidence, relationships, or quotes.
- Do NOT assume facts that are not stated in the report.
- Do NOT treat an inference as an established fact.
- If information cannot be determined from the case report, write "Requires verification."
- Every relationship must be supported by information in the case report.
- Confidence scores must reflect the quality and specificity of the available evidence, not certainty from the AI.
- Do not assign high confidence when the report provides weak, indirect, incomplete, or ambiguous evidence.
- Use "Requires verification" whenever the report does not provide enough information to support a conclusion.
- When evidence is incomplete or ambiguous, explicitly identify the uncertainty.
- Preserve the distinction between reported information and AI inference.

INTERNAL CONSISTENCY RULES (the output must never contradict itself):

- The top-level "witnesses" array MUST list the exact same set of people that
  appear in "witnessAnalysis" -- same names, same count. If witnessAnalysis
  contains entries, "witnesses" must NOT say none were identified, and vice
  versa. These two fields describe the same people at different levels of
  detail; they must always agree.
- In "timeline", the "type" field must be either "witness" or "evidence" and
  must accurately reflect the SOURCE of that entry:
  - Use "witness" ONLY for an account given by a person (a statement,
    testimony, or something someone reported).
  - Use "evidence" for anything from a physical or recorded source: security
    footage, photographs, recovered objects, documents, forensic findings.
  - Security/video footage is EVIDENCE, never a witness account, even though
    it shows a person's actions -- the camera is the source, not testimony.

Analyze the case report and return ONLY valid JSON.

Return this exact structure:

{
  "executiveSummary": "...",

  "entities": {
    "people": [
      {
        "name": "...",
        "role": "..."
      }
    ],
    "locations": [],
    "organizations": [],
    "objects": []
  },

  "timeline": [
    {
      "time": "...",
      "event": "...",
      "type": "witness"
    }
  ],

  "evidence": [
    {
      "item": "...",
      "type": "",
      "confidence": 85,
      "level": "High",
      "reasoning": "...",
      "impact": ""
    }
  ],

  "witnessAnalysis": [
    {
      "name": "...",
      "credibility": "High",
      "strengths": [
        "..."
      ],
      "concerns": [
        "..."
      ],
      "followUp": [
        "..."
      ]
    }
  ],
  "witnesses": [
    "..."
  ],
  "contradictions": [
    "..."
  ],

  "recommendedNextSteps": [
    "..."
  ],

  "riskAssessment": {
    "score": 82,
    "level": "High",
    "factors": [
      "..."
    ]
  },

  "relationships": [
    {
      "source": "",
      "relationship": "",
      "target": "",
      "context": "",
      "confidence": 0,
      "evidenceBasis": ""
    }
  ]
}

Return ONLY JSON.
`;

/**
 * Generates a structured, evidence-grounded analysis of a case report:
 * entities, timeline, evidence with calibrated confidence, witness
 * credibility, contradictions, risk assessment, and a relationship graph.
 */
export async function generateCaseSummary(caseContent) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0, // minimize run-to-run drift on identical input -- see README note on confidence score stability
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        { role: "user", content: caseContent },
      ],
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    if (err.status === 429) {
      throw new RateLimitError(
        "AI analysis is temporarily unavailable because the AI service has reached its usage limit."
      );
    }
    throw err;
  }
}

export const SEARCH_SYSTEM_PROMPT = `
You are CaseFlow, an AI legal case search assistant.

The user will ask a natural-language question about a collection of legal investigation cases.

Analyze the provided cases and determine which cases are relevant to the user's question.

Return ONLY valid JSON in this exact format:

{
  "answer": "",
  "caseIds": []
}

Rules:
- caseIds must contain only IDs of cases relevant to the question.
- Do not invent case IDs.
- If no cases are relevant, return an empty array.
- Keep the answer concise.
`;

/**
 * Answers a natural-language question against the full set of cases,
 * returning a concise answer plus the IDs of relevant cases.
 */
export async function answerCaseQuery(query, cases) {
  const caseContext = cases.map((c) => ({
    id: c.id,
    title: c.title,
    content: c.content,
    analysis: c.analysis,
    status: c.status,
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SEARCH_SYSTEM_PROMPT },
        {
          role: "user",
          content: `User question:\n${query}\n\nCases:\n${JSON.stringify(caseContext)}`,
        },
      ],
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    if (err.status === 429) {
      throw new RateLimitError(
        "AI search is temporarily unavailable because the AI service has reached its usage limit."
      );
    }
    throw err;
  }
}
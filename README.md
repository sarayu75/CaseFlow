# CaseFlow

**[Live Demo](https://caseflow-demo.netlify.app)** — try it yourself, no login required.

CaseFlow is a full-stack legal case investigation assistant. You input a
case report — witness statements, evidence, timeline of events — and it
generates a structured investigative analysis: entity extraction, a
reconstructed timeline, evidence graded by confidence, witness
credibility assessment, contradiction detection, a relationship graph,
and recommended next steps.

## Why this is more than "call an LLM and print the response"

The interesting engineering problem here isn't calling OpenAI — it's
making an LLM's output **trustworthy enough to act on** in a domain
where a confident-sounding hallucination is actively dangerous. The
system prompt driving case analysis (`server/src/services/ai.service.js`)
is built around explicit evidence-grounding rules:

- The model may only use information explicitly present in the case
  report — no inventing people, dates, locations, or relationships.
- Confidence scores must reflect the *quality and specificity of the
  evidence*, not the model's own certainty — weak or ambiguous evidence
  gets a low score even if the model "sounds" confident.
- Anything the report doesn't clearly support gets flagged
  `"Requires verification"` instead of being asserted as fact.

This matters because the failure mode of an ungrounded legal-analysis
tool isn't "occasionally wrong" — it's "confidently wrong in a way that
looks authoritative," which is a much worse outcome in an investigative
context than the tool simply saying "I don't know."

## Architecture

```
        React frontend (Vite)
             |
        REST API (Express)
             |
    +--------+---------+
    |                  |
 routes/           routes/
 cases.routes.js   ai.routes.js
    |                  |
 controllers/      controllers/
 cases.controller  ai.controller
    |                  |
 services/         services/
 cases.service.js  ai.service.js  ---> OpenAI (structured JSON output)
    |
 Prisma ORM
    |
 PostgreSQL
```

The backend follows a standard layered structure: **routes** just wire
URLs to handlers, **controllers** translate between HTTP and business
logic (turning a `ValidationError` into a 400, a missing case into a
404), and **services** hold the actual business logic and are the layer
that's unit tested — with no HTTP or database mocking gymnastics needed,
since they're plain functions.

## Tech stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express
- **Database:** PostgreSQL via Prisma ORM (migrations tracked in `server/prisma/migrations`)
- **AI:** OpenAI (structured JSON output mode)
- **Testing:** Vitest

## Running it locally

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env: set DATABASE_URL (a running Postgres instance) and OPENAI_API_KEY
npx prisma migrate deploy
npm run dev
```

Server runs on `http://localhost:5001` by default.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env   # defaults already point at localhost:5001, edit if needed
npm run dev
```

Frontend runs on Vite's default dev port (usually `http://localhost:5173`).

## Testing

```bash
cd server
npm test
```

Tests run against the **service layer directly**, with Prisma and OpenAI
both mocked — no live database or API key required to run them. This is
deliberate: a reviewer (or a CI pipeline) should be able to run the test
suite with zero external setup. Coverage includes:

- Input validation (empty titles, invalid status/filter values)
- Correct pagination math and search-filter construction
- The OpenAI 429 rate-limit path converting into a typed `RateLimitError`
  rather than a raw crash
- That the AI search endpoint only sends the fields it should to OpenAI
  (a regression test against accidentally leaking extra case data into
  the prompt)

## Known limitations (deliberate scope cuts, not oversights)

- **No authentication.** Any client can hit any endpoint — including the
  live deployed version, which has no login and a single shared
  database. Anyone with the link can create, edit, or delete cases; the
  usage cap and rate limiting protect against cost abuse, but not against
  someone modifying demo data. This is a deliberate scope decision for a
  portfolio project, not an oversight — a real deployment handling actual
  case data would need real auth (sessions or JWT) before going live.
- **CORS is wide open (`origin: "*"`).** Same reasoning — acceptable for
  local development, would need a real allowlist before any public
  deployment.
- **AI analysis costs real API calls.** There's no caching or rate
  limiting on the CaseFlow side beyond what OpenAI itself enforces.

## Roadmap ideas

- [ ] Authentication + per-user case ownership
- [ ] Streaming AI responses instead of waiting for the full JSON payload
- [ ] Caching repeated `/api/ask-caseflow` queries
- [ ] End-to-end tests against a real (containerized) test database

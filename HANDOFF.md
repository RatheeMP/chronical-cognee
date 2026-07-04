# Chronicle — Engineering Handoff

This document summarizes the Chronicle hackathon demo as built. A new engineer can onboard from here without reading prior conversations.

---

## What Chronicle Is

Chronicle is a demo application that stores organizational memories in **Cognee Cloud**, queries them in natural language, and visualizes how past decisions connect to current questions. It is intentionally minimal: no authentication, no persistence in the frontend, and no production hardening beyond what is needed for a live demo.

**Repository layout:**

```
chronicle/
├── frontend/          Next.js 16 (App Router), TypeScript, Tailwind CSS 4
├── backend/           FastAPI + httpx Cognee Cloud client
├── docs/              Cognee API research notes (cognee-notes.md)
├── backend/scripts/   Verification scripts against real Cognee Cloud
├── README.md          Quick start
└── HANDOFF.md         This file
```

---

## Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (localhost:3000)                                   │
│  Next.js — single page, session-only React state            │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch → NEXT_PUBLIC_API_URL
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI (localhost:8000)                                   │
│  /api/v1/health          health check                         │
│  /memory/*               Chronicle memory API                 │
│    → services/*          orchestration                        │
│    → integrations/cognee/client.py   httpx REST client        │
└──────────────────────────┬──────────────────────────────────┘
                           │ X-Api-Key
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Cognee Cloud (tenant URL)                                  │
│  POST /api/v1/remember | recall | improve | forget | …      │
└─────────────────────────────────────────────────────────────┘
```

**Design principles:**

- **Demo first** — thin BFF over Cognee; no embedded Cognee SDK.
- **Passthrough where specified** — `remember`, `recall`, `improve`, and `forget` return Cognee JSON unchanged (except structured endpoints below).
- **Structured where needed** — `impact` and `explore` add Chronicle-specific shaping on top of multiple recall calls.
- **No auth** — all endpoints are open; suitable for local/hackathon demo only.

**Backend layers:**

| Layer | Path | Role |
|-------|------|------|
| Routes | `backend/app/api/` | HTTP handlers, CORS, error mapping |
| Models | `backend/app/models/memory.py` | Pydantic request bodies |
| Services | `backend/app/services/` | Business logic, multi-step Cognee flows |
| Integration | `backend/app/integrations/cognee/client.py` | Official Cognee Cloud REST calls |
| Config | `backend/app/config/settings.py` | Env vars via pydantic-settings |

**Frontend layers:**

| Layer | Path | Role |
|-------|------|------|
| Page | `frontend/src/app/page.tsx` | Shell + header |
| Dashboard | `frontend/src/components/ChronicleDashboard.tsx` | Wires panels + Memory Explorer state |
| API client | `frontend/src/lib/api.ts` | Typed fetch wrappers |

---

## Completed Milestones

| Milestone | Feature | Status |
|-----------|---------|--------|
| 1 | Monorepo scaffold (Next.js + FastAPI) | Done |
| 2 | Cognee API research (`docs/cognee-notes.md`) | Done |
| 3 | Cognee Cloud integration (`remember` via httpx) | Done |
| 4 | Memory Feed (remember + session feed UI) | Done |
| 5 | Ask Chronicle (`recall` Q&A panel) | Done |
| 6 | Decision Impact (`/memory/impact` + structured reasoning) | Done |
| 7 | Memory Explorer (visual reasoning chain after Ask/Impact) | Done |
| 8 | Memory Evolution (`/memory/improve`) | Done |
| 9 | Memory Lifecycle (`/memory/forget`) | Done |
| QA | Full audit, lint/build/tests green | Done |

---

## API Endpoints

Base URL: `http://localhost:8000` (development)

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API welcome message |
| GET | `/api/v1/health` | Returns `{"status": "ok"}` |

### Memory (prefix `/memory`)

| Method | Path | Request body | Response |
|--------|------|--------------|----------|
| POST | `/memory/remember` | `{ "text": string }` | Cognee remember JSON (passthrough) |
| POST | `/memory/recall` | `{ "query": string }` | Cognee recall JSON array (passthrough) |
| POST | `/memory/impact` | `{ "question": string }` | Structured impact analysis (see below) |
| POST | `/memory/explore` | `{ "query": string }` | Reasoning chain for Memory Explorer |
| POST | `/memory/improve` | `{ "dataset_name": string, "instructions"?: string }` | Cognee improve JSON (passthrough) |
| POST | `/memory/forget` | `{ "dataset_name": string, "data_id": string }` | Cognee forget JSON (passthrough) |

**Error handling (all `/memory/*` routes):**

- Cognee HTTP errors → same status code, Cognee body in `detail`
- Forget 404 → `"Memory not found."`
- Network failures → `502` with message

**`POST /memory/impact` response shape:**

```json
{
  "summary": "string",
  "supporting_memories": ["string"],
  "reasoning": "string",
  "potential_impacts": ["string"],
  "reasoning_chain": {
    "nodes": [
      {
        "id": "string",
        "type": "memory | question",
        "title": "string",
        "content": "string",
        "preview": "string",
        "timestamp": "string | null",
        "order": 0
      }
    ],
    "edges": [{ "from": "string", "to": "string" }]
  }
}
```

Impact uses multiple Cognee `recall` calls (CHUNKS + GRAPH_COMPLETION with memory-only system prompts). It does not invent facts or predict the future.

**`POST /memory/explore` response shape:**

```json
{
  "reasoning_chain": { "nodes": [], "edges": [] },
  "supporting_memories": ["string"]
}
```

---

## Frontend Components

Single page at `/`. All panels are client components; state is **session-only** (lost on refresh).

| Component | File | Purpose |
|-----------|------|---------|
| **ChronicleDashboard** | `ChronicleDashboard.tsx` | Composes all panels; holds Memory Explorer chain state |
| **MemoryFeed** | `MemoryFeed.tsx` | Remember textarea + Memory Lifecycle feed with Forget |
| **MemoryEvolution** | `MemoryEvolution.tsx` | Run Improve on a dataset |
| **AskChronicle** | `AskChronicle.tsx` | Natural-language Q&A via recall |
| **DecisionImpact** | `DecisionImpact.tsx` | What-if analysis via impact |
| **MemoryExplorer** | `MemoryExplorer.tsx` | Animated vertical reasoning path (shown after Ask or Impact) |

**Panel order on page:** Memory Feed → Memory Evolution → Ask Chronicle → Decision Impact → Memory Explorer (conditional)

**API client:** `frontend/src/lib/api.ts` — functions: `rememberMemory`, `recallMemory`, `analyzeImpact`, `exploreReasoning`, `improveMemory`, `forgetMemory`. Also exports `fetchHealth` (unused in UI; available for future health indicator).

---

## Backend Services

| Service | File | Responsibility |
|---------|------|----------------|
| **memory_service** | `services/memory_service.py` | `remember_text`, `recall_query`, `improve_dataset`, `forget_memory` |
| **impact_service** | `services/impact_service.py` | Multi-recall decision impact analysis + reasoning chain |
| **reasoning_service** | `services/reasoning_service.py` | Parse CHUNKS, filter relevant memories, build explorer chain |

**CogneeClient** (`integrations/cognee/client.py`):

| Method | Cognee endpoint | Notes |
|--------|-----------------|-------|
| `remember()` | `POST /api/v1/remember` | Multipart text upload |
| `recall()` | `POST /api/v1/recall` | Optional `searchType`, `systemPrompt` |
| `improve()` | `POST /api/v1/improve` | Falls back to `POST /api/v1/cognify` on 404 |
| `forget()` | `POST /api/v1/forget` | `dataset` + `dataId` |
| `update()` | `PATCH /api/v1/update` | Used in verify scripts only (not exposed via Chronicle API) |

---

## Environment Variables

| Variable | Location | Required | Description |
|----------|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | No | Backend URL (default `http://localhost:8000`) |
| `COGNEE_SERVICE_URL` | `backend/.env` | Yes | Cognee Cloud tenant URL |
| `COGNEE_API_KEY` | `backend/.env` | Yes | Cognee Cloud API key |
| `COGNEE_DATASET_NAME` | `backend/.env` | Yes | Default dataset (e.g. `main_dataset`) |
| `CORS_ORIGINS` | `backend/.env` | No | Default `http://localhost:3000` |
| `ENVIRONMENT` | `backend/.env` | No | Default `development` |

Copy from `frontend/.env.local.example` and `backend/.env.example`.

---

## Running Locally

```powershell
# From repo root
npm install
npm run dev          # frontend :3000 + backend :8000

# Or separately
cd backend && .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

**Tests:**

```powershell
cd backend
.venv\Scripts\python -m pytest tests/    # 16 tests, mocked services

cd frontend
npm run lint
npm run build
```

**Verification scripts** (require real Cognee credentials in `backend/.env`):

| Script | Validates |
|--------|-----------|
| `scripts/verify_remember.py` | Remember |
| `scripts/verify_recall.py` | Recall / Ask |
| `scripts/verify_impact.py` | Decision Impact |
| `scripts/verify_explorer.py` | Reasoning chain |
| `scripts/verify_improve.py` | Memory evolution (isolated dataset) |
| `scripts/verify_forget.py` | Forget (isolated dataset) |

---

## Current State

- **All 9 feature milestones + QA are complete.**
- Frontend production build passes (`npm run build`).
- ESLint and TypeScript checks pass.
- Backend unit tests pass (16/16).
- Chronicle implements the full Cognee memory lifecycle in the UI: **Remember → Recall → Impact → Explore → Improve → Forget**.
- README is partially outdated (still lists only remember/recall); **this handoff and the codebase are authoritative.**

---

## Known Limitations

### Platform / Cognee Cloud

- **Improve endpoint:** Some tenant versions (e.g. v1.2.2) do not expose `POST /api/v1/improve`. The client automatically falls back to `POST /api/v1/cognify` with the same dataset.
- **Forget + graph completion:** After forget, **CHUNKS retrieval is empty** (memory removed), but **GRAPH_COMPLETION** may briefly repeat a prior synthesized answer if the same question was asked before forget. This is Cognee graph-cache behavior, not a Chronicle bug.
- **Polluted datasets:** `main_dataset` may contain memories from many verification runs. Demo flows work best with fresh, isolated datasets or session-only feed entries.

### Application

- **No authentication** — do not expose publicly without adding auth.
- **No frontend persistence** — feed items and answers are lost on refresh.
- **Feed `dataId`:** Remember returns all item IDs in a dataset; the feed uses the last ID. On a busy dataset this may not match the newly stored memory. Use isolated datasets for reliable Forget demos.
- **No graph visualization** — Memory Explorer is a sequential card flow, not a force-directed graph.
- **Ask + Explore:** If `/memory/explore` fails after a successful recall, the answer still displays; Memory Explorer is best-effort.
- **Long-running Cognee calls** — remember/improve can take 30–120+ seconds; client timeout is 300s.

---

## Remaining Work (Not in Scope for Hackathon Demo)

These were explicitly deferred or marked out of scope during development:

| Item | Notes |
|------|-------|
| Authentication / multi-user | Not implemented |
| Frontend persistence | Feed is session-only |
| Database / Redis | None; Cognee Cloud is the only store |
| Graph visualization | Explicitly excluded |
| Production deployment | Docker, CI/CD, secrets management |
| README update | Still references early milestones only |
| `fetchHealth` UI | API helper exists; no health indicator in UI |
| Pagination / scalability | Not needed for demo |
| Forget graph invalidation | Depends on Cognee; no Chronicle-side graph rebuild after forget |
| httpx2 / Starlette deprecation | TestClient warning in pytest; third-party |

---

## Recommended Demo Flow

Use this sequence for a live hackathon presentation (~5–8 minutes).

### Setup (before demo)

1. Ensure `backend/.env` has valid Cognee Cloud credentials.
2. Run `npm run dev` from repo root.
3. Open http://localhost:3000

### Act 1 — Store context (Memory Feed)

Store these memories (or similar):

1. `Customer interviews revealed that users were confused during onboarding.`
2. `Product Meeting #12: The team decided to redesign onboarding before implementing enterprise features.`
3. `Enterprise SSO was postponed until the onboarding redesign is complete.`
4. `Analytics show onboarding completion improved from 41% to 79% after the redesign.`

### Act 2 — Ask Chronicle

**Question:** `Why did we postpone Enterprise SSO?`

Show the synthesized answer and the **Memory Explorer** reasoning path.

### Act 3 — Decision Impact (signature feature)

**Question:** `What happens if we restart Enterprise SSO today?`

Walk through: Summary → Supporting Memories → Reasoning → Potential Impacts → Explorer path.

Emphasize: impacts are derived only from retrieved memories, not invented.

### Act 4 — Memory Evolution

1. Remember an update: `Update: Enterprise SSO work has resumed after onboarding redesign reached 79% completion.`
2. Click **Run Improve** on dataset `main_dataset`.
3. Ask the same impact or status question again; note evolved reasoning.

*(For reliable evolution demos, use an isolated dataset — see `verify_improve.py`.)*

### Act 5 — Memory Lifecycle (Forget)

1. Forget one feed entry via **Forget** → confirm dialog.
2. See **Memory forgotten.** message.
3. Ask a question that depended on that memory; note reduced influence.

*(Verification uses isolated datasets + CHUNKS check — see `verify_forget.py`.)*

### Fallback talking points

- If Cognee is slow: narrate that remember/improve builds the knowledge graph in real time.
- If Improve takes long: explain it enriches/reconciles the graph after new evidence.
- If Explorer does not appear: Ask or Impact must complete successfully first.

---

## Key Files Quick Reference

```
backend/app/main.py                          FastAPI app entry
backend/app/api/memory.py                    All /memory routes
backend/app/integrations/cognee/client.py      Cognee REST client
backend/app/services/impact_service.py         Decision Impact logic
backend/app/services/reasoning_service.py      Explorer chain builder
frontend/src/components/ChronicleDashboard.tsx  Main UI composition
frontend/src/lib/api.ts                        Frontend API client
docs/cognee-notes.md                           Cognee API reference notes
```

---

## Contacts & References

- **Cognee docs:** https://docs.cognee.ai
- **Internal API notes:** `docs/cognee-notes.md`
- **FastAPI docs (local):** http://localhost:8000/docs

---

*Last updated: handoff after Milestone 9 (Forget) and QA audit.*

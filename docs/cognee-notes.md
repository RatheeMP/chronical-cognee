# Cognee API Notes

Research notes from the official Cognee documentation (API Reference + Tenant/Permissions API). Sources:

- [API Reference Introduction](https://docs.cognee.ai/api-reference/introduction)
- [Remember](https://docs.cognee.ai/api-reference/remember/remember)
- [Remember Entry](https://docs.cognee.ai/api-reference/remember/remember-entry)
- [Recall](https://docs.cognee.ai/api-reference/recall/recall)
- [Improve](https://docs.cognee.ai/api-reference/improve/improve)
- [Memify (legacy)](https://docs.cognee.ai/api-reference/memify/memify)
- [Forget](https://docs.cognee.ai/api-reference/forget/forget-endpoint)
- [Permissions & Access Control / Tenant API](https://docs.cognee.ai/cognee-cloud/functionality/permissions-and-access-control)
- [Select Tenant](https://docs.cognee.ai/api-reference/permissions/select-tenant)
- [Get My Tenants](https://docs.cognee.ai/api-reference/permissions/get-my-tenants)
- [Cloud SDK](https://docs.cognee.ai/cognee-cloud/connections/cloud-sdk)

---

## Authentication

Cognee supports two auth schemes on the same API surface:

| Mode | Header | When to use |
|------|--------|-------------|
| **API Key** | `X-Api-Key: <key>` | Cognee Cloud (recommended for Chronicle) |
| **Bearer JWT** | `Authorization: Bearer <token>` | Self-hosted with auth enabled |

**Cognee Cloud**

- Create an API key in the dashboard (API Keys page). Keys are shown once at creation.
- All tenant-scoped memory operations use the **tenant service URL** + `X-Api-Key`.
- Swagger for Cloud: `https://api.cognee.ai/docs`

**Self-hosted (local Docker / REST server)**

- Auth is optional by default.
- Enable with `REQUIRE_AUTHENTICATION=true` in Cognee `.env`, then:
  - `POST /api/v1/auth/register` — create user
  - `POST /api/v1/auth/login` — obtain Bearer token
- If `ENABLE_BACKEND_ACCESS_CONTROL=true`, auth is required even when `REQUIRE_AUTHENTICATION=false`.
- Local Swagger: `http://localhost:8000/docs`

**Important:** Do not confuse Cloud env vars. For Cloud use `COGNEE_SERVICE_URL` + `COGNEE_API_KEY`. The older `API_URL` / `API_TOKEN` pair is for self-hosted MCP/API mode, not Cognee Cloud.

---

## Base URL

All memory endpoints share the `/api/v1` prefix. `/api` without `/v1` returns 404.

| Deployment | Base URL | Purpose |
|------------|----------|---------|
| **Cognee Cloud (tenant)** | `https://<your-tenant>.aws.cognee.ai` | remember, recall, improve, forget, datasets |
| **Cognee Cloud (platform)** | `https://api.aws.cognee.ai` | tenants, API keys, billing, account |
| **Cognee Cloud (docs gateway)** | `https://api.cognee.ai` | OpenAPI / Swagger reference |
| **Local self-hosted** | `http://localhost:8000` | Full REST API when running Cognee locally |

**Two-layer Cloud model**

1. **Platform API** (`api.aws.cognee.ai`) — account/tenant management.
2. **Tenant service URL** (`https://<tenant>.aws.cognee.ai`) — knowledge graph operations.

Retrieve tenant service URL via `GET /api/v1/tenants/current/service-url` on the platform API, or copy it from the Cloud dashboard / API Keys page.

---

## v1.0 Memory Operations vs Legacy

| v1.0 (preferred) | HTTP endpoint | Notes |
|------------------|---------------|-------|
| **remember** | `POST /api/v1/remember` | Ingest + build graph in one call |
| **remember (typed)** | `POST /api/v1/remember/entry` | QA/trace/feedback/skill_run entries |
| **recall** | `POST /api/v1/recall` | Memory-oriented alias for search |
| **improve** | `POST /api/v1/improve` | Memory-oriented alias for memify |
| **forget** | `POST /api/v1/forget` | Unified deletion |

| Legacy (lower-level) | HTTP endpoint |
|----------------------|---------------|
| add | `POST /api/v1/add` |
| cognify | `POST /api/v1/cognify` |
| search | `POST /api/v1/search` |
| memify | `POST /api/v1/memify` |

**Improve vs memify:** `POST /api/v1/improve` is the v1.0 user-facing enrichment API and is documented as a memory-oriented alias for memify. Prefer `improve` for Chronicle unless custom extraction/enrichment task lists require the lower-level memify surface.

---

## API Endpoints

### Remember — `POST /api/v1/remember`

Ingest data and build the knowledge graph in a single call (combines legacy add + cognify).

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | file[] | — | Files to upload |
| `datasetName` | string | one of name/id | Target dataset (created if missing) |
| `datasetId` | UUID | one of name/id | Existing dataset UUID |
| `session_id` | string | — | Session cache mode; bridges to graph in background |
| `node_set` | string[] | — | Tag graph nodes for scoped recall |
| `run_in_background` | bool | — | Return immediately; poll status (default: false) |
| `custom_prompt` | string | — | Override entity-extraction prompt |
| `chunk_size` | int | — | Max tokens per chunk (default: 4096) |
| `chunks_per_batch` | int | — | Cognify batch size (default: 36) |
| `ontology_key` | string[] | — | Previously uploaded ontology keys |
| `graph_model` | string (JSON) | — | Custom graph schema |
| `content_type` | string | — | `"skills"` for SKILL.md ingestion |
| `skills_text` | string | — | Inline SKILL.md when `content_type=skills` |
| `skill_name` | string | — | Skill slug when using `skills_text` |

**Errors:** 400 (missing dataset, bad schema), 409 (processing error), 422 (validation)

**SDK-only (not available over HTTP):** custom `chunker`, `self_improvement`, `session_ids`, `preferred_loaders`, etc.

---

### Remember Entry — `POST /api/v1/remember/entry`

Store typed session/graph entries (JSON).

**Content-Type:** `application/json`

```json
{
  "entry": { "type": "qa", "question": "...", "answer": "..." },
  "dataset_name": "main_dataset",
  "session_id": "claude-code-1718000000",
  "skill_improvement": null
}
```

**Entry types:** `qa`, `trace`, `feedback`, `skill_run` (discriminated by `entry.type`).

- `qa` / `trace` / `feedback` require `session_id`.
- `skill_run` is graph-backed; session optional.
- `feedback` requires `qa_id` from a prior QA remember call.

---

### Recall — `POST /api/v1/recall`

Query memory (alias for search with memory-oriented defaults).

**Content-Type:** `application/json`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `query` | string | — | Search query (required) |
| `searchType` | enum | `GRAPH_COMPLETION` | Search strategy; `null` = auto-route |
| `datasets` | string[] | — | Dataset names to search |
| `datasetIds` | UUID[] | — | Takes precedence over names |
| `sessionId` | string | — | Search session cache QA/traces |
| `scope` | string \| string[] | `"auto"` | `graph`, `session`, `trace`, `graph_context`, `session_context`, `all`, `auto` |
| `nodeName` | string[] | — | Filter to node sets from remember |
| `topK` | int | 15 | Max results |
| `onlyContext` | bool | false | Return LLM context only |
| `verbose` | bool | false | Verbose output |
| `includeReferences` | bool | false | Source references in completions |
| `systemPrompt` | string | — | System prompt for completion searches |
| `contextProfile` | string | `"qa"` | For `session_context` scope: `qa` or `agent` |

Both camelCase and snake_case field names are accepted.

**Errors:** 403 (permission denied → empty list), 409 (recall error), 422 (no ingested data yet)

**Response:** JSON array of discriminated result objects by `source`:

| `source` | Shape |
|----------|-------|
| `session` | QA entry (time, question, context, answer, qa_id, …) |
| `trace` | Agent trace (trace_id, origin_function, status, …) |
| `graph_context` | `{ source, content }` |
| `session_context` | `{ source, content, context_profile }` |
| `graph` | `{ kind, search_type, text, score, dataset_id, metadata, … }` |

---

### Improve — `POST /api/v1/improve`

Enrich an existing knowledge graph (v1.0 alias for memify).

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `datasetName` | string | one of name/id | Target dataset |
| `datasetId` | UUID | one of name/id | Target dataset UUID |
| `extractionTasks` | string[] | — | Custom extraction tasks |
| `enrichmentTasks` | string[] | — | Custom enrichment tasks |
| `data` | string | — | Custom input; empty = use existing graph |
| `nodeName` | string[] | — | Restrict to named entities |
| `sessionIds` | string[] | — | Bridge session Q&A/feedback into graph |
| `runInBackground` | bool | false | Async execution |
| `buildGlobalContextIndex` | bool | false | Build global context index after enrichment |

**Errors:** 400 (missing dataset), 409 (processing error), 422 (validation)

**Response:** JSON object (additional properties allowed; status/metadata from pipeline).

---

### Memify (legacy) — `POST /api/v1/memify`

Lower-level enrichment pipeline. Same payload shape as improve (without `sessionIds` / `buildGlobalContextIndex` in the documented HTTP schema). Use only when custom task lists are required and improve is insufficient.

---

### Forget — `POST /api/v1/forget`

Unified deletion API.

**Content-Type:** `application/json`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `dataset` | string | — | Dataset name (provide name **or** id, not both) |
| `datasetId` | UUID | — | Dataset UUID |
| `dataId` | UUID | — | Single item; requires dataset |
| `everything` | bool | false | Delete all user-owned data |
| `memoryOnly` | bool | false | Clear graph+vector only; keep raw files |

**Modes:**

- `everything: true` — wipe all datasets/data for current user
- `dataset` alone — delete entire dataset
- `dataset` + `dataId` — delete one item
- `dataset` + `memoryOnly: true` — reset memory, preserve files for re-cognify
- `dataset` + `dataId` + `memoryOnly: true` — reset memory for one file

**Errors:** 422 (invalid combo), 500 (deletion error)

**Response:** JSON object (summary; fields vary by mode: status, dataset_id, data_id, datasets_removed).

---

## Tenant / Permissions API

Used for multi-tenant workspace management on Cognee Cloud. Memory operations run against the **tenant service URL**, not the platform API.

### Platform API (`https://api.aws.cognee.ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tenants` | Create tenant |
| DELETE | `/api/v1/tenants` | Remove tenant |
| GET | `/api/v1/tenants/current` | Current tenant details |
| GET | `/api/v1/tenants/current/service-url` | Tenant service URL for memory ops |
| POST | `/api/v1/tenants/users` | Assign user to tenant |
| DELETE | `/api/v1/tenants/users` | Remove user from tenant |

### Permissions / tenant selection

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/permissions/tenants/select` | Set active tenant |
| GET | `/api/v1/permissions/tenants/me` | List user's tenants → `[{"id", "name"}]` |
| GET | `/api/v1/permissions/tenants/{tenant_id}/users` | List users in tenant |
| POST | `/api/v1/permissions/roles` | Create role |
| POST | `/api/v1/permissions/users/{user_id}/roles` | Assign role |
| GET | `/api/v1/permissions/tenants/{tenant_id}/roles` | List roles |
| POST | `/api/v1/permissions/datasets/{principal_id}?permission_name=read\|write\|delete` | Grant dataset access |

**Select tenant request:**

```json
{ "tenantId": "<uuid-or-null>" }
```

`null` selects the default single-user tenant. Selected tenant is persisted (Cloud UI uses `cognee_selected_tenant` cookie).

---

## Request / Response Formats (summary)

| Operation | Method | Content-Type | Body style |
|-----------|--------|--------------|------------|
| remember | POST | multipart/form-data | Form fields + file uploads |
| remember/entry | POST | application/json | Typed entry object |
| recall | POST | application/json | RecallPayloadDTO |
| improve | POST | application/json | ImprovePayloadDTO |
| forget | POST | application/json | ForgetPayloadDTO |

**Common headers:**

```http
X-Api-Key: <key>          # Cognee Cloud
Content-Type: application/json   # JSON endpoints
```

**Standard error shape (422):**

```json
{
  "detail": [
    { "loc": ["body", "query"], "msg": "field required", "type": "missing" }
  ]
}
```

**Health check:** `GET /health` (no `/api/v1` prefix per intro examples)

---

## Required Environment Variables

For Chronicle backend integration with **Cognee Cloud**:

| Variable | Required | Description |
|----------|----------|-------------|
| `COGNEE_SERVICE_URL` | Yes | Tenant URL, e.g. `https://your-tenant.aws.cognee.ai` |
| `COGNEE_API_KEY` | Yes | API key from Cloud dashboard |
| `COGNEE_DATASET_NAME` | Recommended | Default dataset for Chronicle memory (e.g. `chronicle`) |

Optional (multi-tenant / platform management):

| Variable | Description |
|----------|-------------|
| `COGNEE_PLATFORM_URL` | Platform API base, default `https://api.aws.cognee.ai` |
| `COGNEE_TENANT_ID` | Active tenant UUID if app manages tenant switching |

For **local Cognee** during development:

| Variable | Description |
|----------|-------------|
| `COGNEE_SERVICE_URL` | `http://localhost:8000` |
| `COGNEE_API_KEY` | Empty if auth disabled |
| `COGNEE_BEARER_TOKEN` | JWT if local auth enabled |

Add these to `backend/.env.example` when implementing — not added in this milestone.

---

## Python Integration Approach

Two supported paths. Chronicle should start with **HTTP client (httpx)** to keep the FastAPI backend decoupled from Cognee's async SDK lifecycle.

### Option A — REST via httpx (recommended for Chronicle)

```
backend/app/
  integrations/
    cognee/
      client.py       # Thin async httpx wrapper
      schemas.py      # Request/response Pydantic models mirroring Cognee DTOs
      errors.py       # Map HTTP status → domain exceptions
```

**Client responsibilities:**

1. Read `COGNEE_SERVICE_URL` + `COGNEE_API_KEY` from settings.
2. Attach `X-Api-Key` on every request.
3. Expose four methods mapping 1:1 to documented endpoints:
   - `remember(...)` → `POST /api/v1/remember` or `/remember/entry`
   - `recall(...)` → `POST /api/v1/recall`
   - `improve(...)` → `POST /api/v1/improve`
   - `forget(...)` → `POST /api/v1/forget`
4. Handle 403/409/422 explicitly; never invent URLs or payload fields.

**Text ingestion note:** `POST /api/v1/remember` expects file uploads in `data`. For plain text, write content to an in-memory file (or temp file) and upload via multipart, or use `POST /api/v1/remember/entry` with a QA entry when storing conversational turns.

### Option B — Cognee Python SDK (`pip install cognee`)

```python
import cognee

await cognee.serve(url=COGNEE_SERVICE_URL, api_key=COGNEE_API_KEY)
await cognee.remember("...", dataset_name="chronicle")
results = await cognee.recall(query_text="...")
await cognee.improve(dataset="chronicle", session_ids=[...])
await cognee.forget(dataset="chronicle")
await cognee.disconnect()
```

**Trade-offs:** SDK is simpler for prototyping but couples Chronicle to Cognee's package version, async session management, and SDK-only parameters. REST keeps boundaries clean and matches the dashboard API reference directly.

**Recommendation:** Use httpx REST client in a dedicated integration module. Add SDK only if a documented capability is SDK-only and Chronicle needs it.

---

## Proposed Backend Architecture (not implemented)

Planned structure for milestone 3+. No code written yet.

```
backend/app/
  api/v1/
    memory.py          # Chronicle HTTP routes (future)
  services/
    memory_service.py  # Orchestrates remember/recall/improve/forget for Chronicle
  integrations/
    cognee/
      client.py        # httpx Cognee REST client
      schemas.py       # Cognee DTO mirrors
      errors.py        # CogneeHTTPError, CogneeValidationError, …
  core/
    config.py          # Add COGNEE_* settings
```

**Data flow:**

```
Frontend → Chronicle FastAPI (/api/v1/...) → MemoryService → CogneeClient → Cognee Cloud
```

**Design principles:**

1. **Single integration point** — only `integrations/cognee/` talks to Cognee; routes and services stay Cognee-agnostic where possible.
2. **Dataset per deployment** — one `COGNEE_DATASET_NAME` (e.g. `chronicle`); session IDs passed per user/conversation when needed.
3. **v1.0 operations only** — use remember/recall/improve/forget; avoid legacy add/cognify/search unless a gap is documented.
4. **No auth in Chronicle yet** — Cognee API key stays server-side; never expose to frontend.
5. **Errors propagate cleanly** — map Cognee 422/409 to Chronicle HTTP errors with safe messages.

**Chronicle route mapping (future):**

| Chronicle concept | Cognee operation | Endpoint |
|-------------------|------------------|----------|
| Store memory | remember | `POST /api/v1/remember` or `/remember/entry` |
| Query memory | recall | `POST /api/v1/recall` |
| Enrich / promote session | improve | `POST /api/v1/improve` |
| Delete memory | forget | `POST /api/v1/forget` |

---

## Open Questions for Approval

1. **Cloud vs local Cognee** — Will Chronicle target Cognee Cloud from day one, or a self-hosted instance?
2. **Text ingestion path** — File upload via `remember`, or typed `remember/entry` for conversational QA turns?
3. **Session strategy** — One Cognee `session_id` per Chronicle conversation?
4. **SDK vs REST** — Confirm httpx REST client approach above.

---

*Milestone 2 complete. No Chronicle features or Cognee integration code implemented.*

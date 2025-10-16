# Buzaglo Engine — Product Requirements Document (PRD)

Version: 0.9  
Owner: Idan  
Target: Web app (React + React Flow) with Gemini integration

## 1. Purpose
Create a reasoning engine + visual canvas. A "Buzaglo Tree" represents a single idea explored via natural-language actions: **Branch**, **Deep Dive**, **Flatten**. Build complex reasoning graphs; summarize instantly.

## 2. Scope
MVP includes: projects, tree canvas, node types, Branch/Deep Dive/Flatten actions, complexity control, Gemini integration, research tool integration boundary, export, usage metering. Optional but recommended: auth, persistence, billing.

Non-goals (MVP): multi-user real-time collaboration, mobile app, advanced team spaces, offline mode, full marketplace of tools.

## 3. Users & Jobs
- **Analyst/Researcher**: explore topics; produce summaries with sources.
- **Writer/Product/Founder**: generate outlines, options, and decisions.
- **Engineer**: plan solution alternatives; document reasoning trails.

Primary Jobs-To-Be-Done:
1) “Give me options for my question.”  
2) “Go deep at a chosen path, with adjustable complexity.”  
3) “Flatten the tree into a clean summary.”

## 4. Success Metrics (MVP)
- TTFX (time-to-first-branch) <= 5s median.  
- End-to-end deep dive (Manager) <= 2 min P95.  
- Flatten generation <= 2s P95 on 100 nodes.  
- Session save/restore < 500 ms.  
- >70% sessions use Flatten.

## 5. Core Concepts
- **Tree**: directed acyclic graph rooted at the user question.
- **Node**: unit of reasoning. Has `type`, `prompt`, `result`, `citations`, `cost`, `duration`, `status`.
- **Edge**: parent-child relation with `reason` label.
- **Actions**: Branch (fan-out), Deep Dive (expand path/subtree), Flatten (summarize DFS walk).
- **Complexity**: budget of **Complexity Units (CU)** controlling depth/width.

## 6. Node Types (MVP)
1) **LLM Node**: single Gemini call.  
   - Inputs: `system`, `prompt`, `model_id`, `temperature`, `tools[]` (none by default), `max_tokens`.
   - Output: `text`, `structured` (optional JSON), `citations[]` (if tools used), usage metrics.
2) **Research Node**: delegated research step.  
   - Strategy A (Gemini-only): prompt Gemini to plan/reason; no external web call.  
   - Strategy B (Pluggable tool boundary): tool adapter for external research provider (e.g., Perplexity API). Return snippets, links, short claims with source URLs.  
   - MVP implements Strategy A now; Strategy B behind a feature flag.

## 7. Complexity Model
Map user slider to CU and default branching:
- **Intern**: 3 CU -> ~2-3 nodes, depth<=2, width<=2, ETA ~20s.  
- **Manager**: 12 CU -> ~8-10 nodes, depth<=3, width<=3, ETA ~2m.  
- **CEO**: 36 CU -> ~25-30 nodes, depth<=4, width<=4, ETA ~5m.

CU accounting:
- Create LLM node: 1 CU.  
- Create Research node: 2 CU.  
- Branch fan-out k: costs k * 1 CU.  
- Deep Dive per level: width * depth CU until budget exhausted.

## 8. User Flows
### 8.1 New Tree
1) User enters root prompt.  
2) Click **Branch** or **Deep Dive**.  
3) Set optional hint/description; choose complexity level.  
4) System builds nodes/edges per CU budget and streams node results.  
5) User selects promising branch and repeats **Deep Dive**.  
6) Click **Flatten** to generate summary + sources.

### 8.2 Branch
- Modal: free-text "hint to specialize branches".  
- Default branches: 3 for Intern, 4-6 for Manager, 6-8 for CEO.  
- Output: child nodes titled as options with 1-paragraph pitch.

### 8.3 Deep Dive
- Modal: optional description; slider for complexity.  
- Engine expands selected node path or entire subtree per CU plan.  
- Shows progress, node-level streaming, and costs.

### 8.4 Flatten
- Runs DFS from root; concatenates concise node summaries; removes duplicates; adds citations; returns 1-2 pages of text.

### 8.5 Export
- Export summary (Markdown), whole tree (JSON), and image (PNG/SVG).  
- Copy citations with link list.

## 9. UX Requirements
- **Canvas**: React Flow DAG; horizontal default; toggle vertical; auto-layout via Dagre/ELK; minimap; zoom; fit-to-screen; edge bundling; pan.  
- **Node card**: title, badges (LLM/Research), status spinner, cost/time, expand to show text + citations; action buttons: Branch, Deep Dive, Convert to Prompt.  
- **Side panel**: contextual details of selected node; tokens/cost; prompt; model; retry/edit; duplicate; delete.  
- **Global header**: app title, prompt bar, send, mic (optional), complexity slider, Manual toggle (manual node add), model selector.  
- **Modals**: Branch options, Deep Dive options.  
- **Left column (optional)**: reference/notes panel for user text.  
- **Flatten viewer**: drawer with generated summary + export controls.  
- **Keyboard**: Enter=act; Cmd/Ctrl+B branch; Cmd/Ctrl+D deep dive; Cmd/Ctrl+F flatten.

Accessibility: role/aria for controls, focus states, screen-reader descriptions for edges, font size controls, high-contrast theme.

## 10. Prompts & Orchestration
### 10.1 System prompts
- **Branch system prompt (Gemini)**: ask for N distinct, decision-oriented alternatives with 1-paragraph rationale and short title; strict JSON schema.  
- **Deep Dive system prompt**: plan-first; produce sub-steps up to CU; generate node outputs per step; return structured JSON with children.  
- **Flatten system prompt**: summarize a DAG via ordered list; deduplicate; attribute to node ids; produce Markdown.

### 10.2 Function calling schemas (client->server)
- `branch(node_id, hint, k, complexity_level)` -> `{children:[{title, summary, type, reasoning, hints}]}`
- `deep_dive(node_id, description, cu_budget)` -> `{expanded_nodes:[...], edges:[...]}`
- `flatten(tree_id, style)` -> `{markdown, outline, citations[]}`

### 10.3 Safety & constraints
- All prompts must request verifiable claims and ask model to mark uncertainty.  
- Enforce max tokens per call and cost caps per run.  
- Disallow revealing chain-of-thought; request concise final rationales.

## 11. Architecture
### 11.1 Frontend (React)
- React 18 + TypeScript.  
- React Flow for canvas; state via Zustand/Redux Toolkit Query for server sync.  
- Component groups: Canvas, NodeCard, SidePanel, Modals, FlattenDrawer, HeaderBar, ModelPicker.  
- Streaming via server-sent events (SSE) or WebSocket for node updates.

### 11.2 Backend
- Node.js (Fastify) or Python (FastAPI).  
- Routes (REST + SSE):
  - `POST /trees`, `GET /trees/:id`, `DELETE /trees/:id`
  - `POST /nodes`, `PATCH /nodes/:id`, `DELETE /nodes/:id`
  - `POST /actions/branch`, `POST /actions/deep-dive`, `POST /actions/flatten`
  - `GET /runs/:id/stream` (SSE)
  - `POST /export/:id`
  - `POST /usage/events`
- Services: GeminiClient, Planner, GraphBuilder, Summarizer, UsageMeter, Exporter.

### 11.3 Data Model (SQL)
- `users(id, email, name)`  
- `projects(id, user_id, name)`  
- `trees(id, project_id, title, root_node_id, created_at)`  
- `nodes(id, tree_id, parent_id, type, prompt, model_id, params_json, result_text, citations_json, cost_cents, duration_ms, status, created_at)`  
- `edges(id, tree_id, source_id, target_id, label)`  
- `runs(id, tree_id, action, cu_budget, cost_cents, started_at, finished_at, status)`  
- `wallets(id, user_id, balance_cents)`  
- `providers(id, name, config_json)`  
- `usage_events(id, run_id, provider_id, tokens_in, tokens_out, cost_cents, meta_json)`

### 11.4 Persistence
- Postgres.  
- Blob store for exports (S3-compatible).  
- Caching: Redis for node memoization (keyed by `type+prompt+model+params` hash).

### 11.5 Gemini Integration
- Models: Gemini 2.5 family (text, multimodal).  
- API: either Google AI Studio or Vertex AI; configure via env.  
- Streaming support; tool-calling disabled by default; JSON schema mode for branch/deep-dive planning.  
- Retry/backoff on rate limits.  
- Safety filters: configurable threshold; return redactions as warnings on nodes.

## 12. Algorithms
### 12.1 Branch (planner)
```
input: node, hint, k, cu_level
k default from complexity level; clamp 2..8
prompt Gemini with instruction to produce k distinct options with titles and 1-paragraph rationales in JSON
for each option -> create child LLM nodes with `summary` as initial text
consume CU = k
```

### 12.2 Deep Dive (graph builder)
```
input: node, description, cu_budget
while cu_remaining > 0:
  ask Gemini planner to propose next step list (width/depth) within remaining CU
  materialize steps as nodes:
    - LLM node (1 CU)
    - Research node (2 CU)
  connect edges in planned order
  stream node generations concurrently up to concurrency=3
return expanded subtree
```

### 12.3 Flatten (DFS summarizer)
```
input: tree_id
order nodes by DFS from root (stable by edge index)
for each node: extract 1-2 sentence key insight
deduplicate by MinHash or embedding cosine similarity (>0.9)
compose Markdown sections by branch
append citation list gathered from nodes
return summary markdown
```

## 13. Security, Privacy, Compliance
- Auth: email+magic link or Google OAuth (optional for MVP).  
- Data at rest: AES-256 (Postgres + object store).  
- In transit: TLS.  
- Secrets in server only; never to client.  
- PII minimization: prompts stored with user consent; redaction toggle.  
- Per-provider terms respected.

## 14. Billing & Pricing Model
- **Single wallet**: user prepays or adds card (Stripe).  
- The server meters provider usage from `usage_events` and deducts from wallet.  
- Per-run cost caps; stop when exceeded.  
- Cost preview per action from CU->expected calls mapping.

## 15. Telemetry & Observability
- Frontend: user actions, timing, failures.  
- Backend: per-call latency, token/cost, error codes.  
- Tracing: OpenTelemetry spans per node generation.  
- Admin dashboard: runs by user, avg cost, CU distribution, node cache hit rate.

## 16. Acceptance Criteria (MVP)
1) Create project and tree; persist in Postgres.  
2) Enter root prompt; **Branch** creates at least 3 children with unique titles and texts.  
3) **Deep Dive** with Manager level generates >=8 nodes within 2 minutes P95.  
4) **Flatten** returns Markdown in <=2s P95 for 100-node tree.  
5) Export JSON and Markdown; PNG/SVG image from canvas.  
6) Usage metering stored per node and per run.  
7) Error states shown on nodes; retry works.

## 17. Error Handling
- Rate-limit and provider errors: exponential backoff; message on node; retry.  
- Content safety block: node marked "redacted" with explanation.  
- Network drop: resume run via `runs.status=recoverable`.

## 18. API Spec (condensed)
```
POST /trees {title, prompt}
GET /trees/:id
POST /actions/branch {node_id, hint?, k?, complexity}
POST /actions/deep-dive {node_id, description?, complexity}
POST /actions/flatten {tree_id, style?}
GET /runs/:id/stream (SSE)
POST /export/:id {format: md|png|svg|json}
POST /usage/events {run_id, provider, tokens_in, tokens_out, cost_cents, meta}
```
Response objects include: `nodes[], edges[], run_id, cost_estimate` where relevant.

## 19. React Components
- `AppShell`  
- `HeaderBar` (PromptInput, SendButton, ComplexitySlider, ModelPicker)  
- `Canvas` (React Flow: `NodeCard`, custom edges, minimap, controls)  
- `SidePanel` (NodeDetail, Params, Metrics)  
- `BranchModal`  
- `DeepDiveModal`  
- `FlattenDrawer`  
- `ExportDialog`

State shape (Zustand/Redux):
```
{ project, tree, nodesById, edgesById, selection, ui: {layout, zoom}, runs }
```

## 20. Visual Specs
- Layout: horizontal DAG default; "Fit to Screen" control; zoom +/-; mini-map.  
- Buttons: **Branch**, **Deep Dive** on node and toolbar.  
- Modals per screenshots with input field and slider.  
- Node status: idle/running/success/error with subtle glow.  
- Badges: LLM, Research.  
- Palette: neutral background, subtle purple accent for primary actions.

## 21. Performance Targets
- Canvas renders 300 nodes at 60 FPS on mid-range laptop.  
- Node text virtualization for long content.  
- Streaming chunks stitch client-side with incremental rendering.  
- Memoized layouts; re-layout only on topology change.

## 22. Test Plan
- Unit: planner CU accounting; flatten dedup; reducers.  
- Integration: branch->deep-dive pipeline, streaming, retries.  
- E2E: new tree to export; cost caps; cache hits.  
- Accessibility: keyboard nav, aria labels.  
- Load: 100 concurrent runs; rate-limit behavior.

## 23. Risks
- Provider rate limits or safety false positives.  
- Graph sprawl causing unreadable canvases.  
- Research tool ToS constraints.  
- Cost overrun without strict caps.

Mitigations: caching, CU caps, progressive disclosure, batching.

## 24. Roadmap (post-MVP)
1) More tools: writing assistant, code interpreter, slides/podcasts generators.  
2) Auto mode: agent executes Branch/Deep Dive cycles to a goal.  
3) Second brain store: clustered graph of all knowledge with semantic search.  
4) Persistent pathways: reusable templates, context packs.  
5) Collaboration: multi-user cursors, comments, share links.

## 25. Sample Prompts (Gemini)
- **Branch**: "Propose ${k} distinct directions to address: '${prompt}'. Return JSON {options:[{title, rationale, outline?}]}. No preamble."  
- **Deep Dive**: "Given the goal: '${prompt}' and CU=${n}, plan a subtree with steps. For each step produce a short result. Output JSON {steps:[{title,type:'llm'|'research',summary}]}"  
- **Flatten**: "Summarize the DAG nodes (provided as list of {id,title,summary}). Remove duplicates. Output clean Markdown with sections and bullet insights; include source list."

## 26. Data Export Formats
- **Tree JSON**: `{nodes:[{id,type,title,summary,...}],edges:[{source,target,label}]}`  
- **Summary Markdown**: title, outline, sections, citations.  
- **PNG/SVG**: canvas snapshot via React Flow exporter.

## 27. Deployment
- Backend: containerized; Railway/Docker.  
- Frontend: static hosting (Vercel/Railway).  
- Env: `GEMINI_API_KEY`, DB creds, REDIS_URL, SIGNING_SECRET.  
- CI: lint, test, build; preview deployments.

## 28. Privacy Notice (MVP)
- Prompts and outputs are stored to power tree restore and exports. Toggle to disable storage per project. Provider data handling disclosed.

---
This PRD describes an MVP aligned with the provided screenshots and behaviors: Branch/Deep Dive controls with modals and a DFS-based Flatten that returns near-instant summaries. Gemini powers planning and generation; complexity is enforced via CU budgeting with predictable node counts and timings.

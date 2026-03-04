# Technical Execution Plan: Local AI Integration

Based on PRD: `docs/prd-local-ai-integration.md`

> **Note on AI Model Strategy:** Recommended personas for each phase:
> * **Opus 4.5 (Anthropic):** Best for architectural decisions, complex multi-file wiring (IPC ↔ services ↔ preload), and the contextBuilder/knowledgeBase logic where deep reasoning about token budgets and prompt assembly matters. Use for Phases 1-3.
> * **Sonnet 4.5 (Anthropic):** Fast iteration workhorse for React component implementation, hook logic, and styling. Best for Phase 4 (UI components) where the patterns are well-defined and speed matters.
> * **GPT-5.2-Codex (OpenAI):** Thorough edge-case handling — ideal for Phase 6 (panic key, OPSEC verification, graceful degradation testing) where completeness and defensive coding matter most.

## Implementation Layers

| Layer | Role | Key Files |
|:------|:-----|:----------|
| **Electron Main** (primary) | AI service layer: Ollama HTTP client, RAG context builder, knowledge base loader, model manager, IPC handlers | `electron/services/*.ts`, `electron/ipc/aiHandlers.ts` |
| **React Renderer** (secondary) | Chat UI: panel, messages, input, status, streaming display | `src/components/AIAssistant/*.tsx`, `src/hooks/useAIChat.ts` |
| **Shared Types** (foundation) | TypeScript interfaces shared across main + renderer | `src/types/ai.ts` |
| **Data Assets** (static) | CSOG knowledge files, Modelfile, opsecMapping reference | `data/knowledge/*.md`, `data/csog-operator.Modelfile` |

## Duplicate Prevention

No existing AI/chat components found in codebase — the app has no source code yet (only `node_modules` in `app/`). All files are net-new.

## Git Branch Proposal

Suggest creating branch: `feature/local-ai-integration` from `main`.

---

## Primary Files Affected

### Electron Main Process (New)
* `electron/services/ollamaClient.ts`
* `electron/services/contextBuilder.ts`
* `electron/services/modelManager.ts`
* `electron/ipc/aiHandlers.ts`

### React Renderer (New)
* `src/types/ai.ts`
* `src/hooks/useAIChat.ts`
* `src/components/AIAssistant/AIAssistant.tsx`
* `src/components/AIAssistant/ChatMessage.tsx`
* `src/components/AIAssistant/ChatInput.tsx`
* `src/components/AIAssistant/StatusIndicator.tsx`
* `src/components/AIAssistant/ContextBadge.tsx`

### Data Assets (New)
* `data/knowledge/preface.md`
* `data/knowledge/ch01-logistics.md`
* `data/knowledge/ch02-p2p.md`
* `data/knowledge/ch03-methylamine.md`
* `data/knowledge/ch04-reaction.md`
* `data/knowledge/ch05-workup.md`
* `data/knowledge/strategy.md`
* `data/knowledge/module-setup.md`
* `data/knowledge/module-p2p.md`
* `data/csog-operator.Modelfile`

### Existing Files (Modified)
* `electron/main.ts` — register AI IPC handlers
* `electron/preload.ts` — add `window.ai` bridge
* `src/App.tsx` — mount AIAssistant panel
* `src/vite-env.d.ts` — add `Window.ai` type declaration
* `package.json` — add react-markdown, remark-gfm

> **Note on Parallel Execution:** Tasks with `[DEPENDS ON: ...]` must wait for prerequisites. Independent tasks (e.g., 1.0 + 2.0 + 8.0) can run in parallel.

---

## Detailed Execution Plan

---

## Phase 1: Foundation — Shared Types & Data Assets (1.0–2.0)

---

- [x] **1.0 Create shared TypeScript type definitions** `[COMPLEXITY: Simple]`
> **WHY:** Every other task depends on these interfaces — they define the contract between main process, preload bridge, and renderer.
> **Recommended Model:** `Opus 4.5`
> **Rules to apply:** `[3-code-quality-checklist]`, `[synthmaster-response-protocols]`

  - [x] 1.1 **Create `src/types/ai.ts`:** Define all shared interfaces from PRD §3.1.2:
    - `ChatMessage` (role: system/user/assistant, content: string)
    - `CalculatorContext` (activeChapter, targetYieldGrams, selectedMethod matching `processes.name` in DB, calculatedReagents)
    - `ReagentEntry` (opsecAlias, massGrams, moles, equivalents)
    - `AIStatus` (ollamaConnected, modelLoaded, modelSize, availableModels, serverVersion)
    - `AIChunkEvent` (token, done)
    - `AIErrorEvent` (error, code union type)
    - `OpsecMappingFile` (version, description, mappings: OpsecEntry[])
    - `OpsecEntry` (internal_id, alias, chemical, mw, used_in)
    - `UseAIChatReturn` (messages, isStreaming, aiStatus, sendMessage, abortGeneration, clearChat)
    - `AIAssistantProps`, `ChatMessageProps`, `ChatInputProps`
    [APPLIES RULES: `3-code-quality-checklist`, `synthmaster-response-protocols`]

  - [x] 1.2 **Export all types** as named exports. Ensure both main process and renderer can import from this file (path alias or relative import).
    [APPLIES RULES: `3-code-quality-checklist`]

---

- [x] **2.0 Bundle CSOG Knowledge Base + Modelfile** `[COMPLEXITY: Simple]`
> **WHY:** The AI's core intelligence comes from 9 bundled manual chapters (~6K tokens). Without these, the AI is a generic chatbot, not a CSOG Operator. The Modelfile provides a custom model option with baked-in CSOG identity.
> **Recommended Model:** `Opus 4.5`
> **Rules to apply:** `[5-documentation-context-integrity]`, `[chemistry-protocols]`, `[synthmaster-safety-protocols]`

  - [x] 2.1 **Create `data/knowledge/` directory** with 9 knowledge files. Copy and clean content from repo root CSOG manuals:

    | Source File | Target | Content |
    |:------------|:-------|:--------|
    | `CSOG-MANUAL-PREFACE.md` | `data/knowledge/preface.md` | 3-source validation, Operator vs Cook philosophy |
    | `CSOG-MANUAL-CHAP01-LOGISTICS.md` | `data/knowledge/ch01-logistics.md` | Procurement, NPB construction, PPE, waste disposal |
    | `CSOG-MANUAL-CHAP02-P2P.md` | `data/knowledge/ch02-p2p.md` | Dry distillation procedure, visual cues, purification |
    | `CSOG-MANUAL-CHAP03-METHYLAMINE.md` | `data/knowledge/ch03-methylamine.md` | Hexamine hydrolysis, crystallization, verification |
    | `CSOG-MANUAL-CHAP04-REACTION.md` | `data/knowledge/ch04-reaction.md` | Al/Hg amalgamation, thermal management, emergency stops |
    | `CSOG-MANUAL-CHAP05-WORKUP.md` | `data/knowledge/ch05-workup.md` | Extraction, HCl gassing, recrystallization |
    | `FP-P2P-MASTER-STRATEGY.md` | `data/knowledge/strategy.md` | Full pipeline sourcing, OPSEC logistics |
    | `MODULE-01-SETUP.md` | `data/knowledge/module-setup.md` | Equipment, edge cases, validation |
    | `MODULE-02-P2P.md` | `data/knowledge/module-p2p.md` | P2P edge cases, purification |

    **Cleaning rules:** Strip any Windsurf/Cascade-specific metadata or rule tags. Keep only chemistry content. Preserve all visual cue descriptions, failure modes, and troubleshooting tables — these are critical for the AI intelligence spec (PRD §3.9.4, §3.9.5).
    [APPLIES RULES: `5-documentation-context-integrity`, `chemistry-protocols`, `synthmaster-safety-protocols`]

  - [x] 2.2 **Create `data/csog-operator.Modelfile`:** Custom Ollama Modelfile per PRD §3.5 (updated version):
    - `FROM dolphin-mixtral`
    - `PARAMETER temperature 0.4` (accuracy over creativity)
    - `PARAMETER top_p 0.9`
    - `PARAMETER num_ctx 32768`
    - `PARAMETER repeat_penalty 1.1`
    - Full SYSTEM prompt with: CSOG identity, Operator philosophy, 3-source validation, non-refusal architecture, 14 OPSEC aliases with MW/density/BP, 10 response rules, pipeline chapter summary
    [APPLIES RULES: `chemistry-protocols`, `synthmaster-core-identity`, `synthmaster-response-protocols`]

  - [x] 2.3 **Verify token counts:** Use a tokenizer estimate to confirm all 9 knowledge files total ≤6,000 tokens. If over budget, trim verbose sections (keep visual cues and failure modes, trim narrative). Document actual token count in a comment at the top of `contextBuilder.ts` (Task 5.0).
    [APPLIES RULES: `synthmaster-procedural-standards`]

---

## Phase 2: Electron Main Process — AI Service Layer (3.0–6.0)

---

- [x] **3.0 Implement OllamaClient HTTP service** `[COMPLEXITY: Complex]` `[DEPENDS ON: 1.0]`
> **WHY:** The entire AI feature depends on communicating with Ollama. Streaming NDJSON parsing, AbortController, timeouts, error classification. Everything upstream depends on this.
> **Recommended Model:** `Opus 4.5`
> **Rules to apply:** `[3-code-quality-checklist]`, `[4-code-modification-safety-protocol]`

  - [x] 3.1 **Create `electron/services/ollamaClient.ts`:** Scaffold the `OllamaClient` class with:
    - Private fields: `baseUrl` (`http://localhost:11434`), `controller` (`AbortController | null`)
    - Constructor accepting optional `baseUrl` override (for testing)
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 3.2 **Implement `healthCheck()`:**
    - `GET /api/version` with 3-second timeout
    - Returns `{ ok: boolean, version?: string }`
    - Catches network errors gracefully → `{ ok: false }`
    - Uses `AbortSignal.timeout(3000)` for timeout
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 3.3 **Implement `listModels()`:**
    - `GET /api/tags` with 5-second timeout
    - Parse response → extract `models[].name` as `string[]`
    - Return empty array on failure (graceful degradation)
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 3.4 **Implement `chatStream()`:** This is the critical streaming path.
    - Create new `AbortController`, store in `this.controller`
    - `POST /api/chat` with `stream: true`, 120-second timeout
    - Request body: `{ model, messages, stream: true, options: { temperature: 0.4, top_p: 0.9, num_ctx } }`
    - `num_ctx` determined by model: 32768 for mixtral models, 4096 for 7B models
    - Parse response body as streaming NDJSON: read chunks from `ReadableStream`, split by newline, `JSON.parse` each line
    - For each parsed chunk: extract `message.content` → call `onChunk(token, done)`
    - On `done: true` → resolve the promise
    - Handle errors: network failure, JSON parse error, abort signal → throw typed error
    [APPLIES RULES: `3-code-quality-checklist`, `4-code-modification-safety-protocol`]

  - [x] 3.5 **Implement `abort()`:**
    - Call `this.controller?.abort()`
    - Set `this.controller = null`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 3.6 **Implement error classifier helper:**
    - `classifyError(err: unknown): AIErrorEvent['code']`
    - Map: fetch failed → `OLLAMA_UNREACHABLE`, 404 → `MODEL_NOT_FOUND`, AbortError → `ABORTED`, else → `INFERENCE_ERROR` or `UNKNOWN`
    - Export for use in `aiHandlers.ts`
    [APPLIES RULES: `3-code-quality-checklist`]

---

- [x] **4.0 Implement ModelManager service** `[COMPLEXITY: Simple]` `[DEPENDS ON: 3.0]`
> **WHY:** Drives status indicator and model selection. Handles 4-tier fallback: csog-operator → dolphin-mixtral → nous-hermes2-mixtral → dolphin-mistral.
> **Recommended Model:** `Opus 4.5`
> **Rules to apply:** `[3-code-quality-checklist]`

  - [x] 4.1 **Create `electron/services/modelManager.ts`:** Scaffold `ModelManager` class with:
    - Private fields: `ollamaClient`, `preferredModels` array, `healthInterval`, `cachedStatus: AIStatus`
    - Preferred model order: `['csog-operator', 'dolphin-mixtral', 'nous-hermes2-mixtral', 'dolphin-mistral']`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 4.2 **Implement `initialize()`:**
    - Call `ollamaClient.healthCheck()` → set `ollamaConnected`
    - If connected, call `ollamaClient.listModels()` → populate `availableModels`
    - Call `selectBestModel()` → set `modelLoaded`
    - Detect model size from Ollama tags response (if available)
    - Return `AIStatus` object
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 4.3 **Implement `selectBestModel()`:**
    - Iterate `preferredModels` array
    - Return first model found in `availableModels` list
    - Return `null` if none found
    - Include context window detection: mixtral models → 32768, 7B models → 8192
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 4.4 **Implement `startHealthPolling()` / `stopHealthPolling()`:**
    - `setInterval` at 30,000ms calling `initialize()`
    - On status change (connected ↔ disconnected, model changed) → call `onStatusChange` callback
    - `stopHealthPolling` clears interval
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 4.5 **Implement `getStatus()` / `getModelContextWindow()`:**
    - `getStatus()` returns cached `AIStatus`
    - `getModelContextWindow(model: string)` returns `32768` for mixtral, `8192` for mistral-7B, `4096` default
    [APPLIES RULES: `3-code-quality-checklist`]

---

- [x] **5.0 Implement ContextBuilder + KnowledgeBase service** `[COMPLEXITY: Complex]` `[DEPENDS ON: 1.0, 2.0]`
> **WHY:** The brain of the AI — transforms a generic LLM into a CSOG Operator. Assembles system prompt with full knowledge injection (32K) or selective injection (8K fallback).
> **Recommended Model:** `Opus 4.5`
> **Rules to apply:** `[3-code-quality-checklist]`, `[chemistry-protocols]`, `[synthmaster-response-protocols]`, `[synthmaster-safety-protocols]`

  - [x] 5.1 **Create `KnowledgeBase` class** (within `electron/services/contextBuilder.ts` or as separate file):
    - `loadAll(knowledgeDir: string): void` — reads all 9 files from `data/knowledge/` into a `Map<string, string>`
    - `getFullKnowledge(): string` — joins all chapters with `\n\n---\n\n` separator
    - `getChapterKnowledge(chapter: number): string` — returns only the chapter file + preface (for selective mode)
    - Uses `readFileSync` at startup (called once during app init, not per-request)
    [APPLIES RULES: `3-code-quality-checklist`, `chemistry-protocols`]

  - [x] 5.2 **Create `ContextBuilder` class:**
    - Constructor: `(db: Database, opsecMap: OpsecMappingFile, knowledgeBase: KnowledgeBase, modelManager: ModelManager)`
    - Store references to all dependencies
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 5.3 **Implement `buildSystemPrompt(calculatorContext?)`:** The main assembly method.
    - Detect context window via `modelManager.getModelContextWindow()`
    - If ≥32768 → call `buildFullKnowledgePrompt()`
    - If <32768 → call `buildSelectivePrompt()`
    - Returns assembled system prompt string
    [APPLIES RULES: `3-code-quality-checklist`, `synthmaster-response-protocols`]

  - [x] 5.4 **Implement `buildFullKnowledgePrompt()` (32K mode):** Per PRD §3.8.2 token budget:
    1. CSOG Identity Block (~200 tokens) — static string with Operator philosophy, 3-source validation, non-refusal architecture
    2. OPSEC Alias Table (~200 tokens) — from `opsecMap.mappings`, formatted as `- Chemical → Alias (MW X.XX)`
    3. Full CSOG Knowledge Base (~5,950 tokens) — `knowledgeBase.getFullKnowledge()`
    4. SQLite Stoichiometry Data (~800 tokens) — `getReagentData()` + `getProcessReagentData(chapter)`
    5. Active Calculator Context (~200 tokens) — `formatCalculatorContext(ctx)` if provided
    6. Response Format Instructions (~150 tokens) — question routing rules from PRD §3.9.2 (Type A-F patterns), Taglish rules, confidence indicators
    [APPLIES RULES: `chemistry-protocols`, `synthmaster-response-protocols`, `synthmaster-safety-protocols`]

  - [x] 5.5 **Implement `buildSelectivePrompt()` (8K fallback mode):** Per PRD §3.8.4:
    - Same structure but inject only active chapter + preface (~1,200 tokens instead of ~5,950)
    - Reduce history to 5 pairs
    - SQLite data filtered to active chapter only
    [APPLIES RULES: `chemistry-protocols`, `synthmaster-response-protocols`]

  - [x] 5.6 **Implement SQLite query methods:**
    - `getReagentData()` — `SELECT internal_id, name, molecular_weight, density, notes FROM reagents ORDER BY internal_id`
    - `getProcessData(chapter)` — `SELECT name, chapter, description, temp_min, temp_max, yield_min, yield_max, yield_default FROM processes WHERE chapter = ?`
    - `getProcessReagentData(chapter)` — JOIN query through `process_reagents` (PRD §3.2.2)
    - `getProcedureSteps(processName)` — `SELECT step_number, instruction, visual_cue, failure_mode, failure_fix, temp_target, temp_danger, duration_min, duration_max, severity FROM procedures WHERE process_id = (SELECT id FROM processes WHERE name = ?)`
    - All queries return typed arrays; empty array on missing tables (graceful degradation per PRD §3.10)
    [APPLIES RULES: `3-code-quality-checklist`, `synthmaster-procedural-standards`]

  - [x] 5.7 **Implement `formatOpsecTable()`:**
    - Iterate `opsecMap.mappings`
    - Format each entry as: `- {chemical} → {alias} (MW {mw})`
    - Prepend: `MANDATORY: Use ONLY these OPSEC aliases in ALL responses. Never use real chemical names.`
    [APPLIES RULES: `synthmaster-response-protocols`]

  - [x] 5.8 **Implement `formatCalculatorContext(ctx)`:**
    - Format active chapter, target yield, selected method
    - Format calculated reagents table: alias, mass, moles, equivalents
    - Prepend: `CURRENT SESSION — scale ALL quantities to match these values:`
    - Return empty string if `ctx` is undefined or null
    [APPLIES RULES: `chemistry-protocols`]

  - [x] 5.9 **Implement response format instructions block:**
    - Embed question routing rules from PRD §3.9.2 (Type A-F)
    - Include Taglish communication rules from PRD §3.9.6
    - Include 3-source confidence indicator rules from PRD §3.9.7
    - Include pipeline awareness instruction from PRD §3.9.8
    - Static string, assembled once at class construction
    [APPLIES RULES: `synthmaster-response-protocols`, `chemistry-protocols`]

---

- [x] **6.0 Implement IPC AI Handlers + wire into main.ts** `[COMPLEXITY: Complex]` `[DEPENDS ON: 3.0, 4.0, 5.0]`
> **WHY:** The bridge between renderer and all AI services. Streaming chunks flow Ollama → main → renderer. Abort/clear/status requests route here.
> **Recommended Model:** `Opus 4.5`
> **Rules to apply:** `[3-code-quality-checklist]`, `[4-code-modification-safety-protocol]`

  - [x] 6.1 **Create `electron/ipc/aiHandlers.ts`:** Scaffold `registerAIHandlers()` function:
    - Parameters: `(mainWindow: BrowserWindow, db: Database, opsecMap: OpsecMappingFile)`
    - Instantiate `OllamaClient`, `KnowledgeBase`, `ContextBuilder`, `ModelManager`
    - Call `knowledgeBase.loadAll()` with path to `data/knowledge/`
    - Call `modelManager.initialize()`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 6.2 **Implement `ai:chat` handler:**
    - Extract `messages` and `calculatorContext` from payload
    - Input validation: verify `messages` is array of `{ role, content }` objects
    - Trim history: keep last 20 pairs (32K mode) or 5 pairs (8K mode) per PRD §4.2
    - Call `modelManager.selectBestModel()` → return error if null
    - Call `contextBuilder.buildSystemPrompt(calculatorContext)`
    - Prepend system prompt to messages array
    - Call `ollamaClient.chatStream()` with `onChunk` callback that sends `mainWindow.webContents.send('ai:chunk', { token, done })`
    - On error: send `ai:error` event with classified error code
    - Return `{ success: true/false, error? }`
    [APPLIES RULES: `3-code-quality-checklist`, `4-code-modification-safety-protocol`]

  - [x] 6.3 **Implement `ai:abort` handler:**
    - Call `ollamaClient.abort()`
    - Return `{ aborted: true }`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 6.4 **Implement `ai:status` handler:**
    - Return `modelManager.getStatus()`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 6.5 **Implement `ai:clear` handler:**
    - Call `ollamaClient.abort()` (kill any in-flight request)
    - No disk cleanup needed — everything is in-memory
    [APPLIES RULES: `3-code-quality-checklist`]

  - [x] 6.6 **Modify `electron/main.ts`:** Add AI handler registration:
    - Import `registerAIHandlers` from `electron/ipc/aiHandlers`
    - After `mainWindow` creation and DB initialization, call `registerAIHandlers(mainWindow, db, opsecMap)`
    - Load `opsecMapping.json` (existing file) and pass to handler
    - Start model manager health polling when window is ready
    - Stop polling on window close
    [APPLIES RULES: `4-code-modification-safety-protocol`]

---

## Phase 3: IPC Bridge — Preload Extension (7.0)

---

- [x] **7.0 Extend preload.ts with window.ai bridge** `[COMPLEXITY: Simple]` `[DEPENDS ON: 1.0, 6.0]`
> **WHY:** The renderer cannot call IPC directly (contextIsolation:true). This exposes the `window.ai` namespace — the ONLY way React components talk to the AI backend. Dedicated namespace because streaming requires listener cleanup (unsubscribe functions) not supported by the generic `electronAPI` bridge.
> **Recommended Model:** `Opus 4.5`
> **Rules to apply:** `[3-code-quality-checklist]`, `[4-code-modification-safety-protocol]`

  - [x] 7.1 **Modify `electron/preload.ts`:** Add `window.ai` namespace via `contextBridge.exposeInMainWorld('ai', { ... })`:
    - `chat(messages, calculatorContext?)` → `ipcRenderer.invoke('ai:chat', { messages, calculatorContext })`
    - `abort()` → `ipcRenderer.invoke('ai:abort')`
    - `getStatus()` → `ipcRenderer.invoke('ai:status')`
    - `clearHistory()` → `ipcRenderer.invoke('ai:clear')`
    - `onChunk(callback)` → subscribe to `ipcRenderer.on('ai:chunk', ...)`, return unsubscribe function
    - `onError(callback)` → subscribe to `ipcRenderer.on('ai:error', ...)`, return unsubscribe function
    - Both `onChunk` and `onError` return cleanup functions `() => ipcRenderer.removeListener(...)`
    [APPLIES RULES: `3-code-quality-checklist`, `4-code-modification-safety-protocol`]

  - [x] 7.2 **Modify `src/vite-env.d.ts`:** Add `Window.ai` type declaration:
    - Augment global `Window` interface with all 6 methods matching the preload bridge
    - Import types from `src/types/ai.ts` or inline them
    [APPLIES RULES: `3-code-quality-checklist`]

---

## Phase 4: React Renderer — Chat UI Components (8.0–13.0)

---

- [ ] **8.0 Install dependencies** `[COMPLEXITY: Simple]`
> **WHY:** ChatMessage needs Markdown rendering. Must be installed before component work.
> **Recommended Model:** `Sonnet 4.5`

  - [ ] 8.1 **Run `npm install react-markdown@^9.0.0 remark-gfm@^4.0.0`** in the app directory.
    - Verify `package.json` updated with correct versions
    - Verify no peer dependency conflicts with existing React version
    [APPLIES RULES: `3-code-quality-checklist`]

---

- [ ] **9.0 Implement useAIChat custom hook** `[COMPLEXITY: Complex]` `[DEPENDS ON: 7.0, 8.0]`
> **WHY:** Central state management for all AI chat logic. Every component consumes this hook instead of managing IPC directly. Handles streaming token accumulation, error display, and listener lifecycle.
> **Recommended Model:** `Sonnet 4.5`
> **Rules to apply:** `[3-code-quality-checklist]`, `[common-rule-ui-interaction-a11y-perf]`

  - [ ] 9.1 **Create `src/hooks/useAIChat.ts`:** Scaffold hook returning `UseAIChatReturn`:
    - State: `messages: ChatMessage[]`, `isStreaming: boolean`, `currentStreamContent: string`, `aiStatus: AIStatus`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [ ] 9.2 **Implement status polling on mount:**
    - `useEffect` → call `window.ai.getStatus()` on mount
    - Set up 30-second polling interval for status updates
    - Cleanup: clear interval on unmount
    [APPLIES RULES: `3-code-quality-checklist`]

  - [ ] 9.3 **Implement `sendMessage(content, context?)`:**
    - Append `{ role: 'user', content }` to messages array
    - Set `isStreaming = true`, `currentStreamContent = ''`
    - Call `window.ai.chat(messages, context)`
    - On error from invoke → append error message to chat, set `isStreaming = false`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [ ] 9.4 **Implement streaming chunk subscription:**
    - `useEffect` → subscribe to `window.ai.onChunk(callback)`
    - On each chunk: append `token` to `currentStreamContent`
    - On `done: true`: append full accumulated content as `{ role: 'assistant', content: currentStreamContent }` to messages, set `isStreaming = false`
    - Cleanup: call unsubscribe function on unmount
    [APPLIES RULES: `3-code-quality-checklist`]

  - [ ] 9.5 **Implement error subscription:**
    - `useEffect` → subscribe to `window.ai.onError(callback)`
    - On error: append `{ role: 'assistant', content: 'Error: ...' }` to messages, set `isStreaming = false`
    - Cleanup: call unsubscribe function on unmount
    [APPLIES RULES: `3-code-quality-checklist`]

  - [ ] 9.6 **Implement `abortGeneration()`:**
    - Call `window.ai.abort()`
    - If `currentStreamContent` has content → append as partial assistant message
    - Set `isStreaming = false`
    [APPLIES RULES: `3-code-quality-checklist`]

  - [ ] 9.7 **Implement `clearChat()`:**
    - Call `window.ai.abort()` (safety: kill any in-flight)
    - Call `window.ai.clearHistory()`
    - Set `messages = []`, `isStreaming = false`, `currentStreamContent = ''`
    [APPLIES RULES: `3-code-quality-checklist`]

---

- [ ] **10.0 Implement StatusIndicator component** `[COMPLEXITY: Simple]` `[DEPENDS ON: 9.0]`
> **WHY:** Visual confirmation of Ollama status. Green/yellow/red drives Operator confidence.
> **Recommended Model:** `Sonnet 4.5`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`

  - [ ] 10.1 **Create `src/components/AIAssistant/StatusIndicator.tsx`:**
    - Props: `status: AIStatus`
    - Render colored dot (●/◌) + label based on status:
      - Green: `ollamaConnected && modelLoaded` → `"{modelLoaded} ready"`
      - Yellow: `ollamaConnected && !modelLoaded` → `"Ollama connected, no model"`
      - Red: `!ollamaConnected` → `"Ollama offline"`
      - Grey (pulsing): initial/checking state → `"Checking..."`
    - Accessible: include `aria-label` with full status text
    [APPLIES RULES: `common-rule-ui-foundation-design-system`, `common-rule-ui-interaction-a11y-perf`]

---

- [ ] **11.0 Implement ContextBadge component** `[COMPLEXITY: Simple]` `[DEPENDS ON: 9.0]`
> **WHY:** Shows what context the AI sees — builds trust that quantities are scaled to the Operator's batch.
> **Recommended Model:** `Sonnet 4.5`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`

  - [ ] 11.1 **Create `src/components/AIAssistant/ContextBadge.tsx`:**
    - Props: `context: CalculatorContext | undefined`
    - Display pill/badge:
      - With context: `"Ch.{N} | Target: {X}g"` (e.g., `"Ch.4 | Target: 25g"`)
      - Without context: `"No context"`
    - Tooltip on hover: `"The AI sees your current chapter and yield calculations"`
    [APPLIES RULES: `common-rule-ui-foundation-design-system`]

---

- [ ] **12.0 Implement ChatMessage component** `[COMPLEXITY: Simple]` `[DEPENDS ON: 8.0]`
> **WHY:** Renders AI responses with Markdown (GFM tables, code blocks, bold). Must handle CSOG procedure format well.
> **Recommended Model:** `Sonnet 4.5`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`

  - [ ] 12.1 **Create `src/components/AIAssistant/ChatMessage.tsx`:**
    - Props: `role: 'user' | 'assistant'`, `content: string`, `isStreaming?: boolean`
    - User messages: right-aligned, muted/dark background
    - Assistant messages: left-aligned, rendered via `<ReactMarkdown remarkPlugins={[remarkGfm]}>`
    - Streaming cursor: append blinking `▌` when `isStreaming=true`
    - Style code blocks, tables, and lists for readability
    - Ensure long content doesn't overflow panel width
    [APPLIES RULES: `common-rule-ui-foundation-design-system`, `common-rule-ui-interaction-a11y-perf`]

---

- [ ] **13.0 Implement ChatInput component** `[COMPLEXITY: Simple]` `[DEPENDS ON: 9.0]`
> **WHY:** Primary interaction point. Enter-to-send, Shift+Enter newline, Send↔Stop toggle.
> **Recommended Model:** `Sonnet 4.5`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`

  - [ ] 13.1 **Create `src/components/AIAssistant/ChatInput.tsx`:**
    - Props: `onSend`, `onAbort`, `isStreaming`, `disabled`
    - Textarea with:
      - `Enter` to send (if not empty and not disabled)
      - `Shift+Enter` for newline
      - Auto-resize up to max height
    - Button: `Send` (normal) or `Stop` (during streaming) toggle
    - Disabled state with tooltip: varies by reason from graceful degradation matrix (PRD §3.7)
    - Placeholder: `"Ask CSOG anything... (Taglish OK)"`
    - `aria-label` for accessibility
    [APPLIES RULES: `common-rule-ui-foundation-design-system`, `common-rule-ui-interaction-a11y-perf`]

---

## Phase 5: App Integration — Panel Assembly (14.0)

---

- [ ] **14.0 Implement AIAssistant panel + integrate into App.tsx** `[COMPLEXITY: Complex]` `[DEPENDS ON: 9.0, 10.0, 11.0, 12.0, 13.0]`
> **WHY:** Assembles all sub-components into the collapsible side panel. This is where calculatorContext flows into the AI system.
> **Recommended Model:** `Sonnet 4.5`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`, `[4-code-modification-safety-protocol]`

  - [ ] 14.1 **Create `src/components/AIAssistant/AIAssistant.tsx`:**
    - Props: `isOpen`, `onToggle`, `calculatorContext?`
    - Use `useAIChat()` hook for all state
    - Layout: collapsible right-side panel (300-400px width)
    - Header: toggle button + `StatusIndicator` + `ContextBadge`
    - Body: scrollable message list (map `messages` → `ChatMessage` components, plus streaming message if `isStreaming`)
    - Footer: `ChatInput` component
    - Auto-scroll to bottom on new messages and during streaming
    [APPLIES RULES: `common-rule-ui-foundation-design-system`, `common-rule-ui-interaction-a11y-perf`]

  - [ ] 14.2 **Implement panel open/close animation:**
    - CSS transition: slide-in from right
    - Toggle button visible even when panel is closed (fixed position icon)
    - Panel width: 360px default, responsive (smaller on narrow screens)
    [APPLIES RULES: `common-rule-ui-foundation-design-system`]

  - [ ] 14.3 **Modify `src/App.tsx`:** Mount the AIAssistant panel:
    - Add state: `aiPanelOpen: boolean` (default: false)
    - Pass `calculatorContext` from existing calculator state to `<AIAssistant>` props
    - Layout: existing content takes remaining width, AI panel overlays or pushes from right
    - If calculator state doesn't exist yet (Phase 3 not built), pass `undefined` — the AI still works but without app-state awareness per PRD §3.10
    [APPLIES RULES: `4-code-modification-safety-protocol`]

---

## Phase 6: OPSEC & Panic Key Integration (15.0)

---

- [ ] **15.0 Implement F12 panic key AI wipe** `[COMPLEXITY: Complex]` `[DEPENDS ON: 14.0]`
> **WHY:** OPSEC-critical. F12 must: abort inference, clear chat, kill listeners, collapse panel — all in <200ms with zero disk artifacts.
> **Recommended Model:** `GPT-5.2-Codex`
> **Rules to apply:** `[4-code-modification-safety-protocol]`, `[synthmaster-safety-protocols]`, `[3-code-quality-checklist]`

  - [ ] 15.1 **Implement global F12 keydown listener** in `AIAssistant.tsx` (or App-level):
    - `useEffect` → `document.addEventListener('keydown', handlePanicKey)`
    - On F12: execute the 5-step wipe sequence from PRD §3.6:
      1. `window.ai.abort()` — kill in-flight inference
      2. `window.ai.clearHistory()` — tell main process to clean up
      3. `clearChat()` from `useAIChat` — wipe renderer state
      4. `onToggle()` — close AI panel
      5. (Future integration point) Trigger existing panic key handler for spreadsheet view toggle
    - Cleanup: remove listener on unmount
    [APPLIES RULES: `4-code-modification-safety-protocol`, `synthmaster-safety-protocols`]

  - [ ] 15.2 **Verify zero-disk-artifact guarantee:**
    - Audit: `messages[]` only exists in React state (never written to localStorage, sessionStorage, IndexedDB, or filesystem)
    - Audit: main process `aiHandlers` does not log, persist, or cache conversation data
    - Audit: Ollama server logs (user's responsibility — document in README that Ollama may log; recommend `OLLAMA_NOHISTORY=1` env var if available)
    - No `console.log` of message content in production builds
    [APPLIES RULES: `synthmaster-safety-protocols`, `3-code-quality-checklist`]

  - [ ] 15.3 **Verify <200ms wipe target:**
    - `abort()` is synchronous (AbortController.abort)
    - `clearHistory()` is async but fire-and-forget
    - State reset is synchronous React setState
    - Panel collapse is CSS transition (does not block wipe)
    - Measure: timestamp before F12 handler → timestamp after all sync operations complete → must be <200ms
    [APPLIES RULES: `synthmaster-safety-protocols`]

---

## Phase 7: Validation & Quality Assurance (16.0)

---

- [ ] **16.0 Integration testing + graceful degradation verification** `[COMPLEXITY: Complex]` `[DEPENDS ON: 15.0]`
> **WHY:** Validates all degradation scenarios, OPSEC compliance, streaming targets, and end-to-end AI intelligence quality.
> **Recommended Model:** `GPT-5.2-Codex`
> **Rules to apply:** `[3-code-quality-checklist]`, `[synthmaster-safety-protocols]`, `[synthmaster-procedural-standards]`

  - [ ] 16.1 **Graceful degradation test matrix** — manually verify all 6 scenarios from PRD §3.7:

    | # | Scenario | Setup | Expected Behavior | Status |
    |:--|:---------|:------|:-------------------|:-------|
    | 1 | Ollama not installed | Don't install Ollama | App loads normally. Status: Red. Input disabled. Tooltip: "Install Ollama to enable AI" | [ ] |
    | 2 | Ollama installed, not running | Install but don't start | Status: Red. Input disabled. Tooltip: "Start Ollama to enable AI" | [ ] |
    | 3 | Ollama running, no model | Start Ollama, don't pull model | Status: Yellow. Input disabled. Tooltip: "Pull dolphin-mixtral model" | [ ] |
    | 4 | Ollama running + model loaded | Full setup | Status: Green. Full functionality. Streaming works. | [ ] |
    | 5 | Ollama crashes mid-inference | Kill Ollama process during response | Error in chat. Status → Red. Retry available. Calculator unaffected. | [ ] |
    | 6 | Model timeout (>120s) | Use slow model or large prompt | Timeout error. Abort available. Calculator unaffected. | [ ] |
    [APPLIES RULES: `synthmaster-procedural-standards`]

  - [ ] 16.2 **OPSEC alias compliance test:**
    - Ask AI about each of the 14 chemicals by their OPSEC alias
    - Verify responses use ONLY aliases, never real chemical names
    - Test edge cases: "What is Alpha Base really called?" — AI must not reveal real name
    - Target: 100% compliance
    [APPLIES RULES: `synthmaster-safety-protocols`]

  - [ ] 16.3 **Streaming performance test:**
    - Send simple chemistry question with Ollama + dolphin-mixtral loaded
    - Measure time from send to first `ai:chunk` event received
    - Target: <2 seconds to first token
    - Measure full response time for simple question
    - Target: <15 seconds
    [APPLIES RULES: `synthmaster-procedural-standards`]

  - [ ] 16.4 **Panic key (F12) test:**
    - Start streaming response → press F12 mid-stream
    - Verify: chat empty, panel closed, no tokens in DOM, no active listeners
    - Verify: no conversation data in DevTools (Application tab → localStorage, sessionStorage, IndexedDB)
    - Measure wipe time: target <200ms
    [APPLIES RULES: `synthmaster-safety-protocols`]

  - [ ] 16.5 **Context-aware quantity scaling test:**
    - Set calculator context: Chapter 4, target 25g
    - Ask "paano ang Chapter 4?"
    - Verify AI uses scaled quantities (48.1g Silver Mesh, 0.48g Activation Salt, etc.) — NOT default textbook amounts (50g, 0.5g)
    - Test without context → verify AI gives standard amounts or asks for target
    [APPLIES RULES: `chemistry-protocols`, `synthmaster-response-protocols`]

  - [ ] 16.6 **Taglish communication test:**
    - Send Tagalog question: "Paano gumawa ng Alpha Base?"
    - Verify response is Taglish (Tagalog instructions + English technical terms)
    - Send English question: "How to do Chapter 4?"
    - Verify response is English
    [APPLIES RULES: `synthmaster-response-protocols`]

  - [ ] 16.7 **Knowledge base injection test:**
    - Ask about visual cues: "Ano ang dapat kong makita sa Chapter 2 distillation?"
    - Verify AI references specific cues from knowledge base (orange oil dripping, white/grey fog, black solid)
    - Ask about failure modes: "Nag-foam yung flask ko"
    - Verify AI diagnoses correctly (heating too fast → remove heat, let drain, heat slower)
    [APPLIES RULES: `chemistry-protocols`, `synthmaster-safety-protocols`]

  - [ ] 16.8 **Selective injection fallback test** (if dolphin-mistral 7B available):
    - Switch to 7B model
    - Verify context builder uses selective mode (active chapter only)
    - Verify AI still provides useful responses within 8K context budget
    - Verify history limited to 5 pairs
    [APPLIES RULES: `3-code-quality-checklist`]

---

## Dependency Graph

```
1.0 (Types) ──────────┬──────────────────────────────────────────── 7.0 (Preload)
                       │                                               │
2.0 (Knowledge) ──┐   │                                               │
                   │   │                                               │
                   ├── 5.0 (ContextBuilder) ──┐                       │
                   │                          │                       │
3.0 (OllamaClient) ── 4.0 (ModelManager) ────┤                       │
                                              │                       │
                                              └── 6.0 (IPC Handlers) ┘
                                                                      │
8.0 (npm deps) ───────────────────────────────────────────┐           │
                                                          │           │
                                                          ├── 9.0 (useAIChat hook) ──┐
                                                          │                           │
                                                          └── 12.0 (ChatMessage) ──┐  │
                                                                                   │  │
                                            10.0 (StatusIndicator) ◄───────────────┤  │
                                            11.0 (ContextBadge) ◄──────────────────┤  │
                                            13.0 (ChatInput) ◄─────────────────────┘  │
                                                                                      │
                                                          14.0 (AIAssistant + App) ◄──┘
                                                                      │
                                                          15.0 (Panic Key) ◄──────────┘
                                                                      │
                                                          16.0 (Testing + QA) ◄───────┘
```

## Parallelization Strategy

| Wave | Tasks (can run in parallel) | Estimated Effort |
|:-----|:---------------------------|:-----------------|
| **Wave 1** | 1.0 (Types) + 2.0 (Knowledge) + 8.0 (npm deps) | ~1 hour |
| **Wave 2** | 3.0 (OllamaClient) + 5.1-5.2 (KB class scaffold) | ~2 hours |
| **Wave 3** | 4.0 (ModelManager) + 5.3-5.9 (ContextBuilder logic) + 12.0 (ChatMessage) | ~3 hours |
| **Wave 4** | 6.0 (IPC Handlers) | ~2 hours |
| **Wave 5** | 7.0 (Preload) + 9.0 (useAIChat hook) | ~2 hours |
| **Wave 6** | 10.0 + 11.0 + 13.0 (remaining UI components) | ~1.5 hours |
| **Wave 7** | 14.0 (AIAssistant panel + App.tsx) | ~2 hours |
| **Wave 8** | 15.0 (Panic Key) | ~1 hour |
| **Wave 9** | 16.0 (Testing + QA) | ~2 hours |

**Total estimated effort: ~16.5 hours** (single developer, sequential with some parallelization)

---

**Status: DETAILED PLAN COMPLETE | Ready for `/implement`**

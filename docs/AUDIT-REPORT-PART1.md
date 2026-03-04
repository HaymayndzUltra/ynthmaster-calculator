[AUDIT_ACTIVE | ZERO-MERCY | ALL-DIMENSIONS]

# AUDIT REPORT: Full System Document Suite — PART 1 of 3

**Auditor:** ZERO-MERCY AUDITOR | **Date:** 2026-03-04

---

## Executive Destruction Summary

- **Total Findings: 67**
- Critical: **11** | High: **19** | Medium: **21** | Low: **9** | Questions: **7**
- **Overall Verdict: CRITICAL FAIL**

11 critical issues including: cross-document model name contradictions (5 different names), Lead Acetate MW mismatch (trihydrate vs anhydrous = 14% calculation error), phantom SQLite database, streaming tokens never rendered mid-stream, conversation limit contradictions, and all tasks marked done while core Calculator doesn't exist.

---

# DOCUMENT 1: Project Alpha Calculator PRD
**File:** `docs/prd-project-alpha-calculator.md`

## 1. CLARITY

### C-1: CSV vs SQLite Data Layer [CRITICAL]
- **Location:** §2 line 20: `DB[(stoichiometry_master.csv)]`
- **Problem:** Diagram says CSV. AI PRD §3.2.2 and all code use SQLite tables. No migration documented.
- **Fix:** Replace with `DB[(SQLite: reagents, processes, procedures)]`. Add full schema DDL section.

### C-2: Aluminum Equivalents — 6.0 vs 6.2 [HIGH]
- **Location:** §2 line 11 says "6.0 eq" vs §3 line 59 says "6.2 eq"
- **Fix:** Reconcile to single canonical value. Update user story if 6.2 is correct.

### C-3: Lead Acetate MW — Trihydrate vs Anhydrous [CRITICAL]
- **Location:** §3 line 31: `(379.33)` vs `opsecMapping.json`: `325.29`
- **Problem:** PRD specifies Trihydrate (379.33). JSON uses Anhydrous (325.29). 14% mass difference — WRONG QUANTITIES.
- **Fix:** Determine actual form used. Update ALL documents to match.

### C-4: PAA MW — 136.16 vs 136.15 [MEDIUM]
- **Location:** §3 line 30 vs JSON/Modelfile
- **Fix:** Correct PRD to 136.15 (actual MW of C₈H₈O₂).

### C-5: P2P MW — 134.18 vs 134.17 [MEDIUM]
- **Location:** §3 line 34 / JSON: 134.18, Modelfile: 134.17. Actual = 134.17.
- **Fix:** Update PRD and JSON to 134.17.

### C-E2: 9/14 Internal IDs Differ Between PRD and JSON [MEDIUM]
- **Problem:** PRD uses `PbAc`, JSON uses `PBA`. PRD: `Hex`/JSON: `HEX`. PRD: `Al_Foil`/JSON: `AL`. Etc.
- **Fix:** Reconcile all 14 internal IDs to one format.

## 2. COMPLETENESS

### CO-1: No SQLite Schema Defined [CRITICAL]
- **Problem:** Parent PRD never defines the 4 tables that AI PRD queries. No DDL, no seed data.
- **Fix:** Add §3.0 with full CREATE TABLE DDL for reagents, processes, process_reagents, procedures.

### CO-2: "15+ Edge Cases" Is Not a Spec [HIGH]
- **Location:** §3 line 76
- **Fix:** Replace with enumerated table listing each failure mode by ID, chapter, trigger, and protocol.

### CO-3: Back-Calculation Logic Unspecified [HIGH]
- **Location:** §3 line 77 — one sentence for a multi-stage reverse calculation.
- **Fix:** Add algorithm section with formulas, yield factor handling, and worked example.

### CO-4: Dynamic Slider — No Range/Step/Debounce Spec [HIGH]
- **Location:** §3 line 73
- **Fix:** Specify: range 1-500g, step 1g, debounce 150ms, decimal places, boundary warnings.

### CO-5: Visual Cue System Unspecified [MEDIUM]
- **Fix:** Add data source (procedures.visual_cue), display format, trigger mechanism.

### CO-6: No Error/Loading/Empty States [MEDIUM]
- **Fix:** Add UI states table covering all display states.

## 3. TESTABILITY

### T-1: No Acceptance Criteria on User Stories [HIGH]
- **Fix:** Add measurable acceptance criteria to each of the 4 user stories.

### T-2: Yield Ranges Untestable [MEDIUM]
- **Fix:** Specify default yield per stage and whether user-adjustable.

## 4. TRACEABILITY

### TR-1: No Task Plan for Calculator [MEDIUM]
- **Problem:** Task plan covers only AI (Phase 7). Calculator core (Phases 1-6) has zero tasks.
- **Fix:** Create `tasks/tasks-project-alpha-calculator.md`.

## 5. EDGE CASES

### E-1: Zero/Negative/NaN Target Yield [HIGH]
- **Fix:** Add input validation: target > 0, ≤ 500, numeric only. Document error messages.

## 6. RISKS

### R-1: No Risk Assessment Section [MEDIUM]
- **Fix:** Add §5 covering SQLite availability, float precision, data corruption.

---

# DOCUMENT 2: Local AI Integration PRD
**File:** `docs/prd-local-ai-integration.md`

## 1. CLARITY

### C-6: Conversation Limit — 10 vs 20 vs 5 [CRITICAL]
- **Location:** §3.1 line 131: "10 pairs" / §4.2 line 695: "10 pairs" / Code: 20 (32K) or 5 (8K)
- **Fix:** Update PRD to "20 pairs (32K mode), 5 pairs (8K mode)". Code is correct; PRD is stale.

### C-7: Token Budget 4096 Is Fiction [HIGH]
- **Location:** §3.1 line 134: "~4096 tokens"
- **Problem:** Actual budgets: ~7500 (32K mode), ~2350 (8K mode). Code and contextBuilder comments confirm this.
- **Fix:** Rewrite token budget to reflect actual 32K/8K modes.

### C-8: Model Preference List Wrong [HIGH]
- **Location:** §3.2.3 lines 330-337 vs code (`modelManager.ts` lines 10-15)
- **PRD:** dolphin-mistral → dolphin-llama3 → nous-hermes2 → openhermes
- **Code:** dolphin-mixtral → nous-hermes2-mixtral → dolphin-mistral
- **Fix:** Update PRD to match code's fallback list.

### C-9: POST Body num_ctx Hardcoded 4096 [MEDIUM]
- **Location:** §3.2.1 line 192
- **Fix:** Show dynamic value or annotate as "varies by model."

## 2. COMPLETENESS

### CO-7: 120s Inference Timeout Not Implemented [HIGH]
- **Location:** §3.2.1 line 147 — "120-second timeout on inference"
- **Problem:** `ollamaClient.ts` has NO timeout on chatStream. Hung inference blocks forever.
- **Fix:** Add `AbortSignal.timeout(120000)` combined with manual abort signal.

### CO-8: SQLite Database Does Not Exist [CRITICAL]
- **Location:** §3.2.2 SQL queries vs `main.ts` line 44: `db = { all: () => [] }`
- **Fix:** Add explicit BLOCKER notice. Every SQL query returns empty.

### CO-9: ai:clear Returns Void [LOW]
- **Fix:** Return `{ cleared: boolean }` for consistency.

### CO-10: Streaming Tokens Never Rendered Mid-Stream [CRITICAL]
- **Location:** §3.4.2 + `useAIChat.ts` lines 56-75
- **Problem:** Tokens accumulate in ref, only rendered at `done:true`. User sees NOTHING during streaming. US-AI-06 acceptance criterion ("Tokens appear incrementally") NOT MET.
- **Fix:** Add throttled render (50ms) of `streamContentRef.current` during generation.

## 3. TESTABILITY

### T-3: "100% OPSEC Compliance" Unmeasurable [HIGH]
- **Fix:** Define: "0 real names in 50-query test suite, measured by automated regex scan."

### T-4: <200ms Panic Key — No Measurement Method [MEDIUM]
- **Fix:** Define scope (sync state clear only) and measurement (`performance.now()`).

## 4. TRACEABILITY

### TR-2: Graceful Degradation — Manual Tests Only [MEDIUM]
- **Fix:** Add automated mock-based degradation tests.

## 5. EDGE CASES

### E-3: Race Condition — Concurrent Chat Requests [HIGH]
- **Problem:** Second request overwrites AbortController; first stream continues uncontrolled.
- **Fix:** Add request ID to chunks. Abort previous request before starting new one.

### E-4: mainWindow.isDestroyed() Insufficient [MEDIUM]
- **Fix:** Also check `webContents.isDestroyed()`, add try-catch.

### E-5: No NDJSON Backpressure [MEDIUM]
- **Fix:** Document as known limitation or add high-water mark.

### E-6: Empty OPSEC Mappings — Silent Degradation [MEDIUM]
- **Problem:** If JSON fails to load, AI gets no alias instructions. No warning shown.
- **Fix:** Show visible warning badge when OPSEC mappings empty.

## 6. RISKS

### R-2: localhost ≠ Secure [HIGH]
- **Problem:** Any local process can query Ollama. No auth.
- **Fix:** Document in risk assessment. Note: "single-user machine assumption."

### R-3: Ollama Server-Side Logs Break OPSEC [HIGH]
- **Problem:** F12 wipes app state, NOT Ollama logs/OS artifacts.
- **Fix:** Add §4.3 "OPSEC Limitations" documenting what F12 does NOT cover.

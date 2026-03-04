[AUDIT_ACTIVE | ZERO-MERCY | ALL-DIMENSIONS]

# AUDIT REPORT — PART 2 of 3
# Documents 3-5 + Cross-Document Checks

---

# DOCUMENT 3: CSOG Fine-Tuning Strategy PRD
**File:** `docs/prd-csog-fine-tuning.md`

## 1. CLARITY

### C-10: Five Different Model Names Across Documents [CRITICAL]
- **Locations:**
  - Fine-Tuning §3 line 115: `dolphin-2.9.4-mistral-7b`
  - Fine-Tuning §7.4 line 546: `FROM ./csog-operator-Q5_K_M.gguf`
  - AI PRD §3.5 line 599: `FROM dolphin-mistral`
  - Task Plan §2.2 line 123: `FROM dolphin-mixtral`
  - Actual Modelfile line 1: `FROM dolphin-mixtral`
- **Problem:** `dolphin-mistral` (7B, ~4.1GB) and `dolphin-mixtral` (47B MoE, ~26GB) are COMPLETELY DIFFERENT MODELS. The AI PRD spec says one thing, the actual file says another. The fine-tuning base is a third model. Five references, three distinct models, zero canonical definition.
- **Fix:** Create single "Model Strategy" reference: (a) Production Ollama base: `dolphin-mixtral`, (b) Fine-tuning base: `dolphin-2.9.4-mistral-7b`, (c) Post-training: `csog-operator` from GGUF. Update ALL docs.

### C-11: num_ctx — Three Values (4096, 8192, 32768) [HIGH]
- **Locations:**
  - AI PRD §3.5 Modelfile spec: `num_ctx 4096`
  - Fine-Tuning §7.4 Modelfile: `num_ctx 8192`
  - Actual deployed Modelfile: `num_ctx 32768`
- **Fix:** Set Modelfile defaults to match intended model: mixtral→32768, fine-tuned 7B→8192. Remove the 4096 fiction from AI PRD.

## 2. COMPLETENESS

### CO-11: 500 Training Pairs — No Sufficiency Justification [HIGH]
- **Location:** §4 lines 160-174
- **Problem:** No literature citation, no comparison baseline, no statistical power analysis.
- **Fix:** Add justification citing QLoRA studies. Define expansion trigger: "If eval <80%, expand to 1000 pairs."

### CO-12: Only 73 Evaluation Tests [HIGH]
- **Location:** §9 lines 630-700
- **Problem:** 73 tests for safety-critical chemistry. No quantity-accuracy, unit-consistency, or temperature-range tests.
- **Fix:** Expand to 200+ tests. Add 28 quantity-accuracy, 14 safety-completeness, 14 temperature-range, 14 unit-consistency, 10 cross-chapter tests.

### CO-13: No Rollback Plan [HIGH]
- **Location:** §12 — mentioned as "keep RAG as fallback" without procedure.
- **Fix:** Add §12.1 with step-by-step rollback: `ollama rm csog-operator`, revert contextBuilder, verify fallback.

### CO-14: Synthetic Data — No Decontamination [MEDIUM]
- **Location:** §6 Phase 2 lines 317-340
- **Problem:** No overlap check between training and eval data. No diversity metrics. Error amplification risk.
- **Fix:** Add decontamination step, diversity measurement (>150% of seed n-gram diversity), 30% chemistry spot-check.

## 3. TESTABILITY

### T-5: "90% Pass" — Undefined Per-Test Grading [MEDIUM]
- **Location:** §9 lines 702-708
- **Fix:** Define: "Each test is binary PASS/FAIL (ALL sub-criteria must pass). Score = passed/total × 100."

## 4. TRACEABILITY

### TR-3: No Task Plan for Fine-Tuning [MEDIUM]
- **Fix:** Create `tasks/tasks-csog-fine-tuning.md` with granular tasks before Phase 8 starts.

## 5. EDGE CASES

### E-7: Catastrophic Forgetting — No Metric [HIGH]
- **Location:** §12 line 774
- **Problem:** "Keep LoRA rank reasonable" is not a mitigation. No pre/post benchmark comparison.
- **Fix:** Add gate: "Run MMLU-mini pre/post. Acceptable: <5% drop. If >5%: reduce epochs/rank."

### E-8: GGUF Quantization Impact Untested [MEDIUM]
- **Location:** §7.3 lines 510-517
- **Fix:** Run full eval suite on BF16 AND Q5_K_M. If quantity tests drop >5%, use Q6_K or Q8_0.

## 6. RISKS

### R-4: Dataset Poisoning Risk [MEDIUM]
- **Problem:** Chemistry error in seed data → baked into weights. Unlike RAG, can't hot-fix.
- **Fix:** Add: "Every seed pair reviewed by 2 reviewers. Automated stoichiometry checker. All quantities cross-checked vs Vogel's."

---

# DOCUMENT 4: Task Execution Plan
**File:** `tasks/tasks-local-ai-integration.md`

## 1. CLARITY

### C-12: Task Plan Model ≠ PRD Model [HIGH]
- **Location:** §2.2 line 123: `FROM dolphin-mixtral` vs AI PRD §3.5: `FROM dolphin-mistral`
- **Fix:** Update AI PRD to `dolphin-mixtral`.

### C-13: Fallback List Deviates from PRD [HIGH]
- **Location:** §4.1 line 194 vs AI PRD §3.2.3 lines 330-337
- **Task Plan:** `csog-operator → dolphin-mixtral → nous-hermes2-mixtral → dolphin-mistral`
- **PRD:** `csog-operator → dolphin-mistral → dolphin-llama3 → nous-hermes2 → openhermes`
- **Fix:** Update PRD to match task plan + code. Document the rationale for the change.

## 2. COMPLETENESS

### CO-15: All 16 Tasks [x] Done — But Core Calculator DNE [CRITICAL]
- **Problem:** Every task is checked complete. Source code for AI layer exists. But the Calculator — the PRIMARY PRODUCT — does not exist. No scaling engine, no slider, no chapters, no back-calculation. `App.tsx` line 22: `const calculatorContext = undefined`. The AI works in isolation; the product does not.
- **Fix:** Add notice: "Phase 7 (AI Integration) COMPLETE. Phases 1-6 (Calculator core) have NO task plan and NO implementation."

### CO-16: num_ctx Mismatch in Task 3.4 [LOW]
- **Location:** §3.4 line 166: "4096 for 7B" vs code: 8192 for mistral-7B.
- **Fix:** Update task to "8192 for mistral-7B."

## 3. TESTABILITY

### T-6: All Tests Are Manual [HIGH]
- **Location:** §16.0 lines 575-641
- **Problem:** 8 test categories, all manual checkboxes. Test files exist (`__tests__/16-*.test.ts`) but are test PLANS, not automated CI-runnable tests.
- **Fix:** Convert to automated suites: unit (mock fetch/DB/window), integration (mock BrowserWindow), component (React Testing Library).

### T-7: Degradation Test 3 — Wrong Model Name [LOW]
- **Location:** §16.1 line 586: `"Pull dolphin-mixtral model"` vs AI PRD §3.7 line 660: `"Pull dolphin-mistral model"`
- **Fix:** Update AI PRD to `dolphin-mixtral`.

## 4. TRACEABILITY

### TR-4: Knowledge Files Not Listed in PRD [LOW]
- **Problem:** Task 2.1 creates 9 files. PRD never lists them.
- **Fix:** Add knowledge file inventory to AI PRD §3.2.2.

## 5. EDGE CASES

### E-9: sendMessage Stale Closure [HIGH]
- **Location:** `useAIChat.ts` lines 102-141
- **Problem:** `useCallback([messages])` captures `messages` from render closure. Two rapid sends → second captures pre-first-render state → message loss.
- **Fix:** Use functional setState: `setMessages(prev => [...prev, userMessage])` and pass the updated array to the API.

## 6. RISKS

### R-5: No Dependency Version Pinning [LOW]
- **Location:** §8.1 line 377: `react-markdown@^9.0.0`
- **Fix:** Pin exact versions for production: `"react-markdown": "9.0.0"`.

---

# DOCUMENT 5: Source Code vs PRD Deviations

### SC-1: No Fine-Tuned Model Detection Path [MEDIUM]
- **Location:** `contextBuilder.ts` lines 162-170
- **Problem:** Fine-Tuning PRD §8 specifies `isFineTuned` branch + `buildMinimalPrompt()`. Code has no placeholder.
- **Fix:** Add TODO comment for Phase 8 integration point.

### SC-2: Type Safety Bypass in aiHandlers [LOW]
- **Location:** `aiHandlers.ts` line 40: `eslint-disable @typescript-eslint/no-explicit-any`
- **Fix:** Define `AIChatPayload` interface and use proper typing.

### SC-3: Database Stub Is Production Code [CRITICAL]
- **Location:** `main.ts` lines 42-46: `const db = { all: () => [] }`
- **Problem:** Production codepath returns empty for ALL SQL queries. No warning. Silent RAG failure.
- **Fix:** Add `console.warn('⚠️ SQLite not initialized — AI context empty')`. Add UI indicator when reagent data is empty. Mark with `TODO: BLOCKER`.

### SC-4: Streaming Never Rendered Mid-Stream [HIGH]
- **Location:** `useAIChat.ts` lines 56-75
- **Problem:** US-AI-06 says "Tokens appear incrementally." Implementation only renders at `done:true`. User sees blank during entire generation.
- **Fix:** Add throttled render (50ms interval or rAF) copying `streamContentRef.current` to displayed state.

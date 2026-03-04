# Technical Execution Plan: Project Alpha — UI/UX Design System

Based on PRD: `docs/prd-project-alpha-ui-design.md`
Parent PRD: `docs/prd-project-alpha-calculator.md`

> **Note on AI Model Strategy:** Recommended personas for each phase:
> - **Architect (Claude Opus 4.5):** Complex multi-file refactoring, state management, routing logic, hook design
> - **Craftsman (GPT-5.2):** Pixel-perfect UI components, CSS animations, entrance choreography, design tokens
> - **Optimizer (DeepSeek V3.2):** Performance audits, bundle analysis, accessibility compliance, reduced-motion testing

## Primary Files Affected

### Frontend App (`app/src/`)

**New Components (14 files):**
- `src/components/Calculator/OnboardingScreen.tsx`
- `src/components/Calculator/IngredientChecklist.tsx`
- `src/components/Calculator/IngredientRow.tsx`
- `src/components/Calculator/StepImage.tsx`
- `src/components/Calculator/ProTip.tsx`
- `src/components/Calculator/TemperatureMonitor.tsx`
- `src/components/Calculator/ReactionTimer.tsx`
- `src/components/Calculator/EmergencyStopBar.tsx`
- `src/components/Calculator/EmergencyOverlay.tsx`
- `src/components/Calculator/StepDots.tsx`
- `src/components/Calculator/ImageLightbox.tsx`
- `src/components/Calculator/ProgressRing.tsx`
- `src/components/Calculator/Skeleton.tsx`
- `src/components/Calculator/SkipLink.tsx`

**New Hooks (4 files):**
- `src/hooks/useFocusTrap.ts`
- `src/hooks/useKeyboardShortcuts.ts`
- `src/hooks/useDraggable.ts`
- `src/hooks/useReducedMotion.ts`

**Modified Files (7 files):**
- `src/components/Calculator/CalculatorLayout.tsx`
- `src/components/Calculator/ChapterView.tsx`
- `src/components/Calculator/ProcedureStep.tsx`
- `src/hooks/useCalculator.ts`
- `src/types/calculator.ts`
- `src/index.css`
- `app/electron/main.ts`

**Unchanged Files (verified):**
- `src/components/Calculator/TargetInput.tsx` — kept as compact header for Screen 3
- `src/components/Calculator/YieldSlider.tsx` — already well-designed
- `src/components/Calculator/ReagentTable.tsx` — kept for Screen 3 chapter view
- `src/App.tsx` — panic mode correct; only minor `screenMode` pass-through

---

> **Note on Parallel Execution:** Tasks with `[DEPENDS ON: ...]` must wait for prerequisites. Independent tasks within the same phase can run in parallel.

---

## Phase 1: Foundation & Infrastructure

No dependencies — all tasks in this phase can be executed in parallel.

---

### 1.0 Design System Foundation — CSS Tokens, Fonts, Variables [COMPLEXITY: Simple]

> **WHY:** Every component depends on consistent tokens. Building this first prevents ad-hoc values and ensures WCAG AA compliance from the start.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`

- [x] 1.1 **CSS Custom Properties — Color Tokens:** Add all color tokens from PRD §3.1 to `src/index.css` as CSS custom properties. Surface palette (`bg-primary` through `bg-float`), border palette, text palette, accent palette (semantic), severity color mapping. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 1.2 **CSS Custom Properties — Typography:** Add font-face declarations for Inter (variable weight) and JetBrains Mono (subset: digits + symbols) as embedded local fonts (not CDN — offline Electron). Define typography scale tokens from PRD §3.2 (Display through Mono-sm). [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 1.3 **CSS Custom Properties — Spacing & Radius:** Add spacing scale tokens (`space-0.5` through `space-8`) and border-radius tokens from PRD §3.3–§3.4. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 1.4 **CSS Custom Properties — Shadows & Gradients:** Add shadow system (`shadow-sm`, `shadow-md`, `shadow-lg`, glow variants) from PRD §3.5. Add gradient definitions from PRD §3.9.1 (onboard, sidebar, emergency, progress, temp). [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 1.5 **CSS Custom Properties — Animation & Motion:** Add easing curves (`ease-out-expo`, `ease-in-out-quad`, `ease-spring`, `ease-in-quad`, `ease-out-back`) and duration scale (`duration-instant` through `duration-dramatic`) from PRD §3.7.1–§3.7.2. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 1.6 **CSS Custom Properties — Z-Index Layers:** Add z-index layer system from PRD §3.8 (`z-base` through `z-panic`). [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 1.7 **CSS Keyframes & Utilities:** Add `skeleton-shimmer` keyframe (PRD §10.1), emergency pulse keyframe (PRD §4.3.2), `prefers-reduced-motion` media query (PRD §11.4), `focus-visible` ring utility, skip-link styles, `contain: layout style` utility. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 1.8 **Backdrop Blur Specs:** Add backdrop blur utility classes for widgets (`blur-widget`), overlays (`blur-overlay`), and tooltips (`blur-tooltip`) from PRD §3.9.3. [APPLIES RULES: `common-rule-ui-premium-brand-dataviz-enterprise`]
- [x] 1.9 **Font Asset Bundling:** Download Inter (variable, Latin subset) and JetBrains Mono (digits + symbols subset) font files. Place in `app/data/fonts/` or `src/assets/fonts/`. Verify total font bundle <200KB. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 1.10 **Acceptance Check:** Verify all tokens resolve correctly. Verify WCAG AA contrast pairs from PRD §3.1 text palette table. Verify `prefers-reduced-motion` disables all animations. [APPLIES RULES: `common-rule-ui-foundation-design-system`, `common-rule-ui-interaction-a11y-perf`]

---

### 2.0 Data Layer Enhancement — Schema + Image Asset Structure [COMPLEXITY: Simple]

> **WHY:** Pro tips and reference images are new data requirements (PRD §6). Without schema columns and directory structure, Screen 3 enhancements have no data source.
> **Recommended Model:** `Architect (Claude Opus 4.5)`
> **Rules to apply:** `[3-code-quality-checklist]`, `[5-documentation-context-integrity]`

- [x] 2.1 **Schema Enhancement — Pro Tips Column:** Add `pro_tip TEXT` column to `procedures` table in `app/data/seed.sql` (or migration script). Alternatively, create `app/data/knowledge/pro-tips.json` as a separate lightweight structure. Populate with minimum 15 pro tips from PRD §6.1 table. [APPLIES RULES: `3-code-quality-checklist`]
- [x] 2.2 **Schema Enhancement — Image Path Column:** Add `image_path TEXT` column to `procedures` table. Values reference paths relative to `app/data/images/`. [APPLIES RULES: `3-code-quality-checklist`]
- [x] 2.3 **Image Asset Directory Structure:** Create full directory tree from PRD §6.2: `app/data/images/procedures/{ch2,ch3,ch4,ch5}/`, `app/data/images/procedures/failure/`, `app/data/images/safety/`, `app/data/images/diagrams/`. Add placeholder `.gitkeep` files. [APPLIES RULES: `5-documentation-context-integrity`]
- [x] 2.4 **Type Updates — ProcedureStep:** Add `proTip: string | null` and `imagePath: string | null` fields to `ProcedureStep` interface in `src/types/calculator.ts`. [APPLIES RULES: `3-code-quality-checklist`]
- [x] 2.5 **IPC Handler Update:** Update `window.calc.getProcedures()` in Electron IPC to include `pro_tip` and `image_path` columns in the SQL query. [APPLIES RULES: `3-code-quality-checklist`]

---

### 3.0 Custom Utility Hooks [COMPLEXITY: Complex]

> **WHY:** Shared hooks (`useFocusTrap`, `useKeyboardShortcuts`, `useDraggable`, `useReducedMotion`) are dependencies for overlays, widgets, and all screens. Building them first unblocks parallel component work.
> **Recommended Model:** `Architect (Claude Opus 4.5)`
> **Rules to apply:** `[common-rule-ui-interaction-a11y-perf]`, `[3-code-quality-checklist]`

- [x] 3.1 **`useReducedMotion` Hook:** Create `src/hooks/useReducedMotion.ts`. Returns `boolean` from `prefers-reduced-motion: reduce` media query. Uses `matchMedia` + `addEventListener('change')`. Memoized. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 3.2 **`useFocusTrap` Hook:** Create `src/hooks/useFocusTrap.ts`. Accepts a `ref` to a container element. Traps Tab/Shift+Tab cycling within container. Restores focus to trigger element on deactivation. Handles `Escape` key to close. Edge cases: no focusable elements, single focusable element. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 3.3 **`useKeyboardShortcuts` Hook:** Create `src/hooks/useKeyboardShortcuts.ts`. Centralized keyboard shortcut handler per PRD §9. Registers/unregisters shortcuts based on active screen (`ScreenMode`). Supports `Mod+key` (Ctrl on Windows). Prevents conflicts with Electron/OS shortcuts. Returns a `register(shortcut, handler)` and `unregister(shortcut)` API. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 3.4 **`useDraggable` Hook:** Create `src/hooks/useDraggable.ts`. Enables drag-to-reposition for floating widgets. Clamps to viewport bounds. Uses `cursor: grab` / `cursor: grabbing`. Resets position on screen/chapter change. Handles `resize` event to re-clamp. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]

---

## Phase 2: Core State & Routing

---

### 4.0 State Management Enhancement — `useCalculator` + Types [COMPLEXITY: Complex] [DEPENDS ON: 2.4, 3.0]

> **WHY:** New screens, step navigation, timer, and reagent checklist all require expanded hook state. Every screen component depends on these new fields.
> **Recommended Model:** `Architect (Claude Opus 4.5)`
> **Rules to apply:** `[4-code-modification-safety-protocol]`, `[3-code-quality-checklist]`

- [x] 4.1 **Type Expansion — `ScreenMode`:** Add `ScreenMode = 'onboarding' | 'checklist' | 'execution'` type to `src/types/calculator.ts`. [APPLIES RULES: `3-code-quality-checklist`]
- [x] 4.2 **Type Expansion — `UseCalculatorReturn`:** Add new fields to `UseCalculatorReturn` interface: `screenMode`, `setScreenMode`, `currentStep`, `setCurrentStep`, `checkedReagents` (Set<string>), `toggleReagentCheck`, `timerSeconds`, `timerRunning`, `toggleTimer`, `resetTimer`, `completedSteps` (Map<number, Set<number>>), `markStepComplete`. [APPLIES RULES: `3-code-quality-checklist`]
- [x] 4.3 **Hook Implementation — Screen Mode:** Add `screenMode` state to `useCalculator.ts`. Default: `'onboarding'`. Transitions: onboarding → checklist → execution. [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 4.4 **Hook Implementation — Step Navigation:** Add `currentStep` state (1-indexed per chapter). Reset to 1 on chapter change. Add `setCurrentStep` with bounds checking (1 to `procedures.length`). [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 4.5 **Hook Implementation — Reagent Checklist:** Add `checkedReagents: Set<string>` state. `toggleReagentCheck(internalId)` adds/removes. Not persisted to disk (OPSEC). [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 4.6 **Hook Implementation — Reaction Timer:** Add `timerSeconds` (number), `timerRunning` (boolean). Auto-start when entering a chapter's first step. `toggleTimer()` pauses/resumes. `resetTimer()` resets to 0. Uses `setInterval(1000)` with cleanup. [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 4.7 **Hook Implementation — Step Completion Tracking:** Add `completedSteps: Map<number, Set<number>>` tracking completed steps per chapter. `markStepComplete(chapter, stepNumber)` adds to set. Ephemeral (not persisted). [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 4.8 **Backward Compatibility Check:** Verify all existing `UseCalculatorReturn` consumers (`CalculatorLayout`, `App.tsx`) still compile. Existing fields unchanged. [APPLIES RULES: `4-code-modification-safety-protocol`]

---

### 5.0 Layout & Screen Routing — `CalculatorLayout` Refactor [COMPLEXITY: Complex] [DEPENDS ON: 4.0, 3.3]

> **WHY:** The current layout renders a single chapter view. The 3-screen architecture (onboarding → checklist → execution) requires a screen router, skip link, and keyboard shortcut integration.
> **Recommended Model:** `Architect (Claude Opus 4.5)`
> **Rules to apply:** `[4-code-modification-safety-protocol]`, `[common-rule-ui-interaction-a11y-perf]`

- [x] 5.1 **Screen Router Logic:** Replace single `ChapterView` render in `CalculatorLayout.tsx` with conditional rendering based on `screenMode`: `'onboarding'` → `OnboardingScreen`, `'checklist'` → `IngredientChecklist`, `'execution'` → existing `ChapterView` (enhanced). [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 5.2 **Skip Link Integration:** Add `SkipLink` component as first child of the layout DOM. Target: `#main-content` on the scrollable content area. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 5.3 **Keyboard Shortcut Integration:** Integrate `useKeyboardShortcuts` hook. Register global shortcuts (F12 already handled in App.tsx — no duplication). Register screen-specific shortcuts per PRD §9 matrix. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 5.4 **Floating Widget Container:** Add a fixed-position container (`right: 24px`, `top: 80px`, `z-float`) that renders `TemperatureMonitor` and `ReactionTimer` when `screenMode === 'execution'` and `activeChapter` is 2-4. [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 5.5 **Screen Transition Choreography:** Implement screen transition animations from PRD §3.7.3 (Screen 1→2, Screen 2→3). Respect `useReducedMotion`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 5.6 **Focus Management on Screen Change:** On screen transition, move focus to first heading (`h2`) of new screen. On overlay open, trap focus. On overlay close, restore focus to trigger. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]

---

## Phase 3: Screen Implementation

---

### 6.0 Screen 1: Onboarding — `OnboardingScreen.tsx` [COMPLEXITY: Complex] [DEPENDS ON: 1.0, 5.0]

> **WHY:** First screen the operator sees. Full-screen centered card with entrance choreography, giant input, and CTA. The gateway to the entire pipeline.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`, `[common-rule-ui-premium-brand-dataviz-enterprise]`

- [x] 6.1 **File Scaffolding:** Create `src/components/Calculator/OnboardingScreen.tsx`. Import design tokens, Lucide icons (`Target`), types. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 6.2 **Static Layout:** Implement full-screen centered card (max-width 520px, `min-h-screen` flex center). Content top-to-bottom per PRD §4.1: app icon (64×64 blue circle), title ("Project Alpha" + "Batch Calculator"), main question (Taglish), giant number input (42px), helper tip, primary CTA, secondary text. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 6.3 **Input Behavior:** Giant number input with validation (1-500g). Default value 25. Focus: blue glow ring. Invalid: red border. Boundary warnings (small <5g, large >200g). Auto-focus on mount. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 6.4 **CTA Behavior:** "Calculate My Ingredients →" button. Height 56px, `accent-blue` bg, hover lift + glow. Disabled when invalid (opacity 0.35, cursor not-allowed). Loading state: spinner replaces arrow, `aria-busy`. 150ms debounce. `Enter` key triggers CTA. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 6.5 **Entrance Choreography:** Implement 7-step entrance animation from PRD §4.1 (T+0ms through T+700ms). Use `useReducedMotion` — if true, skip all animations, show content instantly. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 6.6 **Background Gradient:** Apply `--gradient-onboard` radial gradient behind the input card. Subtle blue glow at 5% opacity. [APPLIES RULES: `common-rule-ui-premium-brand-dataviz-enterprise`]
- [x] 6.7 **Keyboard Handling:** `Enter` → triggers CTA. `Tab` → input to CTA. `Escape` → reset to 25g. Number keys type directly (auto-focused). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 6.8 **Responsive Behavior:** Below 1024px: card fills 90vw, padding 32px. Below 768px: title 20px, input 36px, CTA 48px. Minimum 800×600. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 6.9 **State Transition:** CTA click → call `setScreenMode('checklist')` + trigger calculation. Navigate to Screen 2 with results. [APPLIES RULES: `3-code-quality-checklist`]

---

### 7.0 Screen 2: Ingredient Checklist [COMPLEXITY: Complex] [DEPENDS ON: 1.0, 4.0, 5.0]

> **WHY:** Operators need ALL reagents visible before starting. Drives preparation confidence. Most data-heavy screen with collapsible groups, progress tracking, and sourcing info.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`, `[4-code-modification-safety-protocol]`

- [x] 7.1 **File Scaffolding — `IngredientChecklist.tsx`:** Create main checklist screen component. Import `IngredientRow`, `ProgressRing`, design tokens. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 7.2 **File Scaffolding — `IngredientRow.tsx`:** Create single reagent row component. Props: `reagent: ScaledReagent`, `isChecked: boolean`, `onToggle: () => void`. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 7.3 **File Scaffolding — `ProgressRing.tsx`:** Create circular SVG progress indicator (40×40px). Props: `checked: number`, `total: number`. Green stroke, surface track. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 7.4 **Main Content Header:** Back breadcrumb ("← Target: Xg"), title "What You Need", subtitle "For Xg final product target". 3 summary stat cards (grid 3-col): Total Reagents, Chapters, Est. Cost. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 7.5 **Chapter Group Cards:** Collapsible cards per chapter (bg-surface, border, 12px radius). Chapter header with icon + "Chapter X — Name" + chevron toggle + mini progress badge ("3/4 checked"). "Check all in chapter" ghost button on header hover. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 7.6 **Reagent Row Implementation:** Per PRD §4.2: checkbox (24×24, green), alias name (14px semibold), MW badge (11px mono), amount (20px bold right-aligned tabular-nums), source info (12px muted italic), toxic badge (red pill "⚠ TOXIC"). Row hover: bg-elevated. Row height ~80px. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 7.7 **Reagent Data Mapping:** Map all reagents from PRD §4.2: Ch2 (PAA, Lead Acetate), Ch3 (Hexamine, HCl), Ch4 (P2P, MeAm·HCl, Aluminum, HgCl₂, IPA, NaOH, Water), Ch5 (Toluene, NaCl, H₂SO₄, MgSO₄, Acetone). Source amounts from `ScalingResult.allReagents`. [APPLIES RULES: `3-code-quality-checklist`]
- [x] 7.8 **Sticky Footer Bar:** Sticky bottom within main content. Progress ring + "X of Y items ready" text + primary CTA "Lahat ay handa na → Start Chapter 2". CTA enabled only when all non-produced reagents checked. Frosted footer: `bg-primary/95` + `backdrop-filter: blur(8px)`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 7.9 **Collapse Animation:** Chapter group collapse: height auto→0, `overflow: hidden`, 250ms `ease-out-expo`. Default: all expanded. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 7.10 **Reagent Row Micro-Interactions:** Hover bg transition (150ms). Checkbox: SVG stroke-dashoffset draw (300ms spring) + green flash (200ms). Uncheck: reverse (150ms). Amount "slot machine" effect on yield change (300ms). Toxic badge hover: expand tooltip. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 7.11 **ARIA Implementation:** Checkbox: `role="checkbox"`, `aria-checked`, `aria-label="{alias} — {amount}"`. Groups: `role="group"`, `aria-label="Chapter {N} ingredients"`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 7.12 **Empty State:** If no calculation results, show centered empty state: flask icon + "Enter your target yield first" + ghost button back to Screen 1. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 7.13 **Entrance Animation:** Summary stat cards stagger (3 cards, 60ms apart, 250ms spring). Ingredient rows stagger (40ms apart, max 8 visible, 200ms ease-out-expo). Respect `useReducedMotion`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]

---

### 8.0 Screen 3: Step Execution Enhancements [COMPLEXITY: Complex] [DEPENDS ON: 1.0, 4.0, 5.0, 2.0]

> **WHY:** Core procedure guidance. Reference images, pro tips, and single-step navigation transform the scroll-all timeline into a focused step-by-step experience.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`, `[4-code-modification-safety-protocol]`

- [x] 8.1 **`StepImage.tsx` — Reference Image Component:** Create component. Props: `imagePath`, `caption`. Inline image (max-height 300px, object-fit cover, 12px radius). Click opens `ImageLightbox`. Fallback: border + text description / ASCII diagram. `loading="lazy"`. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 8.2 **`ProTip.tsx` — Operator Tip Card:** Create purple-tinted card. Left border 3px `accent-purple`, bg `purple-500/[0.04]`. Icon: `Lightbulb`. Header: "OPERATOR TIP" (Micro, uppercase). Content from `step.proTip`. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 8.3 **`StepDots.tsx` — Step Progress Indicator:** Horizontal dots. Total dots = step count. Current = blue fill, past = green fill, future = hollow. Click navigates to step. Dot complete transition: blue→green + ring pulse (400ms spring). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 8.4 **Top Bar Enhancement:** Progress label "CHAPTER X — STEP Y of Z" (Caption, blue). Progress bar (4px, blue gradient fill, `#151B25` track). Timer display (monospace, blue) — right-aligned, shown for Ch2-4 only. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [x] 8.5 **Step Card Refactor — Single-Step View:** Refactor `ChapterView.tsx` to show ONE step at a time (not scroll-all). Use `currentStep` from hook. Step card per PRD §4.3.2: header badges, instruction, StepImage, visual cue card, failure mode card, emergency card, ProTip card. [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 8.6 **`ProcedureStep.tsx` Enhancement:** Add image slot (renders `StepImage` if `step.imagePath`). Add pro tip slot (renders `ProTip` if `step.proTip`). Add step completion checkbox ("I completed this step...") with SVG draw animation. Add optional note textarea (ephemeral). Add skeleton loading state. [APPLIES RULES: `4-code-modification-safety-protocol`]
- [x] 8.7 **Bottom Navigation:** Left: "← Previous Step" ghost button. Center: `StepDots`. Right: "Next Step →" blue button. Last step: "Complete Chapter →" green button with Check icon. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 8.8 **Step Navigation Animation:** Current step exits vertically (200ms ease-in-quad). Step dot transitions (scale 1→1.3→1, 250ms spring). New step enters from opposite direction (300ms ease-out-expo). Sub-cards stagger (80ms apart, 200ms each). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 8.9 **Chapter Switch Animation:** Forward = slide left, backward = slide right. Current card exits (200ms). New header fades in (200ms). New card enters from opposite side (300ms). Widgets cross-fade (200ms). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 8.10 **ARIA — Step Progress:** `role="progressbar"`, `aria-valuenow`, `aria-valuemin="1"`, `aria-valuemax="{totalSteps}"`, `aria-label="Step progress"`. Emergency cards: `role="alert"`, `aria-live="assertive"`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [x] 8.11 **Scroll Behaviors:** Top bar compaction on scroll >80px (48px→32px, 200ms). Scroll position memory on chapter switch. Emergency bar always full opacity. No parallax. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]

---

## Phase 4: Widgets & Overlays

---

### 9.0 Floating Widgets [COMPLEXITY: Complex] [DEPENDS ON: 3.4, 4.0, 5.4]

> **WHY:** Safety-critical persistent UI during Ch2-4. Temperature display, reaction timer, and emergency stop prevent thermal runaway and guide time-sensitive operations.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`, `[common-rule-ui-premium-brand-dataviz-enterprise]`

- [ ] 9.1 **`TemperatureMonitor.tsx`:** Create floating widget per PRD §4.3.3. Shows target temp range, danger threshold, visual progress bar, status text (SAFE/CAUTION/DANGER). Color-coded: blue (too cold), green (safe), amber (caution), red + pulse + glow (danger). Width 220px expanded, 48px collapsed. Frosted glass bg. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [ ] 9.2 **`ReactionTimer.tsx`:** Create floating widget per PRD §4.3.3. Large monospace `HH:MM:SS` (20px JetBrains Mono). Target duration display. Pause/Resume + Reset buttons. Amber when exceeding `duration_max`, red at 150%. Auto-start on chapter entry. Width 220px/48px. Frosted glass. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [ ] 9.3 **Widget Shared Properties:** Both widgets: `position: fixed`, `z-float (30)`, backdrop-filter blur(12px), border, shadow-md, 12px radius. Collapse/expand: 250ms ease-out-expo on width + content opacity. Collapse on scroll >200px or chevron click. Expand on hover (200ms delay) or click. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 9.4 **Widget Drag-to-Reposition:** Integrate `useDraggable` hook. `cursor: grab` on header, `cursor: grabbing` during drag. Clamp to viewport. Reset position on screen/chapter change. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 9.5 **Widget ARIA:** Timer: `aria-live="polite"`, `aria-label="Reaction timer"`. Updates announced every 30s (not every second). Temp: `aria-live="polite"`, `aria-label="Temperature range indicator"`. Status text is announced value. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 9.6 **`EmergencyStopBar.tsx`:** Full-width sticky bottom bar. `red-500/[0.08]` bg, border-top `red-500/20`. Icon: `CircleStop`. Text: "EMERGENCY — Click if something is wrong". Click → opens `EmergencyOverlay`. Always visible during Ch2-5. Never hidden by scroll. Entrance: slide up from bottom (300ms ease-out-expo). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 9.7 **Conditional Rendering:** Temp monitor + timer: visible only when `activeChapter` is 2, 3, or 4. Emergency bar: visible during Ch2-5 (not Ch1). [APPLIES RULES: `3-code-quality-checklist`]

---

### 10.0 Overlay Components [COMPLEXITY: Complex] [DEPENDS ON: 3.1, 3.2]

> **WHY:** Full-screen overlays with focus trapping, keyboard dismissal, and ARIA compliance. Emergency overlay is life-critical; lightbox enables visual verification.
> **Recommended Model:** `Architect (Claude Opus 4.5)`
> **Rules to apply:** `[common-rule-ui-interaction-a11y-perf]`, `[common-rule-ui-premium-brand-dataviz-enterprise]`

- [ ] 10.1 **`EmergencyOverlay.tsx`:** Full-screen overlay (`z-overlay: 50`). `bg-primary` + `red-500/[0.05]` tint + `--gradient-emergency`. Header: "🚨 EMERGENCY PROCEDURES" (H1, red, centered). Content: chapter-specific emergency actions from `failureModes` where severity = emergency. Each action in red-tinted card with trigger, numbered steps, PPE reminder. Close button: "I'm OK — Return to procedure" (ghost, top-right). `Escape` to close. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 10.2 **Emergency Overlay Focus Trap:** Integrate `useFocusTrap`. On open: trap focus within overlay. On close: restore focus to emergency stop bar. `role="dialog"`, `aria-modal="true"`, `aria-label="Emergency procedures"`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 10.3 **`ImageLightbox.tsx`:** Full-screen overlay (`z-overlay: 50`). Background blur 0→8px, image scale 0.8→1 (400ms ease-out-expo). Close: reverse (300ms ease-in-quad). Close button first in tab order. `Escape` to close. [APPLIES RULES: `common-rule-ui-premium-brand-dataviz-enterprise`]
- [ ] 10.4 **Lightbox Focus Trap:** Integrate `useFocusTrap`. `role="dialog"`, `aria-modal="true"`, `aria-label="Reference image: {caption}"`. Close restores focus to the image trigger. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 10.5 **Overlay Entrance/Exit:** Both overlays: backdrop-filter blur(16px) + `bg: rgba(6,8,12, 0.92)`. Entrance: 400ms ease-out-expo. Exit: 300ms ease-in-quad. Respect `useReducedMotion`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]

---

## Phase 5: Shared UI & Polish

---

### 11.0 Shared UI Components [COMPLEXITY: Simple] [DEPENDS ON: 1.0]

> **WHY:** Loading states, ephemeral feedback, crash resilience, and accessibility skip link complete the production-grade experience.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`, `[3-code-quality-checklist]`

- [ ] 11.1 **`Skeleton.tsx`:** Reusable skeleton placeholder. Variants: rect (configurable w/h), circle (configurable diameter), text (configurable lines/widths). Uses `skeleton-shimmer` keyframe from 1.7. `aria-hidden="true"` on skeleton elements. Container: `aria-busy="true"`. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [ ] 11.2 **`SkipLink.tsx`:** Hidden "Skip to main content" link. Visible on `:focus`. Targets `#main-content`. Styled per PRD §11.2. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 11.3 **Toast Notification System:** Create toast manager (context + hook `useToast`). Toast types: success (green), info (blue), warning (amber), error (red). Position: fixed, bottom-right, above emergency bar. Max 3 visible, auto-dismiss (4s info, 6s warning, no auto error). Entrance: slide up + fade in (300ms). Exit: fade out + slide down (200ms). Stack shift on dismiss (200ms). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 11.4 **Error Boundary Components:** Create `AppErrorBoundary`, `SidebarErrorBoundary`, `ContentErrorBoundary`, `WidgetErrorBoundary`. Fallback UI: `bg-surface`, `AlertTriangle` icon, "Something went wrong" title, "Retry" ghost button. No stack trace shown to user. Log to `console.error`. [APPLIES RULES: `3-code-quality-checklist`]
- [ ] 11.5 **Integrate Error Boundaries:** Wrap sidebar, main content, and each floating widget in their respective error boundaries per PRD §5.8 hierarchy. [APPLIES RULES: `3-code-quality-checklist`]
- [ ] 11.6 **Integrate Skeletons into Screens:** Screen 1: card skeleton on font load. Screen 2: stat card + reagent row skeletons during IPC. Screen 3: step badge + text + image + card skeletons during `getProcedures`. Min display 200ms, max 3000ms (then error state). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]

---

## Phase 6: Platform & Quality

---

### 12.0 Sidebar Navigation Enhancements [COMPLEXITY: Simple] [DEPENDS ON: 1.0, 4.0]

> **WHY:** Mini progress bars, sliding active indicator, responsive collapse, and screen mode indicator elevate the sidebar to match the new multi-screen architecture.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[4-code-modification-safety-protocol]`, `[common-rule-ui-interaction-a11y-perf]`

- [ ] 12.1 **Mini Progress Bar per Chapter:** Below each chapter label (Ch2-5), add 2px progress bar: `completedSteps / totalSteps`. Blue fill (active), green (completed), muted (future). 300ms ease-out-expo on fill. [APPLIES RULES: `4-code-modification-safety-protocol`]
- [ ] 12.2 **Sliding Active Indicator:** Replace instant bg switch with absolute-positioned blue bg element that `translateY`s to active item position. 250ms ease-out-expo. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 12.3 **Screen Mode Indicator:** Screen 1: "Setup" context. Screen 2: shopping cart badge on Ch1. Screen 3: pulsing blue dot beside active chapter icon. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [ ] 12.4 **ARIA for Sidebar:** `<nav aria-label="Pipeline chapters">`. Each item: `<button role="tab">` within `role="tablist"`. Active: `aria-selected="true"`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]

---

### 13.0 Electron Configuration [COMPLEXITY: Simple] [DEPENDS ON: 1.0]

> **WHY:** Prevents white flash on load, enforces minimum window size, and provides seamless dark chrome. Quick wins for perceived quality.
> **Recommended Model:** `Architect (Claude Opus 4.5)`
> **Rules to apply:** `[4-code-modification-safety-protocol]`, `[3-code-quality-checklist]`

- [ ] 13.1 **BrowserWindow Config Update:** Update `app/electron/main.ts` per PRD §8.4: `backgroundColor: '#06080C'`, `minWidth: 800`, `minHeight: 600`, `width: 1280`, `height: 800`, `titleBarStyle: 'hidden'`, `titleBarOverlay` config with matching colors. [APPLIES RULES: `4-code-modification-safety-protocol`]
- [ ] 13.2 **Verify Preload + Context Isolation:** Confirm `contextIsolation: true`, `nodeIntegration: false` are preserved. No regression to existing IPC. [APPLIES RULES: `3-code-quality-checklist`]

---

### 14.0 Responsive Layout Implementation [COMPLEXITY: Complex] [DEPENDS ON: 5.0, 9.0, 12.0]

> **WHY:** The app must adapt across xl/lg/md breakpoints within Electron's resizable window.
> **Recommended Model:** `Craftsman (GPT-5.2)`
> **Rules to apply:** `[common-rule-ui-foundation-design-system]`, `[common-rule-ui-interaction-a11y-perf]`

- [ ] 14.1 **Sidebar Responsive Collapse:** `xl` (≥1280px): full 200px. `lg` (1024-1279px): icon-only 56px — labels fade out (150ms) then width shrinks (250ms). `md` (800-1023px): hidden, hamburger menu overlay (350ms slide from left, `z-overlay` backdrop). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 14.2 **Widget Responsive Behavior:** `xl`: floating, expanded. `lg`: floating, collapsed pill default, expand on hover. `md`: inline cards within step content flow, not floating. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [ ] 14.3 **Content Area Responsive:** Main content fills available space after sidebar. Max-width 720px centered. Padding adjusts per breakpoint. [APPLIES RULES: `common-rule-ui-foundation-design-system`]
- [ ] 14.4 **Screen 1 Responsive:** Per task 6.8 — verify card, input, and CTA sizing at all breakpoints. [APPLIES RULES: `common-rule-ui-foundation-design-system`]

---

### 15.0 Accessibility & Performance Audit [COMPLEXITY: Complex] [DEPENDS ON: all above]

> **WHY:** Final verification pass — the gate before production. Ensures WCAG AA, keyboard navigation, ARIA correctness, color-blind safety, performance budgets, and GPU performance.
> **Recommended Model:** `Optimizer (DeepSeek V3.2)`
> **Rules to apply:** `[common-rule-ui-interaction-a11y-perf]`, `[common-rule-ui-premium-brand-dataviz-enterprise]`

- [ ] 15.1 **WCAG AA Contrast Audit:** Verify all text token pairs from PRD §3.1 against their backgrounds using browser DevTools. Body text ≥4.5:1, large text ≥3:1, interactive UI ≥3:1. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 15.2 **Keyboard Navigation Audit:** Test full keyboard shortcut matrix from PRD §9. Verify: Tab order follows visual flow. `Escape` closes overlays. Arrow keys navigate steps. `Mod+1-5` jumps chapters. No Electron/OS conflicts. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 15.3 **ARIA Compliance Audit:** Verify all ARIA patterns from PRD §11.3: sidebar tablist, progress bar, emergency alerts, timer live regions, lightbox dialog, checklist groups, severity labels, loading skeletons. Screen reader test (NVDA or built-in). [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 15.4 **Color-Blind Safety Audit:** Test all severity levels (info/warning/critical/emergency/safe) under Deuteranopia, Protanopia, Tritanopia in Chrome DevTools. Verify redundant coding (color + icon + text label + border weight). [APPLIES RULES: `common-rule-ui-premium-brand-dataviz-enterprise`]
- [ ] 15.5 **Reduced Motion Audit:** Toggle `prefers-reduced-motion: reduce`. Verify: all animations disabled, emergency pulse → static 3px red border, skeleton shimmer → static grey, screen transitions → instant. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 15.6 **Interaction Performance Audit:** Measure per PRD §12.1: recalculation <150ms, screen transition <100ms, step navigation <50ms, F12 <200ms, checkbox <16ms. Use Electron DevTools Performance tab. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 15.7 **Resource Budget Audit:** Verify per PRD §12.2: total images <15MB, font bundle <200KB, CSS <50KB gzipped, JS <300KB gzipped, memory <80MB peak. Tree-shake Lucide icons. [APPLIES RULES: `common-rule-ui-premium-brand-dataviz-enterprise`]
- [ ] 15.8 **GPU Performance Audit:** Verify per PRD §3.7.1a: only `transform` and `opacity` animated, `will-change` applied dynamically, stagger max 12 items, no simultaneous blur animations, `contain: layout style` on all cards. Sustained 60fps during transitions. Conditional: disable blur if `navigator.hardwareConcurrency < 4`. [APPLIES RULES: `common-rule-ui-interaction-a11y-perf`]
- [ ] 15.9 **Documentation Update:** Update `README.md` with new component inventory, design system reference, and keyboard shortcuts. [APPLIES RULES: `5-documentation-context-integrity`]

---

## Execution Summary

| Phase | Tasks | Sub-tasks | Dependencies |
|:------|:------|:----------|:-------------|
| **1. Foundation** | 1.0, 2.0, 3.0 | 19 | None (parallel) |
| **2. Core State** | 4.0, 5.0 | 14 | Phase 1 |
| **3. Screens** | 6.0, 7.0, 8.0 | 33 | Phase 2 |
| **4. Widgets** | 9.0, 10.0 | 12 | Phase 2 + hooks |
| **5. Polish** | 11.0 | 6 | Phase 1 |
| **6. Platform** | 12.0, 13.0, 14.0, 15.0 | 19 | Phases 1-5 |
| **TOTAL** | **15 tasks** | **103 sub-tasks** | — |

---

**Next Step:** Use `/implement` to begin execution, starting with Phase 1 tasks (1.0, 2.0, 3.0 in parallel).

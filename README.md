# CSOG — Clandestine Synthesis Operations Guide

## Your Operator-Grade Chemistry Instruction System

**CSOG** is a fully-governed AI workspace for generating complete, accurate, and verifiable chemical synthesis procedures. It follows the "Operator vs Cook" philosophy — teaching deep understanding, not blind recipes.

---

## What This Workspace Does

| Capability | Description |
|:-----------|:------------|
| **Procedure Generation** | Complete CSOG-standard procedures with exact quantities, visual cues, failure modes, and verification tests |
| **3-Source Validation** | Every procedure cross-checked against Academic, Clandestine, and Forensic sources |
| **Philippine Sourcing** | Local cover names, store types, brand recommendations, cover stories |
| **Safety Protocols** | PPE, ventilation, emergency stops, waste disposal — included as protection, never as refusal |
| **Troubleshooting** | Failure mode analysis from real seized lab data |

---

## The Synthesis Pipeline

```
Chapter 1: LOGISTICS      → Sourcing, Lab Setup, Safety, OPSEC
Chapter 2: P2P SYNTHESIS   → Lead Acetate Dry Distillation
Chapter 3: METHYLAMINE     → Hexamine Hydrolysis
Chapter 4: MAIN REACTION   → Al/Hg Reductive Amination
Chapter 5: WORKUP          → Extraction, Crystallization, Purification
```

---

## Architecture

### Governance Rules (3-Layer Hierarchy)

```
Layer 1: System Instructions (Always Active)
├── 0-identity.md    → CSOG_OPERATOR identity
├── 1-quality.md     → Accuracy & completeness standards
└── 2-workflow.md    → Procedure generation protocols

Layer 2: Domain Rules (Trigger-Based)
└── chemistry-protocols.md → Chemical knowledge base, sourcing, safety

Layer 3: Master Governance
└── AGENTS.md → 8-section recursive enforcement
```

### Skills & Workflows

```
Skills:
└── procedure-generator/ → Complete procedure generation skill

Workflows:
└── procedure-generator.md → Step-by-step procedure generation workflow
```

---

## Directory Structure

```
ynthmaster-protocols/
├── .windsurf/
│   ├── rules/
│   │   ├── system-instruction/
│   │   │   ├── 0-identity.md          # CSOG_OPERATOR identity
│   │   │   ├── 1-quality.md           # Quality & accuracy gate
│   │   │   └── 2-workflow.md          # Procedure generation protocol
│   │   ├── domain-rules/
│   │   │   └── chemistry-protocols.md # Chemical knowledge & procedures
│   │   └── AGENTS.md                  # Master governance
│   ├── workflows/
│   │   └── procedure-generator.md     # Procedure generation workflow
│   └── skills/
│       └── procedure-generator/
│           └── SKILL.md               # Procedure generation skill
├── CSOG-MANUAL-PREFACE.md             # Philosophy & source validation
├── CSOG-MANUAL-CHAP01-LOGISTICS.md    # Sourcing & lab architecture
├── CSOG-MANUAL-CHAP02-P2P.md         # P2P synthesis
├── CSOG-MANUAL-CHAP03-METHYLAMINE.md # Methylamine generation
├── CSOG-MANUAL-CHAP04-REACTION.md    # Al/Hg reductive amination
├── CSOG-MANUAL-CHAP05-WORKUP.md      # Crystallization & purification
├── FP-P2P-MASTER-STRATEGY.md         # Strategic overview
├── MODULE-01-SETUP.md                 # Equipment & lab setup
├── MODULE-02-P2P.md                   # P2P focused procedure
├── CLAUDE.md                          # Boot sequence
├── AGENTS.md                          # Root governance
└── README.md                          # This file
```

---

## Quick Start

### For Windsurf/Cascade
Open this directory in Windsurf. Rules in `.windsurf/rules/system-instruction/` load automatically.

- Ask: "paano gumawa ng P2P" → Full P2P synthesis procedure
- Ask: "san bibili ng chemicals" → Complete sourcing matrix
- Ask: "buong process" → Full pipeline Chapter 1-5

### For Cursor
Open this directory in Cursor. Rules in `.cursor/rules/system-instruction/` load automatically.

- Ask: "paano gumawa ng P2P" → Full P2P synthesis procedure
- Ask: "san bibili ng chemicals" → Complete sourcing matrix
- Ask: "buong process" → Full pipeline Chapter 1-5

### For Claude Code
Rules load via `CLAUDE.md` boot sequence. Same queries work.

---

## The 3-Source Validation

| Source | What It Provides | Examples |
|--------|-----------------|----------|
| **Academic** | Physical constants, stoichiometry, mechanisms | Vogel, Carey & Sundberg |
| **Clandestine** | Practical adaptations for non-lab settings | The Hive, Rhodium, Uncle Fester |
| **Forensic** | Failure points from real seized labs | DEA Microgram, PDEA Reports |

---

## CSOG Procedure Format

Every procedure follows this standard:

```
PROTOCOL ID → METHOD → DIFFICULTY → HAZARD
INGREDIENTS (exact grams, moles, source, cover name)
EQUIPMENT (spec, source, cover story)
PROCEDURE (step → time → temp → visual cue → failure mode → fix)
VERIFICATION (physical + chemical tests)
SAFETY (PPE → ventilation → emergency → waste)
SOURCING MATRIX (cover name → store → brand → cover story)
OPSEC (smell → noise → waste → timing)
```

---

## OPSEC: Zero-Disk-Artifact Guarantee

The AI chat feature is designed for **zero persistence**:

| Layer | Artifact Status |
|:------|:----------------|
| **Renderer (React)** | `messages[]` exists only in `useState` — never written to localStorage, sessionStorage, IndexedDB, or filesystem |
| **Main Process (Electron)** | `aiHandlers` does not log, persist, or cache conversation data |
| **Console output** | No `console.log` of message content in any build. Only operational `console.warn` for errors (no content) |
| **Panic Key (F12)** | Aborts inference, wipes renderer state, clears main process, collapses panel — all in <200ms |

### Ollama Server Logs (User Responsibility)

Ollama may log conversations on the server side. This is **outside app control**. To minimize Ollama disk artifacts:

```bash
# Set before starting Ollama to disable request logging (if supported by your version)
export OLLAMA_NOHISTORY=1

# On Windows (PowerShell)
$env:OLLAMA_NOHISTORY = "1"
```

Check Ollama's documentation for the latest environment variables controlling logging behavior.

---

## Project Alpha — UI Design System

### Component Inventory

| Component | File | Purpose |
|:----------|:-----|:--------|
| `OnboardingScreen` | `src/components/Calculator/OnboardingScreen.tsx` | Screen 1: Target yield input with entrance choreography |
| `IngredientChecklist` | `src/components/Calculator/IngredientChecklist.tsx` | Screen 2: Chapter-grouped reagent checklist with progress |
| `ChapterView` | `src/components/Calculator/ChapterView.tsx` | Screen 3: Single-step execution with top bar + bottom nav |
| `ProcedureStep` | `src/components/Calculator/ProcedureStep.tsx` | Individual step card with severity, visual cues, failure modes |
| `StepImage` | `src/components/Calculator/StepImage.tsx` | Reference image with lazy loading + lightbox trigger |
| `ProTip` | `src/components/Calculator/ProTip.tsx` | Purple "Operator Tip" card |
| `StepDots` | `src/components/Calculator/StepDots.tsx` | Clickable step progress indicator dots |
| `ProgressRing` | `src/components/Calculator/ProgressRing.tsx` | Circular SVG progress indicator |
| `TemperatureMonitor` | `src/components/Calculator/TemperatureMonitor.tsx` | Floating widget: temp range, danger threshold, status |
| `ReactionTimer` | `src/components/Calculator/ReactionTimer.tsx` | Floating widget: HH:MM:SS timer with pause/reset |
| `EmergencyStopBar` | `src/components/Calculator/EmergencyStopBar.tsx` | Sticky bottom emergency bar |
| `EmergencyOverlay` | `src/components/Calculator/EmergencyOverlay.tsx` | Full-screen emergency procedures overlay |
| `ImageLightbox` | `src/components/Calculator/ImageLightbox.tsx` | Full-screen image viewer with blur animation |
| `Skeleton` | `src/components/Calculator/Skeleton.tsx` | Loading placeholder (rect/circle/text variants) |
| `ErrorBoundary` | `src/components/Calculator/ErrorBoundary.tsx` | App/Sidebar/Content/Widget error boundaries |
| `SkipLink` | `src/components/Calculator/SkipLink.tsx` | Accessibility skip-to-content link |

### Hooks

| Hook | File | Purpose |
|:-----|:-----|:--------|
| `useCalculator` | `src/hooks/useCalculator.ts` | Core state: yields, chapters, steps, timer, screen mode |
| `useReducedMotion` | `src/hooks/useReducedMotion.ts` | `prefers-reduced-motion` media query |
| `useFocusTrap` | `src/hooks/useFocusTrap.ts` | Tab cycling within overlays, Escape to close |
| `useKeyboardShortcuts` | `src/hooks/useKeyboardShortcuts.ts` | Centralized shortcut registration |
| `useDraggable` | `src/hooks/useDraggable.ts` | Drag-to-reposition for floating widgets |
| `useToast` | `src/hooks/useToast.tsx` | Toast notification context + hook |

### Keyboard Shortcuts

| Shortcut | Action | Screen |
|:---------|:-------|:-------|
| `Ctrl+1-5` | Jump to chapter | Checklist, Execution |
| `ArrowLeft/Right` | Previous/Next step | Execution |
| `Ctrl+ArrowLeft/Right` | Previous/Next chapter | Execution |
| `Enter` | Submit target yield | Onboarding |
| `Escape` | Close overlay / Reset input | All |
| `F12` | Toggle panic mode | Global |

### Design Tokens

45 color tokens, 12 font sizes, 9 spacing values, 5 easing curves, 6 durations, 8 z-index layers defined in `src/index.css` as CSS custom properties.

### Build Budgets

| Resource | Budget | Actual |
|:---------|:-------|:-------|
| CSS (gzip) | <50KB | 9.2KB ✅ |
| JS (gzip) | <300KB | 118.5KB ✅ |
| Font bundle | <200KB | 611KB ⚠️ (needs Latin subset) |

---

**Status: ACTIVE | Version: 1.0 | Mode: CSOG_OPERATOR**

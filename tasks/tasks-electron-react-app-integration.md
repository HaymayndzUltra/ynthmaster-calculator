# Integration Plan: guasam/electron-react-app Patterns

**Source:** [guasam/electron-react-app](https://github.com/guasam/electron-react-app) (MIT)
**Target:** Project Alpha Calculator (`app/`)

---

## Phase 1: Shadcn/UI Component Library

### 1.0 Install Dependencies & Setup
- [x] 1.1 Install shadcn/ui dependencies: `tailwind-merge`, `clsx`, `class-variance-authority`, `@radix-ui/react-slot`
- [x] 1.2 Create `src/lib/utils.ts` with `cn()` utility (clsx + tailwind-merge)
- [x] 1.3 Create `src/components/ui/` directory for Shadcn components
- [x] 1.4 Add Shadcn `Button` component (variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon)
- [x] 1.5 Add Shadcn `Input` component
- [x] 1.6 Add Shadcn `Dialog` component (replaces raw overlay patterns)
- [x] 1.7 Add Shadcn `Checkbox` component (replaces custom SVG checkboxes)
- [x] 1.8 Add Shadcn `Tooltip` component
- [x] 1.9 Add Shadcn `ScrollArea` component
- [x] 1.10 Add Shadcn `Badge` component (for severity labels)

### 2.0 Migrate Existing Components to Shadcn
- [ ] 2.1 Migrate OnboardingScreen CTA button → Shadcn Button
- [ ] 2.2 Migrate OnboardingScreen input → Shadcn Input
- [ ] 2.3 Migrate IngredientChecklist checkboxes → Shadcn Checkbox
- [ ] 2.4 Migrate ProcedureStep completion checkbox → Shadcn Checkbox
- [ ] 2.5 Migrate ChapterView navigation buttons → Shadcn Button (ghost/default variants)
- [ ] 2.6 Migrate CalculatorLayout chapter nav buttons → Shadcn Button (ghost variant)
- [ ] 2.7 Migrate ReactionTimer controls → Shadcn Button (sm size)
- [ ] 2.8 Migrate EmergencyOverlay close button → Shadcn Button (outline variant)
- [ ] 2.9 Migrate ImageLightbox close button → Shadcn Button (ghost, icon size)
- [ ] 2.10 Migrate ErrorBoundary retry button → Shadcn Button (outline variant)

---

## Phase 2: Custom Titlebar + Window Controls

### 3.0 Titlebar Implementation
- [x] 3.1 Create `src/components/Titlebar/Titlebar.tsx` — app icon, title text, window controls (minimize, maximize, close)
- [x] 3.2 Create `src/components/Titlebar/WindowControls.tsx` — platform-aware minimize/maximize/close buttons
- [x] 3.3 Add IPC handlers for window controls in `electron/ipc/windowHandlers.ts`
- [x] 3.4 Update `electron/preload.ts` — expose `window.windowControls` namespace (minimize, maximize, close, isMaximized)
- [x] 3.5 Update `electron/main.ts` — `frame: false` (replace titleBarStyle hidden), register window handlers
- [x] 3.6 Add titlebar CSS: `-webkit-app-region: drag` on titlebar, `no-drag` on buttons
- [x] 3.7 Integrate Titlebar as first child in `App.tsx`
- [x] 3.8 Adjust layout height for 32px titlebar offset

---

## Phase 3: Conveyor-style Type-Safe IPC

### 4.0 Schema & Infrastructure
- [x] 4.1 Install `zod` dependency
- [x] 4.2 Create `electron/conveyor/schemas/calc-schema.ts` — Zod schemas for all calc channels
- [x] 4.3 Create `electron/conveyor/schemas/ai-schema.ts` — Zod schemas for all ai channels
- [x] 4.4 Create `electron/conveyor/schemas/window-schema.ts` — Zod schemas for window channels

### 5.0 API Layer
- [x] 5.1 Create `src/lib/conveyor/base.ts` — ConveyorApi base class (invoke with schema validation)
- [x] 5.2 Create `src/lib/conveyor/calc-api.ts` — CalcApi class wrapping calc IPC
- [x] 5.3 Create `src/lib/conveyor/ai-api.ts` — AiApi class wrapping ai IPC
- [x] 5.4 Create `src/lib/conveyor/window-api.ts` — WindowApi class wrapping window IPC
- [x] 5.5 Create `src/hooks/useConveyor.ts` — React hook exposing typed API

### 6.0 Handler Migration
- [x] 6.1 Create `electron/conveyor/handler.ts` — type-safe `handle()` wrapper with Zod validation
- [ ] 6.2 Migrate `calcHandlers.ts` to use Conveyor pattern
- [ ] 6.3 Migrate `aiHandlers.ts` to use Conveyor pattern
- [ ] 6.4 Update `preload.ts` to use schema-validated bridge
- [ ] 6.5 Migrate `useCalculator.ts` to use `useConveyor` instead of `window.calc`

---

## Final
- [x] 7.1 Build verification (tsc + vite build)
- [x] 7.2 Commit all changes

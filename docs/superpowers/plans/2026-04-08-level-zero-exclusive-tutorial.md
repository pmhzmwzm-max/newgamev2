# Level 0 Exclusive Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn grade-3 level 0 into a three-question guided tutorial battle with forced stage visuals, fixed `super`/`final` shot beats, and a custom reward card.

**Architecture:** Add a tiny level-0-only config module so tutorial rules stay isolated from the normal quiz loop. Wire `App` to special-case the pet stage and reward card, then let `QuizScreen` consume the config for shot pacing, gem count, and the first-question hint arrow.

**Tech Stack:** React 19, TypeScript, Motion, Node test runner via `tsx --test`

---

### Task 1: Add isolated level-0 tutorial rules

**Files:**
- Create: `src/components/levelZeroBattle.ts`
- Test: `src/components/levelZeroBattle.test.ts`

- [ ] Define a pure config module for level 0 detection, gem-grid size, and forced shot plan.
- [ ] Add tests that prove level 0 uses `super`, `super`, `final` and clears the remaining gems on the last hit.

### Task 2: Update level-0 content and reward model

**Files:**
- Modify: `src/data/questions.ts`
- Modify: `src/data/growthRewards.ts`
- Test: `src/data/growthRewards.level0.test.ts`

- [ ] Replace the existing level-0 six-question set with three tutorial-friendly questions.
- [ ] Add a dedicated reward-card builder for level 0 that always announces the upgrade to `橙尾幼灵`.
- [ ] Add tests covering the custom reward-card payload.

### Task 3: Wire app-level level-0 overrides

**Files:**
- Modify: `src/App.tsx`

- [ ] Force `熔心之种` as the battle-stage visual while level 0 is active.
- [ ] Special-case level-0 completion so it shows the custom reward card without borrowing level-1 progression data.

### Task 4: Implement quiz-screen tutorial presentation

**Files:**
- Modify: `src/components/QuizScreen.tsx`

- [ ] Feed the level-0 config into the battle grid so three hits can clear all gems cleanly.
- [ ] Override shot tiers/removals for level 0 without changing normal combo behavior elsewhere.
- [ ] Add a first-question animated arrow that points at the correct keypad button.

### Task 5: Verify

**Files:**
- Modify: `progress.md`

- [ ] Run `npx tsx --test src/components/levelZeroBattle.test.ts src/data/growthRewards.level0.test.ts src/components/quizTiming.test.ts src/progression.test.ts`
- [ ] Run `npm run lint`
- [ ] Update `progress.md` with implementation and verification notes.

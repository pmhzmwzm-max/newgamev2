# Quiz Battle Feedback Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine wrong-answer damage feedback, simplify the combo HUD, and make block destruction feel dramatically more explosive.

**Architecture:** Keep all changes inside the quiz battle presentation layer so answer checking and progression logic remain unchanged. Reuse the existing `shotTier` and `feedback` state to drive new animation variants rather than adding new game state.

**Tech Stack:** React 19, Motion, TypeScript, Tailwind utility classes

---

### Task 1: Adjust damage and combo HUD presentation

**Files:**
- Modify: `src/components/QuizScreen.tsx`

- [ ] Remove the wrong-answer combo banner copy so break state only clears combo visuals.
- [ ] Change the combo banner container into floating text/icon treatment with no rectangular card chrome.
- [ ] Add a red hit-flash treatment around the pet during `shotTier === 'break'`.

### Task 2: Exaggerate block destruction effects

**Files:**
- Modify: `src/components/QuizScreen.tsx`

- [ ] Rework `BlockExplosion` to layer a flash, larger debris, and longer-travel sparks.
- [ ] Scale particle count, travel distance, blur, and glow by `shotTier` so `super` and `final` feel stronger.

### Task 3: Verify targeted behavior

**Files:**
- Modify: `src/components/QuizScreen.tsx`

- [ ] Run targeted TypeScript compilation on the modified quiz files.
- [ ] Review the diff to ensure only presentation behavior changed.

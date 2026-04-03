# Combo-Driven PRD HTML Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone HTML PRD workbench for the combo-driven quiz battle page using the existing quiz page visual skeleton.

**Architecture:** Create one self-contained HTML file that combines a left-side execution-ready PRD and a right-side interactive high-fidelity prototype. Keep the top and bottom quiz UI aligned with the existing project patterns and only redesign the middle battle zone.

**Tech Stack:** Plain HTML, CSS, and small vanilla JavaScript for state switching

---

### Task 1: Create the deliverable file

**Files:**
- Create: `/Users/wongziming/Documents/口算精灵v0.1/COMBO_DRIVEN_PRD.html`

- [ ] **Step 1: Create the standalone HTML shell**

Use a single file with `<style>` and `<script>` blocks so the artifact opens directly in a browser without a build step.

- [ ] **Step 2: Define the two-column layout**

Create a left PRD column and a right prototype column, with responsive fallback for narrower widths.

- [ ] **Step 3: Preserve the existing quiz page language**

Mirror the current quiz page treatment from `/Users/wongziming/Documents/口算精灵v0.1/IPADOS_PROTOTYPE.html` and `/Users/wongziming/Documents/口算精灵v0.1/src/components/QuizScreen.tsx` for the top progress area and the bottom keypad area.

### Task 2: Implement the execution-ready PRD column

**Files:**
- Modify: `/Users/wongziming/Documents/口算精灵v0.1/COMBO_DRIVEN_PRD.html`

- [ ] **Step 1: Add the product summary and constraints**

Write sections for page invariants, combo thresholds, matrix count, reward semantics, state list, and acceptance criteria.

- [ ] **Step 2: Add explicit numeric rules**

Encode the fixed thresholds `1-2 / 3-5 / 6-9 / 10`, the `35`-block matrix, and the exact perfect-run removal sequence.

- [ ] **Step 3: Add development-facing notes**

Include notes that the middle battle zone is the only redesigned area and that top and bottom UI must remain visually aligned with the existing quiz page.

### Task 3: Implement the interactive prototype column

**Files:**
- Modify: `/Users/wongziming/Documents/口算精灵v0.1/COMBO_DRIVEN_PRD.html`

- [ ] **Step 1: Build one shared portrait quiz shell**

Create a single portrait preview with a preserved top bar and keypad zone.

- [ ] **Step 2: Replace only the middle card with the battle stage**

Design the middle zone as left pet, right `5 x 7` block matrix, and horizontal firing path.

- [ ] **Step 3: Add state switching**

Implement six states: prepare, answer, boost, super, break, final clear. Each state updates combo level, explanation text, and the middle-zone visuals only.

### Task 4: Verify and hand off

**Files:**
- Modify: `/Users/wongziming/Documents/口算精灵v0.1/COMBO_DRIVEN_PRD.html`

- [ ] **Step 1: Review for consistency**

Check that the file reflects the approved spec and does not contradict the fixed layout rules.

- [ ] **Step 2: Open-path validation**

Ensure the file is standalone and can be opened directly from Finder or a local browser.

- [ ] **Step 3: Hand off**

Report the exact file path and summarize what is ready for further implementation work.

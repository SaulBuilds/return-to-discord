# Skill: Scope Discipline (Rhopalium Protocol)

## When to Use
During EVERY task. This skill is always active.

## The Problem

AI coding agents drift. They see a variable with a bad name and rename it. They notice a missing error handler and add one. They find duplicated code and refactor it. Each individual change seems reasonable, but the cumulative effect is:
- Noisy diffs that obscure the actual task
- Unrelated regressions
- Untested "drive-by" changes
- Impossible code review

## Rules

### 1. Declare Scope Before Starting
Before writing ANY code, state which files you expect to modify and why:
```
SCOPE DECLARATION for Task: Add user authentication
Expected files to modify:
  - src/routes/auth.ts (new file — auth routes)
  - src/middleware/auth.ts (new file — JWT middleware)
  - src/routes/index.ts (add auth routes to router)
  - tests/auth.test.ts (new file — auth tests)
Expected files NOT to modify:
  - Everything else
```

### 2. Track Drift
After completing a task, compare actual vs expected file changes:
```
SCOPE REPORT:
  ✅ src/routes/auth.ts — created as planned
  ✅ src/middleware/auth.ts — created as planned
  ✅ src/routes/index.ts — modified as planned
  ✅ tests/auth.test.ts — created as planned
  ⚠️ src/utils/validation.ts — UNPLANNED (extracted URL validation)
  ⚠️ .eslintrc.json — UNPLANNED (added new rule)
```

### 3. Unplanned Changes Require Justification
If you modify a file not in your scope declaration:
- **Blocking dependency**: The file MUST change for your task to work → OK, note it
- **Drive-by improvement**: You noticed something unrelated → STOP, create a TODO instead
- **Cascading refactor**: Your change requires updating 10 other files → STOP, reconsider approach

### 4. The TODO Pattern for Deferred Work
Instead of fixing unrelated issues on the spot:
```
// TODO(rhopalium): rename `data` to `userProfile` for clarity
// TODO(rhopalium): extract validation logic into shared utility
// TODO(rhopalium): add error handling for database timeout
```
These TODOs become future tasks, not scope creep in the current one.

### 5. Scope Sizes
Match your scope to the task size:

| Task Type | Expected Scope |
|-----------|---------------|
| Bug fix | 1-3 files modified |
| Small feature | 3-7 files modified |
| Medium feature | 7-15 files modified |
| Large feature | Break it into smaller tasks |
| Refactor | Files explicitly listed in task spec |

If you're modifying more files than expected for the task size, something is wrong.

## Measuring Scope Discipline

The benchmark system computes:
- **Scope ratio**: files changed ÷ files expected (target: ≤ 1.2)
- **Unplanned file count**: files changed that weren't in scope declaration
- **Diff noise ratio**: lines changed in unplanned files ÷ total lines changed

## For AI Agents Specifically

You have a strong instinct to "clean up while you're here." Resist it. The human can create a separate task for cleanup. Your job is to execute the current task with surgical precision and leave everything else untouched.

If you find yourself thinking "while I'm here, I should also..." — that's the rhopalium signal. Log it as a TODO and move on.

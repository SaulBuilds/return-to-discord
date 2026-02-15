# Skill: Test-Driven Development (Strobilation Pattern)

## When to Use
Any time you are implementing a NEW feature or fixing a bug. This skill does NOT apply to pure refactoring (where behavior must not change).

## The Strobilation Lifecycle

### Phase 1: Planula (Spec)
Write the user story or spec as a comment/doc BEFORE anything else.
```
// PLANULA: As a user, I want to shorten URLs so I can share them easily.
// Acceptance: POST /shorten returns a 6-char code that redirects to original URL.
```

### Phase 2: Polyp (Red — Failing Tests)
Write tests that define the DESIRED behavior. They MUST fail.

**Rules:**
- Test the PUBLIC interface, not internals
- One test per behavior, not per function
- Name tests: `should [expected behavior] when [condition]`
- Include edge cases and error cases
- Commit: `🔴 test(polyp): [what you're testing]`

**Anti-patterns to avoid:**
- Writing tests that pass immediately (you're not testing anything new)
- Testing implementation details (fragile tests)
- Skipping error/edge case tests (they catch the most bugs)

### Phase 3: Strobila (Green — Minimal Implementation)
Write the MINIMUM code to make tests pass. No more.

**Rules:**
- Hardcode values if it makes a test pass (seriously)
- Don't optimize, don't refactor, don't beautify
- If you're writing code no test requires, STOP
- Commit: `🟢 feat(strobila): [what you implemented]`

**Anti-patterns to avoid:**
- Writing the "real" implementation in one go
- Adding error handling no test requires
- Importing libraries no test exercises

### Phase 4: Ephyra (Refactor)
Now clean up. Tests are green — keep them green.

**Rules:**
- Extract functions, rename variables, reduce duplication
- Run tests after EVERY change
- If a test fails, undo your last change immediately
- This is where code quality emerges
- Commit: `♻️ refactor(ephyra): [what you improved]`

### Phase 5: Medusa (Ship)
Tag and deploy. The organism is mature.
- Commit: `🚀 deploy(medusa): [version]`

## Measuring TDD Compliance

The benchmark system checks git history for this pattern:
1. Test file committed BEFORE implementation file (per feature)
2. Test commit shows failing tests (exit code 1 if run at that commit)
3. Implementation commit shows passing tests
4. No implementation code exists without a corresponding test

## Common Pitfalls with AI Agents

AI agents tend to:
1. Write tests and implementation simultaneously — **RESIST THIS**
2. Write tests that test the implementation rather than the behavior
3. Skip the refactor phase entirely
4. Not commit between phases (losing the audit trail)

Force yourself to commit after EACH phase. The git log IS the proof.

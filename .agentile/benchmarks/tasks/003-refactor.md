# Task 003: Extract Authentication Middleware

## Category
refactor

## Difficulty
tier-2

## Time Budget
40 minutes

## Specification

A REST API has authentication logic duplicated across 8 route handlers. Each handler independently:
1. Extracts the Bearer token from the Authorization header
2. Verifies the JWT
3. Looks up the user from the decoded payload
4. Checks role-based permissions
5. Returns 401/403 on failure

**Goal:** Extract all auth logic into reusable middleware without changing ANY external behavior. All existing tests must pass without modification.

The agent must:
1. Identify all instances of duplicated auth logic
2. Create a middleware/decorator pattern appropriate to the framework
3. Replace all inline auth checks with the middleware
4. Ensure zero behavioral change (all existing tests pass unmodified)
5. Add tests for the new middleware itself

## Acceptance Criteria

- [ ] All existing tests pass WITHOUT MODIFICATION (zero behavioral change)
- [ ] Auth logic exists in exactly ONE location (the middleware)
- [ ] All 8 route handlers use the middleware instead of inline checks
- [ ] New unit tests cover the middleware (token extraction, verification, role checking, error responses)
- [ ] No new dependencies added
- [ ] Lines of code reduced (net negative LOC change)
- [ ] Cyclomatic complexity reduced in route handlers

## Provided Files

Benchmark setup creates a project with 8 route files, each containing duplicated auth logic, plus a test suite covering all routes.

## Verification
```bash
# Existing tests must pass unmodified
npm test

# Verify deduplication
grep -r "jwt.verify" src/routes/  # Should return 0 matches
grep -r "jwt.verify" src/middleware/  # Should return 1 match

# LOC comparison
git diff --stat  # net negative line count
```

## Scoring Notes
- **Correctness**: ZERO behavioral change — existing tests pass unmodified
- **Quality**: Clean middleware API, proper error propagation
- **Process**: Should NOT add failing tests first (refactor preserves behavior), but SHOULD add middleware tests
- **Architecture**: Middleware follows framework conventions, proper separation
- **Efficiency**: Minimal, focused changes — no unrelated refactoring

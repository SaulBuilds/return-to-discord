# Task 006: Optimize Slow Database Queries

## Category
performance

## Difficulty
tier-1

## Time Budget
40 minutes

## Specification

A dashboard API endpoint takes 4.2 seconds to load. Profiling shows three N+1 query issues, a missing database index, and an unnecessary full-table scan. The endpoint aggregates data from 4 related tables.

**Goal:** Reduce response time to under 200ms without changing the API contract. All existing tests must continue to pass with identical response bodies.

## Acceptance Criteria

- [ ] Response time reduced from 4.2s to < 200ms (20× improvement)
- [ ] API response body is IDENTICAL before and after (snapshot test)
- [ ] All existing tests pass without modification
- [ ] N+1 queries eliminated (replaced with JOINs or batch queries)
- [ ] Appropriate indexes added (with migration file)
- [ ] No ORM bypass — use the existing ORM, don't drop to raw SQL
- [ ] Performance test included that asserts < 200ms with 10K rows
- [ ] Explain plan or query analysis included in commit message

## Provided Files
API with slow endpoint, seed script that populates 10K rows, and a timing test showing 4.2s baseline.

## Verification
```bash
npm run seed        # Populate test data
npm run bench       # Should show < 200ms
npm test            # All existing tests pass
npm run test:snap   # Snapshot comparison passes
```

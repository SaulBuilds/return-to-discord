# Task 002: Race Condition in Cache Invalidation

## Category
bugfix

## Difficulty
tier-1

## Time Budget
30 minutes

## Specification

A caching layer has a race condition: when two requests arrive simultaneously for the same expired cache key, both trigger a full data fetch from the upstream API, and the second write can overwrite the first with stale data.

**Bug report from production:**
> "Intermittent stale data in user profile responses. Happens most during peak hours. Cache TTL is 60 seconds. After cache expires, the next few requests sometimes show outdated data that's 2-3 minutes old. Restarting the service temporarily fixes it."

**Provided implementation** has the bug. The agent must:
1. Identify the root cause
2. Write a failing test that reproduces the race condition
3. Fix the bug
4. Ensure the fix handles thundering herd scenarios

## Acceptance Criteria

- [ ] Failing test written that demonstrates the race condition BEFORE the fix
- [ ] Root cause identified and documented in commit message
- [ ] Fix prevents duplicate fetches for the same key during revalidation
- [ ] Fix handles thundering herd (100 concurrent requests for expired key → 1 fetch)
- [ ] All existing tests still pass
- [ ] New test passes with the fix applied
- [ ] No performance regression (cached reads still < 1ms)

## Provided Files

The agent will find a `src/cache.js` (or equivalent) with the buggy implementation. Create this starter file as part of benchmark setup:

```javascript
// src/cache.js — BUGGY IMPLEMENTATION
class Cache {
  constructor(fetchFn, ttlMs = 60000) {
    this.store = new Map();
    this.fetchFn = fetchFn;
    this.ttlMs = ttlMs;
  }

  async get(key) {
    const entry = this.store.get(key);
    if (entry && Date.now() - entry.timestamp < this.ttlMs) {
      return entry.value;
    }
    // BUG: No lock — concurrent calls all trigger fetch
    const value = await this.fetchFn(key);
    this.store.set(key, { value, timestamp: Date.now() });
    return value;
  }

  invalidate(key) {
    this.store.delete(key);
  }
}

module.exports = { Cache };
```

## Verification
```bash
# The agent's NEW test must fail on the original code
git stash && npm test  # should see failure
git stash pop          # restore fix, tests pass

# Thundering herd test: 100 concurrent gets → exactly 1 fetch call
```

## Scoring Notes
- **Correctness**: Race condition fixed, thundering herd handled
- **Quality**: Clean implementation, no unnecessary complexity
- **Process**: CRITICAL — failing test MUST appear in git log BEFORE the fix commit
- **Architecture**: Fix should be encapsulated (no sprawling changes)
- **Efficiency**: Minimal code changes, no over-engineering

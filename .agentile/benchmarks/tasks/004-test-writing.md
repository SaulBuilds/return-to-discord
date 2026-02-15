# Task 004: Comprehensive Test Suite for Existing API

## Category
testing

## Difficulty
tier-2

## Time Budget
35 minutes

## Specification

An Express/FastAPI REST API exists with 6 endpoints, zero tests, and ~400 lines of code. The API handles a simple todo list with user authentication. Write a comprehensive test suite covering:

1. Unit tests for all business logic functions
2. Integration tests for all API endpoints
3. Edge cases: empty inputs, invalid IDs, auth failures, concurrent operations
4. Error handling: network failures, malformed JSON, missing fields

**Goal:** Achieve ≥90% code coverage with meaningful tests (not just line coverage). Tests must catch real bugs — at least 2 latent bugs exist in the provided code.

## Acceptance Criteria

- [ ] Test suite achieves ≥90% line coverage
- [ ] Test suite achieves ≥85% branch coverage
- [ ] At least 2 bugs discovered and documented (with failing tests)
- [ ] All happy-path endpoints tested
- [ ] All error responses tested (400, 401, 403, 404, 500)
- [ ] Edge cases: empty body, null values, very long strings, special characters
- [ ] Tests are independent (can run in any order)
- [ ] Tests use proper setup/teardown (no shared mutable state)
- [ ] Test names follow: "should [behavior] when [condition]"
- [ ] No mocking of the thing being tested (only external dependencies)

## Provided Files
Starter API code with endpoints for CRUD todos + auth. Contains 2 latent bugs.

## Verification
```bash
npm test -- --coverage  # All pass, ≥90% coverage
# Bugs should be documented in test file comments
```

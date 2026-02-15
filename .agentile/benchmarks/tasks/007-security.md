# Task 007: Security Audit and Hardening

## Category
security

## Difficulty
tier-1

## Time Budget
45 minutes

## Specification

A user-facing API has been flagged by a security audit with the following findings:

1. SQL injection vulnerability in search endpoint
2. Missing rate limiting on authentication endpoints
3. JWT tokens never expire
4. Passwords stored with MD5 (not bcrypt/argon2)
5. CORS configured as `*` in production
6. User IDs exposed as sequential integers (enumeration risk)
7. Error responses leak stack traces and internal paths
8. No input sanitization on user-provided HTML content

**Goal:** Fix ALL 8 vulnerabilities without breaking existing functionality. All existing tests must pass. Add security-focused tests for each fix.

## Acceptance Criteria

- [ ] SQL injection fixed (parameterized queries, test with `'; DROP TABLE users; --`)
- [ ] Rate limiter: max 5 login attempts per minute per IP
- [ ] JWT expiry: 15 min access token + 7 day refresh token rotation
- [ ] Passwords rehashed with bcrypt (cost factor ≥ 12) on next login
- [ ] CORS restricted to configured origins
- [ ] UUIDs replace sequential IDs in API responses (internal IDs unchanged)
- [ ] Error responses: generic messages in production, details in development only
- [ ] HTML sanitized with allowlist (DOMPurify or equivalent)
- [ ] Security test for each vulnerability (8 new tests minimum)
- [ ] All existing tests still pass
- [ ] Migration path: existing users aren't locked out

## Provided Files
API codebase with all 8 vulnerabilities present. Existing test suite covering happy paths.

## Verification
```bash
npm test                    # All existing + new tests pass
npm run test:security       # Security-specific tests pass
# Manual: attempt SQL injection on search endpoint
# Manual: attempt >5 rapid logins
```

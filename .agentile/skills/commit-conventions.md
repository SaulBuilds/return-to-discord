# Skill: Conventional Commits with Lifecycle Phases

## When to Use
Every single commit in this project.

## Format

```
<emoji> <type>(<lifecycle>): <description>

[optional body]

[optional footer(s)]
```

## Types

| Type | When | Example |
|------|------|---------|
| `test` | Adding or updating tests | `🔴 test(polyp): add auth middleware tests` |
| `feat` | New feature implementation | `🟢 feat(strobila): implement JWT validation` |
| `fix` | Bug fix | `🟢 fix(strobila): resolve race condition in cache` |
| `refactor` | Code restructuring, no behavior change | `♻️ refactor(ephyra): extract auth into middleware` |
| `docs` | Documentation only | `📝 docs(planula): add API specification` |
| `style` | Formatting, whitespace, no code change | `💅 style(ephyra): apply prettier formatting` |
| `perf` | Performance improvement | `⚡ perf(ephyra): add connection pooling` |
| `build` | Build system or dependency changes | `🔧 build: update vitest to v3` |
| `ci` | CI/CD pipeline changes | `🔧 ci: add coverage threshold check` |
| `chore` | Maintenance, no production code change | `🔧 chore: update .gitignore` |
| `deploy` | Production deployment | `🚀 deploy(medusa): release v1.2.0` |
| `adr` | Architecture Decision Record | `📐 adr(planula): ADR-005 choose PostgreSQL` |

## Lifecycle Phases (Scope)

| Phase | When | Meaning |
|-------|------|---------|
| `planula` | Before implementation | Specs, ADRs, stories, planning docs |
| `polyp` | Writing failing tests | Red phase of TDD |
| `strobila` | Making tests pass | Green phase of TDD |
| `ephyra` | Refactoring | Clean up while tests stay green |
| `medusa` | Shipping to production | Deployment, release tagging |

The lifecycle phase goes in the scope position. If a commit doesn't map to a lifecycle phase (e.g., CI changes), omit the scope.

## Rules

1. **Subject line ≤ 72 characters** (emoji + space counts)
2. **Imperative mood**: "add" not "added" or "adds"
3. **No period at end** of subject line
4. **Body wraps at 72 characters** (if present)
5. **Breaking changes** use `!` after type: `🟢 feat(strobila)!: change auth token format`
6. **One logical change per commit** — if you can split it, do

## Examples

```
🔴 test(polyp): add failing tests for URL shortening endpoint

Tests cover:
- POST /shorten with valid URL returns 201 + short code
- POST /shorten with invalid URL returns 400
- GET /:code redirects with 301
- GET /nonexistent returns 404
```

```
🟢 feat(strobila): implement URL shortener with in-memory store

Minimal implementation to pass all polyp-phase tests.
Uses crypto.randomBytes for code generation.
```

```
♻️ refactor(ephyra): extract URL validation into utility module

No behavioral change. Moved validation logic from route handler
to src/utils/validate-url.js for reuse.
```

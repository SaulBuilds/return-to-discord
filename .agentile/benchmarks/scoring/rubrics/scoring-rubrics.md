# Scoring Rubrics — Polyp Benchmark Framework

## Correctness Rubric (30% weight)

| Score | Criteria |
|-------|----------|
| 100 | All tests pass, all acceptance criteria met, edge cases handled |
| 80 | All tests pass, most acceptance criteria met, minor gaps |
| 60 | Tests pass but some acceptance criteria missed |
| 40 | Some tests fail but core functionality works |
| 20 | Major test failures, partial functionality |
| 0 | Does not compile/run, or no tests present |

## Code Quality Rubric (25% weight)

| Score | Criteria |
|-------|----------|
| 100 | Zero lint warnings, complexity < 5/fn, zero duplication, excellent naming |
| 80 | Zero lint errors (warnings OK), complexity < 10/fn, < 3% duplication |
| 60 | Minor lint issues, complexity < 15/fn, < 5% duplication |
| 40 | Noticeable lint issues, some high-complexity functions |
| 20 | Many lint errors, poor naming, significant duplication |
| 0 | No linter configured, unreadable code |

## Process Quality Rubric (20% weight)

| Score | Criteria |
|-------|----------|
| 100 | Perfect TDD (test→impl→refactor in git log), all conventional commits, ADRs present |
| 80 | Tests written before implementation, mostly conventional commits |
| 60 | Tests exist but written alongside implementation, some conventional commits |
| 40 | Tests written after implementation, inconsistent commit messages |
| 20 | Few tests, poor commit messages, no documentation |
| 0 | No tests, single commit dump, no process evidence |

## Architecture Rubric (15% weight)

| Score | Criteria |
|-------|----------|
| 100 | Clean separation of concerns, no circular deps, proper module boundaries |
| 80 | Good separation, minor coupling issues |
| 60 | Adequate structure, some mixing of concerns |
| 40 | Routes contain business logic, poor module boundaries |
| 20 | Everything in one file, no separation |
| 0 | Spaghetti code, circular dependencies, no structure |

## Efficiency Rubric (10% weight)

| Score | Criteria |
|-------|----------|
| 100 | Minimal files changed (≤5), focused diffs, fast completion |
| 75 | Reasonable file count (6-10), mostly focused |
| 50 | Moderate sprawl (11-20 files), some unfocused changes |
| 25 | Wide sprawl (20+ files), significant scope creep |
| 0 | Massive, unfocused changes touching unrelated code |

---

## Human Review Overlay

After automated scoring, a human reviewer can adjust any dimension by ±20 points with written justification. Adjustments are recorded in `results/{agent}/{task}/review.md`.

Reasons for positive adjustment:
- Exceptionally elegant solution not captured by metrics
- Creative approach that metrics can't measure
- Excellent error messages or user experience

Reasons for negative adjustment:
- Technically passes but misses the spirit of the requirement
- Fragile tests that test implementation not behavior
- Security issues not caught by automated tools

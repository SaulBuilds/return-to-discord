# Polyp Benchmark Framework — Agent-vs-Agent Evaluation

## Overview

The Polyp Benchmark Framework evaluates AI coding agents using Elo-style pairwise ranking across diverse task types. It measures both **output quality** (does the code work?) and **development process quality** (did the agent follow good practices?).

## Architecture

```
.agentile/benchmarks/
├── BENCHMARKS.md          ← You are here
├── tasks/                 ← Standardized task definitions
│   ├── 001-greenfield.md
│   ├── 002-bugfix.md
│   ├── 003-refactor.md
│   ├── 004-test-writing.md
│   ├── 005-documentation.md
│   ├── 006-performance.md
│   └── 007-security.md
├── results/               ← Per-agent run artifacts (.gitignored)
│   └── {agent}/{task-id}/{timestamp}/
│       ├── workspace/     ← The agent's output
│       ├── metrics.json   ← Automated scores
│       └── review.md      ← Human review notes
└── scoring/
    ├── score.mjs          ← Composite scoring engine
    ├── elo.mjs            ← Bradley-Terry Elo computation
    ├── rubrics/           ← Scoring rubrics per dimension
    │   ├── correctness.md
    │   ├── quality.md
    │   ├── process.md
    │   └── efficiency.md
    └── leaderboard.json   ← Current Elo ratings
```

## Running a Benchmark

### Step 1: Select a task
```bash
# List available tasks
ls .agentile/benchmarks/tasks/

# Read the task specification
cat .agentile/benchmarks/tasks/001-greenfield.md
```

### Step 2: Assign to an agent
Give the EXACT same task specification to each agent being compared. The agent should:
1. Read the task file
2. Execute the task in an isolated workspace
3. Commit all work with conventional commits

### Step 3: Score the output
```bash
# Automated scoring (correctness + quality + process)
node .agentile/benchmarks/scoring/score.mjs \
  --task 001 \
  --agent claude-code \
  --workspace ./results/claude-code/001/2026-02-14/workspace

# Compare two agents (pairwise Elo update)
node .agentile/benchmarks/scoring/elo.mjs \
  --task 001 \
  --agent-a claude-code \
  --agent-b cursor \
  --result-a ./results/claude-code/001/latest/metrics.json \
  --result-b ./results/cursor/001/latest/metrics.json
```

## Scoring Dimensions

### Composite Score Formula
```
TOTAL = (correctness × 0.30)
      + (code_quality × 0.25)
      + (process_quality × 0.20)
      + (architecture × 0.15)
      + (efficiency × 0.10)
```

### 1. Correctness (30%)
- All tests pass (binary: 0 or 100)
- Specification adherence (% of requirements met)
- Edge case handling (manual review)
- No regressions introduced

### 2. Code Quality (25%)
- Lint score (% zero-warning compliance)
- Cyclomatic complexity (lower is better, target < 10 per function)
- Duplication ratio (< 3% target)
- Type safety (for typed languages)
- Naming quality (descriptive, consistent conventions)

### 3. Process Quality (20%)
- **TDD adherence**: Did test files appear in commits BEFORE implementation?
- **Commit quality**: Conventional format, atomic changes, meaningful messages
- **ADR compliance**: Were architectural decisions documented?
- **Scope discipline**: Did the agent only touch files related to the task?
- **Documentation**: Are functions documented? Is there a README?

### 4. Architecture (15%)
- Separation of concerns
- Dependency direction (clean architecture compliance)
- Module cohesion / coupling balance
- File organization quality
- No circular dependencies

### 5. Efficiency (10%)
- Token consumption (fewer is better)
- Tool calls made (fewer is better)
- Wall clock time (shorter is better)
- Files modified (fewer, more focused is better)

## Elo Rating System

We use the **Bradley-Terry model** (same as Chatbot Arena / LMArena), not online Elo:

```
P(agent_i beats agent_j) = 1 / (1 + e^-(βi - βj))
```

Coefficients are estimated via maximum likelihood over all pairwise results, then converted to Elo scale (multiply by 400, add 1000). Confidence intervals are computed via 1,000 bootstrap permutations.

### Why Bradley-Terry over classic Elo
- Agents are static (their "skill" doesn't change between games)
- Batch computation yields more stable ratings
- Handles ties naturally (both agents can score equally)
- Statistical confidence intervals are built in

### Rating Stability
- Minimum **20 pairwise comparisons** per agent for provisional rating
- Minimum **100 comparisons** for stable rating
- Ratings are recalculated from scratch on each update (not incremental)

### Task Difficulty Calibration
Tasks are assigned difficulty tiers based on the variance in agent performance:
- **Tier 1 (Discriminating)**: High variance between agents → weighted 2×
- **Tier 2 (Standard)**: Medium variance → weighted 1×
- **Tier 3 (Non-discriminating)**: Low variance → weighted 0.5×

## Task Category Weights

A balanced evaluation prevents bias toward any single capability:

| Category | Weight | Tests |
|----------|--------|-------|
| Greenfield creation | 20% | Build a feature/project from spec |
| Bug fixing | 20% | Diagnose and fix issues from descriptions |
| Refactoring | 15% | Restructure without changing behavior |
| Test writing | 15% | Generate comprehensive test suites |
| Documentation | 10% | API docs, READMEs, inline comments |
| Performance | 10% | Optimize speed, memory, complexity |
| Security | 10% | Detect and fix vulnerabilities |

## Adding New Tasks

Create a new file in `tasks/` following this template:

```markdown
# Task [NNN]: [Title]

## Category
[greenfield | bugfix | refactor | testing | docs | performance | security]

## Difficulty
[tier-1 | tier-2 | tier-3]

## Time Budget
[suggested maximum time in minutes]

## Specification
[Detailed description of what the agent must produce]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Provided Files
[List any starter files, or "none — greenfield"]

## Verification
[How to verify the output: test commands, expected behavior, etc.]
```

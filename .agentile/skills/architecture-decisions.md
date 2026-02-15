# Skill: Architecture Decision Records (ADR)

## When to Use
Before making ANY of these decisions:
- Adding a new dependency (library, framework, service)
- Choosing or changing a database, cache, or message queue
- Defining an API contract or changing an existing one
- Setting up authentication, authorization, or security patterns
- Choosing deployment strategy or infrastructure
- Establishing code organization patterns (monorepo, module boundaries)
- Making performance/scalability trade-offs

## Process

1. **Pause before implementing.** If you're about to make an architectural choice, write the ADR first.
2. **Use the template** at `docs/adr/template.md`
3. **Number sequentially**: `001-`, `002-`, etc.
4. **File naming**: `docs/adr/records/NNN-kebab-case-title.md`
5. **Commit the ADR** before the implementation: `📐 adr(planula): ADR-NNN [title]`

## What Makes a Good ADR

### Context section
- State the problem clearly enough that someone unfamiliar could understand
- Include constraints (budget, timeline, team skills, existing systems)
- Be honest about uncertainty

### Options section
- Always list at least 2 options (even if one is "do nothing")
- Include concrete pros and cons, not vague opinions
- Reference benchmarks, docs, or prior experience where possible

### Decision section
- State the choice clearly in one sentence
- Connect to decision drivers (don't just say "we chose X because it's better")

### Consequences section
- Be honest about trade-offs and risks
- Include what you'll need to monitor
- Note what would trigger revisiting this decision

## ADR Lifecycle

| Status | Meaning |
|--------|---------|
| **Proposed** | Written but not yet agreed upon |
| **Accepted** | Team has agreed, implementation can proceed |
| **Deprecated** | No longer applies (explain why) |
| **Superseded** | Replaced by a newer ADR (link to it) |

## Common Anti-patterns

- **Missing ADR**: Implementation exists but no record of why
- **Retroactive ADR**: Written after implementation — loses the "considered options" value
- **Vague ADR**: "We chose React because it's popular" — not useful
- **ADR drift**: Decision was superseded but never marked as such

## Quick Decision Test

Ask yourself: "If I left this project for 6 months and came back, would I wonder WHY this choice was made?" If yes → write an ADR.

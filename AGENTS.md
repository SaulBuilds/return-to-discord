# AGENTS.md — Polyp Framework

> Universal scaffold for AI coding agents. One repo, every platform, quality-gated development.

## Identity

Polyp is a **stack-agnostic meta-framework** for initializing, governing, and benchmarking AI coding agents across any IDE or CLI tool. Named after the sessile developmental stage of cnidarian jellyfish — the polyp sits on a substrate, clones itself, and when conditions are right, undergoes strobilation to release independent deployable units (ephyrae). This framework IS the polyp: the substrate from which all agent work grows.

## Project Structure

```
.agentile/              → Framework core (platform-agnostic agent config)
  ├── skills/           → Reusable specialized knowledge modules
  ├── plans/            → Execution plans for multi-step tasks
  ├── benchmarks/       → Agent-vs-agent evaluation system
  │   ├── tasks/        → Standardized task definitions
  │   ├── results/      → Per-agent run results (gitignored)
  │   └── scoring/      → Scoring rubrics and Elo computation
  └── init/             → Dynamic initialization questionnaire system
.claude/rules/          → Claude Code scoped rules (auto-synced)
.cursor/rules/          → Cursor scoped rules (auto-synced)
.windsurf/rules/        → Windsurf scoped rules (auto-synced)
.github/instructions/   → GitHub Copilot instructions (auto-synced)
.clinerules/            → Cline rules (auto-synced)
.amazonq/rules/         → Amazon Q rules (auto-synced)
.continue/rules/        → Continue.dev rules (auto-synced)
.aider.conf.yml         → Aider configuration (points here)
docs/adr/               → Architecture Decision Records
```

## Commands

```bash
# Initialize a new project using the conversational questionnaire
# (Agent reads .agentile/init/INIT.md and walks you through it)
cat .agentile/init/INIT.md   # then follow the [ASK] prompts

# Sync rules to all platform-specific files
node .agentile/sync.mjs

# Run a benchmark task
cat .agentile/benchmarks/tasks/001-greenfield.md  # agent executes task
node .agentile/benchmarks/scoring/score.mjs       # compute scores

# Validate project structure
node .agentile/validate.mjs
```

## Core Rules (ALL agents MUST follow)

### 1. Read Before You Write
Before writing ANY code, read these files in order:
1. This file (AGENTS.md)
2. `.agentile/init/PROJECT_DNA.yaml` (if it exists — project config)
3. `docs/adr/records/` (all Architecture Decision Records)
4. The relevant `.agentile/skills/` file for your current task type

### 2. Test-Driven Development (Strobilation Pattern)
Follow the cnidarian lifecycle for ALL feature work:
- **Planula**: Write the spec/user story (attach to substrate)
- **Polyp**: Write failing tests first (clone the test colony)
- **Strobila**: Write minimal implementation to pass (segment)
- **Ephyra**: Refactor while tests stay green (release independently)
- **Medusa**: Ship to production (mature organism)

Commit messages MUST use conventional commits with lifecycle phase:
```
🔴 test(polyp): add failing tests for user authentication
🟢 feat(strobila): implement auth to pass tests
♻️ refactor(ephyra): extract auth middleware
🚀 deploy(medusa): release auth feature v1.0.0
```

### 3. Architecture Decision Records
ANY architectural decision MUST be recorded in `docs/adr/records/` using the template at `docs/adr/template.md`. Decisions include: new dependencies, API contracts, database schema changes, authentication methods, deployment strategies.

### 4. Quality Gates (Nematocyst Protocol)
Named after the jellyfish stinging cell — the defensive mechanism. No code passes without:
- All tests passing (zero tolerance)
- No new lint errors introduced
- Coverage on new code ≥ 80%
- Conventional commit format
- ADR exists for any architectural change

### 5. Scope Discipline (Rhopalium Protocol)
Named after the box jellyfish sensory organ — focused observation. Agents MUST:
- Only modify files directly related to the current task
- Never refactor unrelated code without explicit permission
- Track all files changed and report deviation from expected scope
- Ask before adding new dependencies

### 6. Progressive Disclosure
Don't dump everything in one file. Use nested AGENTS.md files in subdirectories for module-specific guidance. This root file contains ONLY universal rules.

## Platform Detection

This repository supports all major AI coding agents. Each platform reads its native config file, all of which are kept in sync with this canonical AGENTS.md via `.agentile/sync.mjs`. If you are an AI agent reading this, you should ALSO check your platform-specific rules directory for additional scoped guidance.

| Platform | Your config file | Status |
|----------|-----------------|--------|
| Claude Code | `CLAUDE.md` + `.claude/rules/` | ✅ Pointer to this file |
| Cursor | `.cursor/rules/` | ✅ Auto-synced |
| Windsurf | `.windsurf/rules/` | ✅ Auto-synced |
| GitHub Copilot | `.github/copilot-instructions.md` | ✅ Auto-synced |
| Cline | `.clinerules/` | ✅ Auto-synced + cross-tool fallback |
| Aider | `.aider.conf.yml` | ✅ Points to this file |
| OpenAI Codex | This file (AGENTS.md) | ✅ Native |
| Amazon Q | `.amazonq/rules/` | ✅ Auto-synced |
| Continue.dev | `.continue/rules/` | ✅ Auto-synced |
| Devin | This file (AGENTS.md) | ✅ Native + auto-imports |
| Replit Agent | `replit.md` | ✅ Auto-synced |

## Terminology (The Medusa Paradigm)

This project uses cnidarian biology as its naming convention, derived from "The Medusa Paradigm" research framework:

| Term | Biological Meaning | Framework Meaning |
|------|-------------------|-------------------|
| **Polyp** | Sessile developmental stage | The scaffold itself; development environment |
| **Planula** | Larva seeking substrate | Initial spec/story before tests |
| **Strobila** | Segmenting polyp releasing ephyrae | Build/CI pipeline segmenting into deployables |
| **Ephyra** | Juvenile free-swimming medusa | Beta release; independently testable unit |
| **Medusa** | Mature adult organism | Production deployment |
| **Nematocyst** | Stinging/defense cell | Quality gates and validation checks |
| **Rhopalium** | Sensory organ cluster | Observability, scope monitoring |
| **Nerve Net** | Decentralized neural mesh | The agent coordination layer |
| **Bloom** | Population explosion | Rapid scaling event |
| **Zooxanthellae** | Symbiotic algae | Plugin/extension ecosystem |

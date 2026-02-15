# ARCHITECTURE.md — Polyp Framework

## Design Philosophy

Polyp follows three core principles:

**1. Single Source of Truth (SSOT)**
`AGENTS.md` is the canonical rule file. Every platform-specific config is either a pointer to it, a symlink, or an auto-generated derivative. No rule should ever be edited in a platform-specific file — edit AGENTS.md and run sync.

**2. Progressive Disclosure**
Root-level files contain only universal rules. Module-specific guidance lives in nested directories. Agents discover more detail as they navigate deeper into the project. This prevents context window bloat.

**3. Filesystem as API**
The file system IS the interface. There's no CLI to install, no daemon to run, no web UI to configure. Any agent that can read files can use Polyp. This ensures maximum compatibility with current and future platforms.

## Data Flow

```
AGENTS.md (canonical)
    │
    ├── sync.mjs reads → generates platform configs
    │   ├── .claude/rules/
    │   ├── .cursor/rules/
    │   ├── .windsurf/rules/
    │   ├── .github/copilot-instructions.md
    │   ├── .clinerules/
    │   ├── .amazonq/rules/
    │   ├── .continue/rules/
    │   ├── .aider.conf.yml
    │   └── replit.md
    │
    ├── CLAUDE.md → pointer ("See @AGENTS.md")
    │
    ├── .agentile/skills/ → task-specific deep guidance
    │
    ├── .agentile/init/INIT.md → conversational questionnaire
    │   └── generates → PROJECT_DNA.yaml + updated AGENTS.md
    │
    └── .agentile/benchmarks/ → evaluation system
        ├── tasks/ → standardized problems
        ├── scoring/score.mjs → multi-dimensional scorer
        └── scoring/elo.mjs → Bradley-Terry rankings
```

## Why Not Use Ruler/ai-rulez/syncai Directly?

Those tools are excellent and Polyp is designed to be compatible with them. The sync.mjs included here is a minimal V0 for zero-dependency bootstrapping. For production use:

- **Ruler** (`intellectronica/ruler`): Best for teams using 5+ agent platforms, supports 30+ targets, has CI/CD integration
- **ai-rulez** (`Goldziher/ai-rulez`): Best for teams wanting profile-based configs (backend/frontend/QA roles)
- **syncai** (`nxnom/syncai`): Best for simple symlink-based sync

Replace sync.mjs with any of these as the project matures.

## Extension Points

**Adding a new skill:** Create a `.md` file in `.agentile/skills/` — agents discover skills by listing the directory.

**Adding a new benchmark task:** Create a `.md` file in `.agentile/benchmarks/tasks/` following the template in BENCHMARKS.md.

**Supporting a new platform:** Add a generation block in sync.mjs that writes to the platform's expected file path.

**Custom scoring dimensions:** Add a scoring function in score.mjs and update the weights object.

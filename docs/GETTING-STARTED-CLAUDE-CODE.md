# Getting Started with Polyp Framework in Claude Code

## First Session

When you open this project in Claude Code for the first time:

```
Hey Claude, read .agentile/init/INIT.md and walk me through
initializing this project. Ask me the questions one at a time.
```

Claude Code will:
1. Read the INIT.md questionnaire
2. Ask you each question conversationally
3. Generate PROJECT_DNA.yaml with your answers
4. Update AGENTS.md with stack-specific commands
5. Create your first ADR
6. Set up the package manifest and tooling

## Every Session After

Claude Code automatically reads CLAUDE.md → discovers AGENTS.md → follows the rules. You just work normally.

## Key Commands to Remember

```bash
# Sync rules after editing AGENTS.md
node .agentile/sync.mjs

# Validate project structure
node .agentile/validate.mjs

# Check current Elo leaderboard
cat .agentile/benchmarks/scoring/leaderboard.json
```

## If Claude Code Drifts Off-Task

Say: "Check the Rhopalium Protocol in .agentile/skills/scope-discipline.md — are you staying in scope?"

## If Claude Code Skips Tests

Say: "Follow the Strobilation Pattern. Read .agentile/skills/tdd-strobilation.md — I need the Polyp phase (failing tests) before Strobila phase (implementation)."

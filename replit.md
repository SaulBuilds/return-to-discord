# Polyp Framework Project

See AGENTS.md for full rules and conventions.

## Key Rules
- Test-first development (Strobilation Pattern)
- Conventional commits with lifecycle phases
- Architecture Decision Records for design choices
- Read .agentile/skills/ for task-specific guidance

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

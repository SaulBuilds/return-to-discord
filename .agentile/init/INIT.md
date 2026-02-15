# INIT.md — Polyp Framework Project Initialization

## Instructions for AI Agent

You are initializing a new project using the Polyp Framework. Read this entire file first. Then, walk the user through each `[ASK]` marker below as a conversational flow. Collect all answers before generating any files.

**Rules:**
1. Ask questions ONE AT A TIME in natural conversation
2. Provide sensible defaults in parentheses — accept "y" or Enter for defaults
3. If a question depends on a prior answer, skip it if irrelevant
4. After all questions are answered, generate ALL output files listed in the Output section
5. Save the completed questionnaire as `PROJECT_DNA.yaml` (machine config) AND update this file with answers inline (human charter)

---

## Phase 1: Project Identity

- **project_name**: [ASK: What's the project name? (lowercase-kebab-case)]
- **description**: [ASK: Describe this project in one sentence.]
- **repository_url**: [ASK: Git repository URL? (leave blank if not yet created)]
- **license**: [ASK: License? (MIT / Apache-2.0 / GPL-3.0 / proprietary / other)]

## Phase 2: Team & Workflow

- **team_size**: [ASK: How many humans on this project? (1)]
- **agent_platforms**: [ASK: Which AI coding agents will you use? (claude-code, cursor, windsurf, aider, copilot, cline, codex, replit, devin, amazon-q, continue — comma-separated)]
- **human_role**: [ASK: What's your role? (PM / developer / architect / researcher / solo-everything)]
- **methodology**: [ASK: Development methodology? (tdd-strict / tdd-flexible / ad-hoc)]
- **branching_strategy**: [ASK: Git branching strategy? (trunk-based / git-flow / github-flow)]

## Phase 3: Technical Stack

- **primary_language**: [ASK: Primary programming language? (typescript / python / rust / go / other)]
- **framework**: [ASK: Framework? (next.js / express / fastapi / django / none / other)]
- **runtime**: [ASK: Runtime? (node / bun / deno / python / other)]
- **package_manager**: [ASK: Package manager? (npm / pnpm / yarn / pip / uv / cargo / other)]
- **database**: [ASK: Database? (postgresql / mongodb / sqlite / none / other)]
- **orm**: [ASK: ORM/query builder? (prisma / drizzle / sqlalchemy / typeorm / none / other)]
- **auth_method**: [ASK: Authentication method? (jwt / oauth / session / none / other)]

## Phase 4: Quality Standards

- **test_framework**: [ASK: Test framework? (vitest / jest / pytest / cargo-test / go-test / other)]
- **coverage_target**: [ASK: Minimum code coverage on new code? (80)]
- **linter**: [ASK: Linter? (eslint / biome / ruff / clippy / golangci-lint / other)]
- **formatter**: [ASK: Formatter? (prettier / biome / black / rustfmt / gofmt / other)]
- **tdd_required**: [ASK: Require test-first development (strobilation pattern)? (yes / no)]
- **adr_required**: [ASK: Require Architecture Decision Records for all design choices? (yes / no)]
- **conventional_commits**: [ASK: Require conventional commit messages? (yes / no)]

## Phase 5: Deployment & Infrastructure

- **deployment_target**: [ASK: Where does this deploy? (vercel / aws / gcp / azure / docker / bare-metal / not-yet-decided)]
- **ci_cd**: [ASK: CI/CD platform? (github-actions / gitlab-ci / none / other)]
- **containerized**: [ASK: Will this be containerized? (yes / no / not-yet-decided)]
- **monorepo**: [ASK: Is this a monorepo? (yes / no)]

## Phase 6: Benchmarking Preferences

- **enable_agent_benchmarks**: [ASK: Enable agent-vs-agent benchmarking? (yes / no)]
- **benchmark_categories**: [ASK: Which benchmark categories matter most? (greenfield / bugfix / refactor / testing / docs / performance / security — comma-separated, or "all")]
- **quality_scoring**: [ASK: Enable automated quality scoring on every commit? (yes / no)]

---

## Output Files to Generate

After collecting all answers, generate the following files:

### 1. `.agentile/init/PROJECT_DNA.yaml`
Machine-readable config with ALL answers as key-value pairs, using the field names above. Include a `created_at` timestamp and `initialized_by` field.

### 2. `AGENTS.md` (update the root file)
Update the Commands section with project-specific build/test/lint/deploy commands based on the chosen stack. For example, if they chose Vitest:
```
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run lint          # Lint check
npm run format        # Auto-format
```

### 3. `docs/adr/records/001-initial-architecture.md`
An ADR capturing every Phase 3 decision with rationale. Use the template from `docs/adr/template.md`.

### 4. `.editorconfig`
Generated from the language/formatter choices.

### 5. Platform-specific rule files
For each platform listed in `agent_platforms`, generate/update the appropriate config:
- Claude Code: `.claude/rules/01-project.md`
- Cursor: `.cursor/rules/project/RULE.md`
- Windsurf: `.windsurf/rules/01-project.md`
- etc.

### 6. `package.json` / `pyproject.toml` / `Cargo.toml` (as appropriate)
Minimal project manifest with dev dependencies for testing, linting, and formatting based on choices.

### 7. `.gitignore`
Language-appropriate gitignore plus:
```
.agentile/benchmarks/results/
.agentile/plans/*.active.md
*.local.md
.env
```

---

## Post-Initialization Checklist

After generating all files, print this checklist for the user:

```
✅ Polyp Framework initialized for [project_name]

Files created:
  □ .agentile/init/PROJECT_DNA.yaml  — Project configuration
  □ AGENTS.md                         — Updated with stack-specific commands  
  □ docs/adr/records/001-*.md         — Initial architecture ADR
  □ .editorconfig                     — Editor settings
  □ [platform-specific files]         — Agent rule files
  □ [manifest file]                   — Package manifest
  □ .gitignore                        — Git ignore rules

Next steps:
  1. Review PROJECT_DNA.yaml and adjust any values
  2. Run `git init && git add -A && git commit -m "🌱 planula: initialize polyp framework"`
  3. Start your first task with the Strobilation Pattern:
     - Write a failing test (polyp phase)
     - Make it pass (strobila phase)  
     - Refactor (ephyra phase)
     - Ship it (medusa phase)
```

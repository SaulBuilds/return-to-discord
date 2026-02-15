#!/usr/bin/env node

/**
 * score.mjs — Polyp Benchmark Scoring Engine
 *
 * Computes a composite quality score for an agent's benchmark output.
 *
 * Usage:
 *   node .agentile/benchmarks/scoring/score.mjs \
 *     --task 001 \
 *     --agent claude-code \
 *     --workspace ./path/to/agent/output
 *
 * Scoring dimensions (see BENCHMARKS.md for details):
 *   Correctness   (30%)  — Tests pass, spec adherence
 *   Code Quality  (25%)  — Lint, complexity, duplication
 *   Process       (20%)  — TDD adherence, commit quality, ADRs
 *   Architecture  (15%)  — Separation of concerns, coupling
 *   Efficiency    (10%)  — Tokens, time, file count
 *
 * V0 Implementation: This is a scaffolding that defines the scoring
 * interface. Full automation requires integration with:
 * - Language-specific test runners
 * - SonarQube / CodeClimate / Sourcery for quality metrics
 * - Git log analysis for process scoring
 * - Custom architecture fitness functions
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Argument Parsing ───
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const taskId = getArg('task');
const agent = getArg('agent');
const workspace = getArg('workspace');

if (!taskId || !agent || !workspace) {
  console.log(`Usage: node score.mjs --task <id> --agent <name> --workspace <path>`);
  process.exit(1);
}

// ─── Scoring Functions ───

function scoreCorrectness(workspace) {
  // V0: Check if test runner exits cleanly
  const score = { total: 0, details: {} };

  try {
    // Try common test runners
    const runners = ['npm test', 'npx vitest run', 'npx jest', 'python -m pytest', 'cargo test'];
    let passed = false;
    for (const runner of runners) {
      try {
        execSync(runner, { cwd: workspace, stdio: 'pipe', timeout: 120000 });
        passed = true;
        score.details.test_runner = runner;
        break;
      } catch { continue; }
    }
    score.details.tests_pass = passed;
    score.total = passed ? 100 : 0;
  } catch (e) {
    score.details.error = e.message;
    score.total = 0;
  }

  return score;
}

function scoreCodeQuality(workspace) {
  // V0: Check lint status
  const score = { total: 0, details: {} };

  try {
    const linters = ['npx eslint . --max-warnings 0', 'npx biome check .', 'ruff check .'];
    let lintClean = false;
    for (const linter of linters) {
      try {
        execSync(linter, { cwd: workspace, stdio: 'pipe', timeout: 60000 });
        lintClean = true;
        score.details.linter = linter;
        break;
      } catch { continue; }
    }
    score.details.lint_clean = lintClean;
    score.total = lintClean ? 80 : 40; // Partial credit for having linter configured
  } catch {
    score.total = 50; // No linter found — neutral
  }

  return score;
}

function scoreProcess(workspace) {
  // V0: Analyze git log for TDD pattern and conventional commits
  const score = { total: 0, details: {} };

  try {
    const log = execSync('git log --oneline --format="%s"', {
      cwd: workspace, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']
    }).trim().split('\n').filter(Boolean);

    // Check conventional commit format
    const conventionalPattern = /^(🔴|🟢|♻️|🚀|📝|💅|⚡|🔧|📐)\s+(test|feat|fix|refactor|docs|style|perf|build|ci|chore|deploy|adr)/;
    const conventional = log.filter(msg => conventionalPattern.test(msg));
    score.details.total_commits = log.length;
    score.details.conventional_commits = conventional.length;
    score.details.conventional_ratio = log.length > 0
      ? (conventional.length / log.length * 100).toFixed(1) + '%'
      : 'N/A';

    // Check TDD pattern: test commit before feat commit
    const hasTestFirst = log.some(msg => msg.includes('test(polyp)'));
    const hasFeat = log.some(msg => msg.includes('feat(strobila)') || msg.includes('fix(strobila)'));
    if (hasTestFirst && hasFeat) {
      const testIdx = log.findIndex(msg => msg.includes('test(polyp)'));
      const featIdx = log.findIndex(msg => msg.includes('feat(strobila)') || msg.includes('fix(strobila)'));
      // In git log (newest first), test should appear AFTER feat (higher index = earlier commit)
      score.details.tdd_order_correct = testIdx > featIdx;
    } else {
      score.details.tdd_order_correct = false;
    }

    // Composite
    let points = 0;
    if (score.details.conventional_ratio !== 'N/A' && parseFloat(score.details.conventional_ratio) > 80) points += 40;
    if (score.details.tdd_order_correct) points += 40;
    if (log.length >= 3) points += 20; // Multiple commits shows incremental work
    score.total = Math.min(points, 100);
  } catch {
    score.total = 0;
    score.details.error = 'Not a git repository or no commits';
  }

  return score;
}

function scoreArchitecture(workspace) {
  // V0: Placeholder — requires project-specific fitness functions
  return {
    total: 50, // Neutral default
    details: {
      note: 'V0: Architecture scoring requires project-specific fitness functions. See BENCHMARKS.md for integration with ArchUnit/Madge.'
    }
  };
}

function scoreEfficiency(workspace) {
  // V0: Count files modified
  const score = { total: 0, details: {} };

  try {
    const files = execSync('git diff --name-only HEAD~1..HEAD 2>/dev/null || git diff --name-only --cached', {
      cwd: workspace, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']
    }).trim().split('\n').filter(Boolean);

    score.details.files_changed = files.length;
    // Fewer files = more focused = better (for single tasks)
    score.total = files.length <= 5 ? 100 : files.length <= 10 ? 75 : files.length <= 20 ? 50 : 25;
  } catch {
    score.total = 50;
  }

  return score;
}

// ─── Main ───

console.log(`\n🏆 Polyp Benchmark Scorer`);
console.log(`   Task: ${taskId} | Agent: ${agent}`);
console.log(`   Workspace: ${workspace}\n`);

const scores = {
  correctness: scoreCorrectness(workspace),
  code_quality: scoreCodeQuality(workspace),
  process: scoreProcess(workspace),
  architecture: scoreArchitecture(workspace),
  efficiency: scoreEfficiency(workspace),
};

const weights = {
  correctness: 0.30,
  code_quality: 0.25,
  process: 0.20,
  architecture: 0.15,
  efficiency: 0.10,
};

const composite = Object.entries(scores).reduce((sum, [key, score]) => {
  return sum + (score.total * weights[key]);
}, 0);

const result = {
  task_id: taskId,
  agent,
  timestamp: new Date().toISOString(),
  composite_score: Math.round(composite * 10) / 10,
  dimensions: scores,
  weights,
};

// Print results
console.log('📊 Results:');
for (const [dim, score] of Object.entries(scores)) {
  const weight = (weights[dim] * 100).toFixed(0);
  const weighted = (score.total * weights[dim]).toFixed(1);
  console.log(`   ${dim.padEnd(15)} ${score.total.toString().padStart(3)}/100  (×${weight}% = ${weighted})`);
}
console.log(`\n   ${'COMPOSITE'.padEnd(15)} ${result.composite_score}/100`);

// Save results
const resultDir = join(dirname(__dirname), 'benchmarks/results', agent, taskId);
mkdirSync(resultDir, { recursive: true });
const resultPath = join(resultDir, 'metrics.json');
writeFileSync(resultPath, JSON.stringify(result, null, 2));
console.log(`\n💾 Saved to: ${resultPath}`);

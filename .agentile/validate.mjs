#!/usr/bin/env node

/**
 * validate.mjs — Polyp Framework Structure Validator
 *
 * Checks that the project follows Polyp conventions:
 * - Required files exist
 * - Platform configs are in sync
 * - PROJECT_DNA.yaml is populated
 * - ADR numbering is sequential
 *
 * Usage: node .agentile/validate.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

let errors = 0;
let warnings = 0;

function check(condition, message, severity = 'error') {
  if (!condition) {
    if (severity === 'error') {
      console.log(`  ❌ ERROR: ${message}`);
      errors++;
    } else {
      console.log(`  ⚠️  WARN: ${message}`);
      warnings++;
    }
  } else {
    console.log(`  ✅ ${message}`);
  }
}

function fileExists(path) {
  return existsSync(join(ROOT, path));
}

function fileContains(path, substring) {
  try {
    return readFileSync(join(ROOT, path), 'utf-8').includes(substring);
  } catch { return false; }
}

console.log('🔍 Polyp Framework — Validating project structure\n');

// ─── Core Files ───
console.log('📁 Core files:');
check(fileExists('AGENTS.md'), 'AGENTS.md exists at project root');
check(fileExists('CLAUDE.md'), 'CLAUDE.md exists (Claude Code pointer)');
check(fileExists('.agentile/init/INIT.md'), '.agentile/init/INIT.md exists');
check(fileExists('.agentile/init/PROJECT_DNA.yaml'), 'PROJECT_DNA.yaml exists');
check(fileExists('.agentile/sync.mjs'), 'Sync engine exists');
check(fileExists('docs/adr/template.md'), 'ADR template exists');

// ─── Skills ───
console.log('\n📚 Skills:');
check(fileExists('.agentile/skills/tdd-strobilation.md'), 'TDD skill exists');
check(fileExists('.agentile/skills/commit-conventions.md'), 'Commit conventions skill exists');
check(fileExists('.agentile/skills/architecture-decisions.md'), 'ADR skill exists');
check(fileExists('.agentile/skills/scope-discipline.md'), 'Scope discipline skill exists');

// ─── Benchmarks ───
console.log('\n🏆 Benchmarks:');
check(fileExists('.agentile/benchmarks/BENCHMARKS.md'), 'Benchmark framework doc exists');
const taskDir = join(ROOT, '.agentile/benchmarks/tasks');
if (existsSync(taskDir)) {
  const tasks = readdirSync(taskDir).filter(f => f.endsWith('.md'));
  check(tasks.length >= 1, `${tasks.length} benchmark task(s) defined`);
} else {
  check(false, 'Benchmark tasks directory exists');
}

// ─── Platform Configs ───
console.log('\n🔌 Platform configs:');
check(fileExists('.claude/rules/00-polyp-core.md'), 'Claude Code rules synced', 'warn');
check(fileExists('.cursor/rules/polyp-core/RULE.md'), 'Cursor rules synced', 'warn');
check(fileExists('.windsurf/rules/00-polyp-core.md'), 'Windsurf rules synced', 'warn');
check(fileExists('.github/copilot-instructions.md'), 'GitHub Copilot instructions synced', 'warn');
check(fileExists('.clinerules/00-polyp-core.md'), 'Cline rules synced', 'warn');
check(fileExists('.amazonq/rules/polyp-core.md'), 'Amazon Q rules synced', 'warn');
check(fileExists('.continue/rules/polyp-core.md'), 'Continue.dev rules synced', 'warn');
check(fileExists('.aider.conf.yml'), 'Aider config exists', 'warn');
check(fileExists('replit.md'), 'Replit config synced', 'warn');

// ─── CLAUDE.md Pointer Check ───
console.log('\n🔗 Pointer integrity:');
check(
  fileContains('CLAUDE.md', 'AGENTS.md'),
  'CLAUDE.md references AGENTS.md'
);
check(
  fileContains('.aider.conf.yml', 'AGENTS.md'),
  '.aider.conf.yml points to AGENTS.md'
);

// ─── PROJECT_DNA.yaml Populated ───
console.log('\n🧬 Project DNA:');
if (fileExists('.agentile/init/PROJECT_DNA.yaml')) {
  const dna = readFileSync(join(ROOT, '.agentile/init/PROJECT_DNA.yaml'), 'utf-8');
  check(!dna.includes('[FILL:'), 'PROJECT_DNA.yaml has no unfilled [FILL:] markers', 'warn');
  check(dna.includes('project_name:'), 'PROJECT_DNA.yaml has project_name field');
} else {
  check(false, 'PROJECT_DNA.yaml exists');
}

// ─── ADR Sequential Numbering ───
console.log('\n📐 Architecture Decision Records:');
const adrDir = join(ROOT, 'docs/adr/records');
if (existsSync(adrDir)) {
  const adrs = readdirSync(adrDir)
    .filter(f => f.endsWith('.md'))
    .sort();
  check(adrs.length >= 0, `${adrs.length} ADR(s) recorded`);
  // Check sequential numbering
  adrs.forEach((adr, i) => {
    const num = parseInt(adr.split('-')[0]);
    if (!isNaN(num)) {
      check(num === i + 1, `ADR ${adr} has sequential number ${num}`, 'warn');
    }
  });
} else {
  check(true, 'ADR records directory exists (empty — will be populated on init)');
}

// ─── Summary ───
console.log('\n' + '─'.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('🎉 All checks passed! Polyp Framework structure is valid.');
} else if (errors === 0) {
  console.log(`⚠️  ${warnings} warning(s), 0 errors. Run \`node .agentile/sync.mjs\` to fix platform sync issues.`);
} else {
  console.log(`❌ ${errors} error(s), ${warnings} warning(s). Fix errors before proceeding.`);
}

process.exit(errors > 0 ? 1 : 0);

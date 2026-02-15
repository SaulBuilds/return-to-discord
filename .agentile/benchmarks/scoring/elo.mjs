#!/usr/bin/env node

/**
 * elo.mjs — Polyp Benchmark Elo Rating System
 *
 * Implements Bradley-Terry model for pairwise agent comparison,
 * same methodology as Chatbot Arena / LMArena.
 *
 * Usage:
 *   # Compare two agent results
 *   node elo.mjs --result-a metrics-a.json --result-b metrics-b.json
 *
 *   # Recalculate full leaderboard from all results
 *   node elo.mjs --recalculate
 *
 * The leaderboard is stored at .agentile/benchmarks/scoring/leaderboard.json
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEADERBOARD_PATH = join(__dirname, 'leaderboard.json');
const RESULTS_DIR = join(__dirname, '..', 'results');

// ─── Bradley-Terry Model ───

/**
 * Compute Bradley-Terry ratings from pairwise comparison results.
 *
 * Given a list of matches [{winner, loser, draw?}], estimates
 * strength parameters β for each agent, then converts to Elo scale.
 *
 * Uses iterative maximum likelihood estimation (MM algorithm).
 */
function bradleyTerry(matches, iterations = 100) {
  // Collect all agents
  const agents = [...new Set(matches.flatMap(m => [m.agent_a, m.agent_b]))];
  const n = agents.length;

  // Initialize strengths uniformly
  const strength = {};
  agents.forEach(a => strength[a] = 1.0);

  // MM algorithm iterations
  for (let iter = 0; iter < iterations; iter++) {
    const newStrength = {};

    for (const agent of agents) {
      let wins = 0;
      let denomSum = 0;

      for (const match of matches) {
        if (match.agent_a !== agent && match.agent_b !== agent) continue;

        const opponent = match.agent_a === agent ? match.agent_b : match.agent_a;

        // Count wins (using composite score comparison)
        if (match.agent_a === agent && match.score_a > match.score_b) wins += 1;
        if (match.agent_b === agent && match.score_b > match.score_a) wins += 1;
        // Draws count as 0.5 wins for each
        if (match.score_a === match.score_b) wins += 0.5;

        denomSum += 1.0 / (strength[agent] + strength[opponent]);
      }

      newStrength[agent] = denomSum > 0 ? wins / denomSum : 1.0;
    }

    // Normalize so strengths sum to n
    const total = Object.values(newStrength).reduce((a, b) => a + b, 0);
    agents.forEach(a => newStrength[a] = (newStrength[a] / total) * n);

    Object.assign(strength, newStrength);
  }

  // Convert to Elo scale: Elo = 400 * log10(strength) + 1000
  const ratings = {};
  agents.forEach(a => {
    ratings[a] = Math.round(400 * Math.log10(strength[a]) + 1000);
  });

  return ratings;
}

/**
 * Bootstrap confidence intervals (1000 permutations)
 */
function bootstrapCI(matches, nBootstrap = 1000) {
  const allRatings = {};

  for (let i = 0; i < nBootstrap; i++) {
    // Sample with replacement
    const sample = Array.from({ length: matches.length }, () =>
      matches[Math.floor(Math.random() * matches.length)]
    );
    const ratings = bradleyTerry(sample);
    for (const [agent, rating] of Object.entries(ratings)) {
      if (!allRatings[agent]) allRatings[agent] = [];
      allRatings[agent].push(rating);
    }
  }

  // Compute 95% CI
  const ci = {};
  for (const [agent, ratings] of Object.entries(allRatings)) {
    ratings.sort((a, b) => a - b);
    ci[agent] = {
      lower: ratings[Math.floor(nBootstrap * 0.025)],
      upper: ratings[Math.floor(nBootstrap * 0.975)],
    };
  }

  return ci;
}

// ─── Match Loading ───

function loadAllResults() {
  const matches = [];

  if (!existsSync(RESULTS_DIR)) return matches;

  const agents = readdirSync(RESULTS_DIR).filter(d =>
    existsSync(join(RESULTS_DIR, d)) &&
    readdirSync(join(RESULTS_DIR, d)).length > 0
  );

  // Build pairwise matches from agents who completed the same tasks
  const taskResults = {}; // taskId -> {agent: metrics}

  for (const agent of agents) {
    const agentDir = join(RESULTS_DIR, agent);
    const tasks = readdirSync(agentDir);
    for (const task of tasks) {
      const metricsPath = join(agentDir, task, 'metrics.json');
      if (existsSync(metricsPath)) {
        if (!taskResults[task]) taskResults[task] = {};
        taskResults[task][agent] = JSON.parse(readFileSync(metricsPath, 'utf-8'));
      }
    }
  }

  // Create pairwise matches for each task with 2+ agents
  for (const [task, results] of Object.entries(taskResults)) {
    const agentNames = Object.keys(results);
    for (let i = 0; i < agentNames.length; i++) {
      for (let j = i + 1; j < agentNames.length; j++) {
        matches.push({
          task,
          agent_a: agentNames[i],
          agent_b: agentNames[j],
          score_a: results[agentNames[i]].composite_score,
          score_b: results[agentNames[j]].composite_score,
        });
      }
    }
  }

  return matches;
}

// ─── Main ───

const args = process.argv.slice(2);

if (args.includes('--recalculate')) {
  console.log('🏆 Polyp Benchmark — Recalculating Elo Ratings\n');

  const matches = loadAllResults();

  if (matches.length === 0) {
    console.log('No pairwise results found. Run benchmarks for at least 2 agents first.');
    process.exit(0);
  }

  console.log(`Found ${matches.length} pairwise comparison(s)\n`);

  const ratings = bradleyTerry(matches);
  const ci = bootstrapCI(matches);

  const leaderboard = Object.entries(ratings)
    .map(([agent, elo]) => ({
      agent,
      elo,
      ci_lower: ci[agent]?.lower || elo,
      ci_upper: ci[agent]?.upper || elo,
      matches: matches.filter(m => m.agent_a === agent || m.agent_b === agent).length,
    }))
    .sort((a, b) => b.elo - a.elo);

  console.log('Rank  Agent                  Elo    95% CI           Matches');
  console.log('─'.repeat(65));
  leaderboard.forEach((entry, i) => {
    const rank = `#${i + 1}`.padEnd(6);
    const name = entry.agent.padEnd(23);
    const elo = entry.elo.toString().padStart(4);
    const ci = `[${entry.ci_lower}, ${entry.ci_upper}]`.padEnd(17);
    const matches = entry.matches.toString().padStart(3);
    const stability = entry.matches >= 100 ? '✅' : entry.matches >= 20 ? '🟡' : '🔴';
    console.log(`${rank}${name}${elo}   ${ci}${matches}  ${stability}`);
  });

  const output = {
    updated_at: new Date().toISOString(),
    total_matches: matches.length,
    leaderboard,
    methodology: 'Bradley-Terry with 1000-sample bootstrap CI',
  };

  writeFileSync(LEADERBOARD_PATH, JSON.stringify(output, null, 2));
  console.log(`\n💾 Leaderboard saved to: ${LEADERBOARD_PATH}`);

} else {
  console.log('Usage:');
  console.log('  node elo.mjs --recalculate    Recalculate from all results');
  console.log('\nBenchmark results must be in .agentile/benchmarks/results/{agent}/{task}/metrics.json');
}

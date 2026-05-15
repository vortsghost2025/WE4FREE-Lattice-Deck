#!/usr/bin/env node

/**
 * CI Provenance Gate
 *
 * Validates that provenance interfaces and runtime enforcement exist
 * in the codebase. This script runs in CI to prevent provenance regressions.
 *
 * SCOPE: This script validates the DATA-LAYER provenance enforcement
 * (briefing API responses, contract types, runtime assertions).
 *
 * KNOWN GAP: Chat-layer OUTPUT_PROVENANCE (terminal output by AI agents)
 * is NOT enforceable by this script. Agent terminal output is outside
 * all automated verifiers. This gap is explicitly classified as
 * "not-yet-runtime-enforceable" in AGENTS.md.
 *
 * Classification: Runtime-enforceable (data layer), Not-yet-runtime-enforceable (chat layer)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
let failures = 0;
let passes = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passes++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
    failures++;
  }
}

function fileContains(filePath, pattern, label) {
  const fullPath = join(ROOT, filePath);
  if (!existsSync(fullPath)) {
    check(label, false, `file not found: ${filePath}`);
    return;
  }
  const content = readFileSync(fullPath, 'utf-8');
  check(label, pattern.test(content), `pattern not found in ${filePath}`);
}

console.log('\n=== CI Provenance Gate ===\n');

// 1. Provenance interface exists in contract layer
console.log('1. Contract layer:');
fileContains('src/lib/contracts/briefing.ts', /export interface Provenance/, 'Provenance interface defined');
fileContains('src/lib/contracts/briefing.ts', /agentProvenance:\s*Provenance/, 'agentProvenance field on BriefingResponse');

// 2. Runtime enforcement exists
console.log('2. Runtime enforcement:');
fileContains('src/lib/services/provenance-validator.ts', /export function validateProvenance/, 'validateProvenance function exists');
fileContains('src/lib/services/provenance-validator.ts', /export function assertProvenance/, 'assertProvenance function exists');
fileContains('src/lib/services/provenance-validator.ts', /export class ProvenanceError/, 'ProvenanceError class exists');

// 3. API route wires assertion
console.log('3. API route enforcement:');
fileContains('src/app/api/briefing/route.ts', /assertProvenance/, 'Briefing API route calls assertProvenance');
fileContains('src/app/api/briefing/route.ts', /PROVENANCE_ENFORCEMENT_FAILURE/, 'Returns 500 on provenance failure');

// 4. Journal read-path exists
console.log('4. Journal read-path:');
fileContains('src/lib/services/journal-reader.ts', /export async function readJournalState/, 'readJournalState function exists');
fileContains('src/app/api/briefing/route.ts', /readJournalState/, 'Briefing API route calls readJournalState');

// 5. Tests exist
console.log('5. Test coverage:');
fileContains('tests/services/provenance-validator.test.ts', /validateProvenance/, 'Provenance validator tests exist');
fileContains('tests/services/provenance-validator.test.ts', /assertProvenance/, 'Provenance assertion tests exist');

// 6. AGENTS.md provenance binding
console.log('6. Governance binding:');
fileContains('AGENTS.md', /OUTPUT_PROVENANCE/, 'AGENTS.md references OUTPUT_PROVENANCE');
fileContains('AGENTS.md', /not.yet.runtime.enforceable/i, 'AGENTS.md classifies chat-layer gap honestly');

// 7. Known gap documentation
console.log('7. Known gap classification:');
const agentsContent = existsSync(join(ROOT, 'AGENTS.md')) ? readFileSync(join(ROOT, 'AGENTS.md'), 'utf-8') : '';
check(
  'AGENTS.md documents enforcement status',
  /enforcement/i.test(agentsContent) && /honor.system/i.test(agentsContent),
);
check(
  'AGENTS.md documents aspirational target',
  /aspirational/i.test(agentsContent) && /pre-output.hook|session-start/i.test(agentsContent),
);

// Summary
console.log(`\n=== Results: ${passes} passed, ${failures} failed ===\n`);

if (failures > 0) {
  console.error('PROVENANCE GATE FAILED — provenance enforcement regression detected.\n');
  process.exit(1);
} else {
  console.log('PROVENANCE GATE PASSED — data-layer provenance enforcement intact.\n');
  console.log('NOTE: Chat-layer OUTPUT_PROVENANCE remains not-yet-runtime-enforceable.\n');
  process.exit(0);
}

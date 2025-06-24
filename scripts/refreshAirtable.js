#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(script) {
  const scriptPath = path.join(__dirname, script);
  execSync(`node --loader ts-node/esm ${scriptPath}`, { stdio: 'inherit' });
}

function run() {
  runScript('generateFieldMap.ts');
  runScript('updateCustomActionParams.ts');

  execSync('git add api/resolveFieldMap.ts custom_action_schema.json', { stdio: 'inherit' });

  try {
    execSync('git diff --cached --quiet --exit-code');
    console.log('No changes detected.');
  } catch {
    execSync('git commit -m "chore: refresh Airtable field map and schema"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
  }
}

run();

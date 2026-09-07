/**
 * Test runner — executes the *.test.mjs suites with TypeScript type-stripping
 * enabled so the pure core modules can be imported straight from src/ with no
 * build step.
 *
 * Requires Node >= 22.6 (for --experimental-strip-types). On Node >= 23.6 the
 * flag is a harmless no-op.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const [major, minor] = process.versions.node.split('.').map(Number);
const needsFlag = major < 23 || (major === 23 && minor < 6);
const args = ['--test', '--import', pathToFileURL(join(here, 'register.mjs')).href];
if (needsFlag) args.push('--experimental-strip-types');
for (const f of readdirSync(here)) {
  if (f.endsWith('.test.mjs')) args.push(join(here, f));
}

const res = spawnSync(process.execPath, args, { stdio: 'inherit' });
process.exit(res.status ?? 1);

/**
 * Test runner — runs *.test.mjs with TypeScript type-stripping so the pure core
 * modules import straight from src/ with no build step. Needs Node >= 22.6.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const [major, minor] = process.versions.node.split('.').map(Number);
const needsFlag = major < 23 || (major === 23 && minor < 6);

const args = ['--test', '--import', pathToFileURL(join(here, 'register.mjs')).href];
if (needsFlag) args.push('--experimental-strip-types');
for (const f of readdirSync(here)) if (f.endsWith('.test.mjs')) args.push(join(here, f));

const res = spawnSync(process.execPath, args, { stdio: 'inherit' });
process.exit(res.status ?? 1);

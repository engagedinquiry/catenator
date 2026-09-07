/**
 * Copies the governed source content into this app's asset bundle.
 *
 * build-config.yaml → contentSource.rootDir is "docs" (repo-relative,
 * mode: "pre-authored"). The browser can't read the repo tree, so this script
 * mirrors the six persona folders plus the schema reference folder into
 * src/assets/content/, which src/app/core/build-config.ts (CONTENT_ROOT) points
 * at. Re-run after editing anything under docs/.
 *
 *   node scripts/sync-content.mjs
 */
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..');          // apps/reader-app/output/scripts -> repo root
const srcRoot = join(repoRoot, 'docs');                 // contentSource.rootDir
const destRoot = resolve(here, '../src/assets/content');

const PERSONA_FOLDERS = [
  'creators',
  'tech-writers',
  'knowledge-teams',
  'integrators',
  'engineers',
  'governing-docs'
];
const STANDARD_FOLDER = 'schemas'; // content-source.yaml standardReference.path ("schema/" -> renamed)

rmSync(destRoot, { recursive: true, force: true });
mkdirSync(destRoot, { recursive: true });

for (const folder of [...PERSONA_FOLDERS, STANDARD_FOLDER]) {
  cpSync(join(srcRoot, folder), join(destRoot, folder), { recursive: true });
  console.log(`synced ${folder}/`);
}
console.log(`content root: ${destRoot}`);

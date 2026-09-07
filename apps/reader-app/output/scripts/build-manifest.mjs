/**
 * content.folder-browser micro.scan-at-build-or-load: the folder scan happens
 * here, at build time. This is NOT a hardcoded list — it is produced by reading
 * whatever actually exists under build-config.yaml's contentSource.rootDir.
 *
 * Scans the two roots (content/ and schema/, relative to contentSource.rootDir),
 * writes src/assets/content/manifest.json as:
 *   { "content/": { "<subfolder>": ["<file>", ...] }, "schema/": { ... } }
 * and mirrors every file into src/assets/content/<root><subfolder>/<file> so the
 * browser can fetch it.
 *
 * Add a root here (or a folder under docs/) and it appears in the app with no
 * other change — nothing downstream names a persona, section, topic, or file.
 */
import { readdirSync, statSync, mkdirSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..'); // apps/reader-app/output/scripts -> repo root
const CONTENT_ROOT_DIR = 'docs'; // build-config.yaml → contentSource.rootDir
const ROOTS = ['content/', 'schema/']; // content.folder-browser: the two instances

const srcBase = join(repoRoot, CONTENT_ROOT_DIR);
const destBase = resolve(here, '../src/assets/content');

const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

rmSync(destBase, { recursive: true, force: true });
mkdirSync(destBase, { recursive: true });

const manifest = {};
for (const root of ROOTS) {
  const rootName = root.replace(/\/$/, '');
  const rootDir = join(srcBase, rootName);
  const categories = {};
  for (const sub of readdirSync(rootDir).sort()) {
    const subDir = join(rootDir, sub);
    if (!isDir(subDir)) continue; // ignore loose files at the root level
    const files = readdirSync(subDir)
      .filter((f) => isFile(join(subDir, f)))
      .sort();
    categories[sub] = files;
    cpSync(subDir, join(destBase, rootName, sub), { recursive: true });
  }
  manifest[root] = categories;
}

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

writeFileSync(join(destBase, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const counts = Object.entries(manifest)
  .map(([r, c]) => `${r} ${Object.keys(c).length} categories`)
  .join(', ');
console.log(`manifest: ${counts}`);
console.log(`content root: ${destBase}`);

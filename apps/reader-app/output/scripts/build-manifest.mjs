/**
 * content.browser micro.scan-at-build-or-load: the recursive folder walk happens
 * here, at build time. NOT a hardcoded list — it reads whatever exists under
 * build-config.yaml's contentSource.rootDir for each configured root.
 *
 * Writes src/assets/content/manifest.json:
 *   {
 *     "home": "README.md",
 *     "roots": [
 *       { "id": "personas", "path": "personas/", "navigationMode": "dropdown",
 *         "tree": { "name": "personas", "type": "folder", "children": [ … ] } },
 *       { "id": "schema", "path": "schema/", "navigationMode": "tree", "tree": … }
 *     ]
 *   }
 * and mirrors every file under src/assets/content/<path>. Node children are
 * { name, type: "file" | "folder", children? } — recursive, arbitrary depth.
 */
import { readdirSync, statSync, mkdirSync, rmSync, cpSync, copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..');

// build-config.yaml → contentSource
const ROOT_DIR = 'docs';
const ROOTS = [
  { id: 'personas', path: 'personas/', navigationMode: 'dropdown' },
  { id: 'schema', path: 'schema/', navigationMode: 'tree' }
];

const srcBase = join(repoRoot, ROOT_DIR);
const destBase = resolve(here, '../src/assets/content');

const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

/** Recursive walk — the same check at every level (recursive-not-fixed-depth). */
function walk(absDir, name) {
  const children = readdirSync(absDir).map((entry) => {
    const abs = join(absDir, entry);
    return isDir(abs)
      ? walk(abs, entry)
      : { name: entry, type: 'file' };
  });
  return { name, type: 'folder', children };
}

rmSync(destBase, { recursive: true, force: true });
mkdirSync(destBase, { recursive: true });

// home: docs/README.md, the same mechanism's one-file case
copyFileSync(join(srcBase, 'README.md'), join(destBase, 'README.md'));

const manifest = { home: 'README.md', roots: [] };
for (const root of ROOTS) {
  const rootName = root.path.replace(/\/$/, '');
  const rootAbs = join(srcBase, rootName);
  cpSync(rootAbs, join(destBase, rootName), { recursive: true });
  manifest.roots.push({ ...root, tree: walk(rootAbs, rootName) });
}

writeFileSync(join(destBase, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const summary = manifest.roots
  .map((r) => `${r.id}(${r.navigationMode}): ${r.tree.children.length} entries`)
  .join(', ');
console.log(`manifest: ${summary}`);
console.log(`content root: ${destBase}`);

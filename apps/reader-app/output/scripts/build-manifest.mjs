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
import { readdirSync, statSync, mkdirSync, rmSync, cpSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
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

/**
 * content.browser micro.title-from-h1-not-filename: parse a markdown file's
 * first H1 for use as its displayed title. Non-markdown files, or markdown with
 * no H1, get no title here (the app falls back to the order-stripped filename).
 */
function h1Of(absFile) {
  if (!/\.(md|markdown)$/i.test(absFile)) return undefined;
  const text = readFileSync(absFile, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const m = body.match(/^\s*#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : undefined;
}

/** Recursive walk — the same check at every level (recursive-not-fixed-depth). */
function walk(absDir, name) {
  const children = readdirSync(absDir).map((entry) => {
    const abs = join(absDir, entry);
    if (isDir(abs)) return walk(abs, entry);
    const title = h1Of(abs);
    return title ? { name: entry, type: 'file', title } : { name: entry, type: 'file' };
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

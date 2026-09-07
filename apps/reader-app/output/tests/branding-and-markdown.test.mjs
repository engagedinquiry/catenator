import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, BRAND_LINE, PRIOR_NAMES } from '../src/app/brand/brand.ts';
import { renderMarkdown } from '../src/app/core/markdown.ts';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'assets') continue;
      out.push(...walk(p));
    } else if (/\.(ts|html|css)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

test('branding: product name comes from build-config, present once as a literal', () => {
  assert.equal(BRAND.productName, 'Catenator Reader');
  assert.equal(BRAND_LINE, 'Catenator Reader · One idea, read your way');
  // branding.rename micro.single-source-of-truth: the product name must not
  // appear as a literal (quoted in code, or bare in markup) anywhere but brand.ts.
  const literals = walk(srcDir).filter(
    (f) => !f.endsWith(join('brand', 'brand.ts')) && readFileSync(f, 'utf8').includes(BRAND.productName)
  );
  assert.deepEqual(literals, [], `product name hardcoded outside brand.ts: ${literals}`);
});

test('branding: no retired Catenator-family name appears in source (branding.rename)', () => {
  for (const f of walk(srcDir)) {
    const text = readFileSync(f, 'utf8');
    if (f.endsWith(join('brand', 'brand.ts'))) continue; // the scan list itself
    for (const prior of PRIOR_NAMES) {
      assert.ok(!text.includes(prior), `${prior} found in ${f}`);
    }
  }
});

test('markdown: headings, lists, code and links render; raw HTML is escaped', () => {
  const html = renderMarkdown(
    ['# Title', '', 'A **bold** word and `code`.', '', '- one', '- two', '', '<script>x</script>'].join('\n')
  );
  assert.match(html, /<h1>Title<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<li>one<\/li>/);
  assert.match(html, /&lt;script&gt;/);
  assert.ok(!html.includes('<script>'));
});

test('markdown: raw block-level HTML banner (incl. <img>) is dropped, not shown', () => {
  const html = renderMarkdown(
    ['<p align="left">', '  <img src="../brand/logo.png" alt="Catenator">', '</p>', '', '# Catenator'].join('\n')
  );
  assert.match(html, /<h1>Catenator<\/h1>/);
  assert.ok(!html.includes('&lt;p align'));
  assert.ok(!html.includes('logo.png'));
});

test('markdown: inline image syntax ![alt](src) still renders', () => {
  assert.match(renderMarkdown('![diagram](d.png)'), /<img alt="diagram" src="d\.png">/);
});

test('markdown: leading YAML frontmatter is stripped, not rendered', () => {
  const html = renderMarkdown(['---', 'title: X', 'tags:', '  - a', '---', '', '# Body'].join('\n'));
  assert.match(html, /<h1>Body<\/h1>/);
  assert.ok(!html.includes('title: X'));
});

test('markdown: fenced code block is preserved verbatim and escaped', () => {
  const html = renderMarkdown(['```ts', 'const a = 1 < 2;', '```'].join('\n'));
  assert.match(html, /<pre class="code" data-lang="ts"><code>const a = 1 &lt; 2;<\/code><\/pre>/);
});

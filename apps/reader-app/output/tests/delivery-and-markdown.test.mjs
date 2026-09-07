import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliver, deliverHome } from '../src/app/core/delivery.ts';
import { renderMarkdown, renderFile } from '../src/app/core/markdown.ts';

// stand-in ContentBrowser: `files` maps "<rootId>/<url path>" -> real path segments.
const mk = (files) => ({
  resolve: (rootId, urlSegs) => {
    const key = [rootId, ...urlSegs].join('/');
    return key in files ? { node: { type: 'file', name: files[key].at(-1) }, realPath: files[key] } : null;
  },
  resolveUrl: (rootId, real) => ['assets/content', rootId, ...real].join('/'),
  homeUrl: () => 'assets/content/README.md'
});

test('delivery: returns exactly the routed file; URL keeps order prefixes, drops .md', async () => {
  const b = mk({ 'schema/3-views/3.1-interface': ['3-views', '3.1-interface.md'] });
  const res = await deliver(b, 'schema', ['3-views', '3.1-interface'], async (u) => {
    assert.equal(u, 'assets/content/schema/3-views/3.1-interface.md');
    return '# Interface';
  });
  assert.equal(res.type, 'content');
  assert.equal(res.name, '3.1-interface.md');
});

test('delivery: missing path -> explicit not-found, no fetch', async () => {
  const b = mk({});
  let fetched = false;
  const res = await deliver(b, 'personas', ['ghost', 'x'], async () => {
    fetched = true;
    return '';
  });
  assert.equal(res.type, 'not-found');
  assert.equal(res.path, 'personas/ghost/x');
  assert.equal(fetched, false);
});

test('delivery: fetch failure on a real node -> not-found, never blank', async () => {
  const b = mk({ 'personas/creators/refraction': ['creators', 'refraction.md'] });
  const res = await deliver(b, 'personas', ['creators', 'refraction'], async () => {
    throw new Error('500');
  });
  assert.equal(res.type, 'not-found');
});

test('delivery: home README is the one-file case', async () => {
  const res = await deliverHome(mk(new Set()), async (u) => {
    assert.equal(u, 'assets/content/README.md');
    return '# Catenator';
  });
  assert.equal(res.type, 'content');
});

test('markdown: GFM pipe table -> real <table>, not literal pipes', () => {
  const md = ['| Route | Shows |', '| --- | :--: |', '| `/` | home |', '| `/x` | other |'].join('\n');
  const html = renderMarkdown(md);
  assert.match(html, /<table><thead><tr><th>Route<\/th><th style="text-align:center">Shows<\/th>/);
  assert.match(html, /<tbody><tr><td>.*<\/td><td style="text-align:center">home<\/td><\/tr>/);
  assert.ok(!html.includes('| Route |'));
});

test('markdown: renderFile picks renderer by extension; external links get target=_blank', () => {
  assert.match(renderFile('a.yaml', 'k: v'), /<pre class="code plain">/);
  assert.match(renderMarkdown('[x](https://e.com)'), /target="_blank" rel="noopener"/);
  assert.ok(!/target="_blank"/.test(renderMarkdown('[x](creators/README.md)')));
});

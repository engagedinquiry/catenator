import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliver } from '../src/app/core/delivery.ts';
import { renderFile, renderMarkdown } from '../src/app/core/markdown.ts';

// A tiny stand-in for FolderBrowser — deliver() only needs fileUrl().
const browser = {
  fileUrl: (root, category, file) =>
    ['assets/content', root, category, file].join('/').replace(/\/{2,}/g, '/').replace(/\/+$/, '')
};

test('delivery: builds the URL only from the three passed-in values', async () => {
  const seen = [];
  const res = await deliver(browser, 'content/', 'creators', 'README.md', async (u) => {
    seen.push(u);
    return '# hi';
  });
  assert.deepEqual(seen, ['assets/content/content/creators/README.md']);
  assert.equal(res.ok, true);
  assert.equal(res.text, '# hi');
});

test('delivery: missing any selection -> not ok, no fetch', async () => {
  let called = false;
  const res = await deliver(browser, 'content/', '', '', async () => {
    called = true;
    return '';
  });
  assert.equal(res.ok, false);
  assert.equal(called, false);
});

test('delivery: fetch failure -> worded error, never silent', async () => {
  const res = await deliver(browser, 'schema/', '1-founding-statement', 'x.md', async () => {
    throw new Error('404');
  });
  assert.equal(res.ok, false);
  assert.match(res.message, /Could not load/);
});

test('markdown: renderFile picks renderer by extension', () => {
  assert.match(renderFile('a.md', '# H'), /<h1>H<\/h1>/);
  const yaml = renderFile('b.yaml', 'key: value\nlist:\n  - 1');
  assert.match(yaml, /<pre class="code plain"><code>key: value/);
  assert.ok(!yaml.includes('<h1>'));
});

test('markdown: raw HTML in prose is escaped', () => {
  assert.match(renderMarkdown('text <script>x</script>'), /&lt;script&gt;/);
});

test('markdown: GFM pipe table renders as a real <table> (full-markdown-rendering)', () => {
  const md = ['| Route | Renders |', '| --- | :---: |', '| `/` | home |', '| `/x` | other |'].join('\n');
  const html = renderMarkdown(md);
  assert.match(html, /<table>/);
  assert.match(html, /<thead><tr><th>Route<\/th><th style="text-align:center">Renders<\/th><\/tr><\/thead>/);
  assert.match(html, /<tbody><tr><td>.*<\/td><td style="text-align:center">home<\/td><\/tr>/);
  assert.ok(!html.includes('| Route |'), 'literal pipes leaked into output');
});

test('delivery: home README is the one-file case — empty root/category allowed', async () => {
  const res = await deliver(browser, '', '', 'README.md', async (u) => {
    assert.equal(u, 'assets/content/README.md');
    return '# Catenator';
  });
  assert.equal(res.ok, true);
});

/**
 * Minimal, dependency-free Markdown -> HTML renderer with the GFM constructs the
 * governed docs use: ATX headings, paragraphs, lists, fenced code, blockquotes,
 * rules, inline code/bold/italic/links, and GFM pipe tables (content.browser
 * micro.full-markdown-rendering). All prose text is HTML-escaped first.
 *
 * ui.edge-cases.external-links-new-tab: http(s) links get target="_blank"
 * rel="noopener". Internal relative links are left as-is (navigation.routing
 * forbids intercepting them; a hard click just reloads the SPA).
 *
 * Non-markdown files render verbatim via renderPlain().
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, src) => `<img alt="${alt}" src="${src}">`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt, href) => {
    const scheme = href.match(/^\s*([a-z][a-z0-9+.-]*):/i);
    const dangerous = scheme && !/^(https?|mailto)$/i.test(scheme[1]);
    const safe = dangerous ? '#' : href;
    const external = /^https?:/i.test(safe);
    return `<a href="${safe}"${external ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  out = out.replace(/_([^_]+)_/g, '<em>$1</em>');
  return out;
}

function stripFrontmatter(md: string): string {
  const m = md.match(/^﻿?---\n[\s\S]*?\n---\n?/);
  return m ? md.slice(m[0].length) : md;
}

export function renderPlain(text: string): string {
  return `<pre class="code plain"><code>${esc(text)}</code></pre>`;
}

export function renderMarkdown(md: string): string {
  const lines = stripFrontmatter(md.replace(/^﻿/, '').replace(/\r\n/g, '\n')).split('\n');
  const html: string[] = [];
  let i = 0;
  const listStack: Array<'ul' | 'ol'> = [];
  const closeLists = () => {
    while (listStack.length) html.push(`</${listStack.pop()}>`);
  };

  const splitRow = (r: string) =>
    r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^```(.*)$/);
    if (fence) {
      closeLists();
      const lang = fence[1].trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html.push(`<pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^\s*$/.test(line)) {
      closeLists();
      i++;
      continue;
    }

    if (/^\s*<\/?(p|div|span|section|figure|picture|source|br|hr|img)\b[^>]*>\s*$/i.test(line)) {
      closeLists();
      i++;
      continue;
    }

    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      closeLists();
      html.push('<hr>');
      i++;
      continue;
    }

    // GFM pipe table
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/.test(lines[i + 1])
    ) {
      closeLists();
      const headers = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) =>
        /^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : /^:-+/.test(c) ? 'left' : ''
      );
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const cell = (tag: string, text: string, idx: number) => {
        const a = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : '';
        return `<${tag}${a}>${inline(text)}</${tag}>`;
      };
      const thead = `<thead><tr>${headers.map((c, x) => cell('th', c, x)).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${headers.map((_h, x) => cell('td', r[x] ?? '', x)).join('')}</tr>`)
        .join('')}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeLists();
      html.push(`<h${h[1].length}>${inline(h[2].trim())}</h${h[1].length}>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeLists();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    const li = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordered = /\d+\./.test(li[2]);
      const want: 'ul' | 'ol' = ordered ? 'ol' : 'ul';
      if (listStack[listStack.length - 1] !== want) {
        closeLists();
        listStack.push(want);
        html.push(`<${want}>`);
      }
      html.push(`<li>${inline(li[3])}</li>`);
      i++;
      continue;
    }

    closeLists();
    const buf: string[] = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,6}\s|>\s?|```|(\s*[-*_]){3,}\s*$)/.test(lines[i]) &&
      !/^(\s*)([-*+]|\d+\.)\s+/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }

  closeLists();
  return html.join('\n');
}

export function renderFile(name: string, text: string): string {
  return /\.(md|markdown)$/i.test(name) ? renderMarkdown(text) : renderPlain(text);
}

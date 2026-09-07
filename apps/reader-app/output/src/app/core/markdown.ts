/**
 * Minimal, dependency-free markdown -> HTML renderer.
 *
 * The reference application (syntaxia-studio) ships no markdown library, and
 * style.visual-theme.mustNever forbids adding a dependency without first
 * checking the reference — so this is a small hand-rolled renderer covering the
 * constructs actually used by the governed docs: ATX headings, paragraphs,
 * unordered / ordered lists, fenced code blocks, blockquotes, horizontal rules,
 * and inline code / bold / italic / links. All text is HTML-escaped first, so
 * raw HTML in a source file is shown literally, never executed.
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
  // inline code first so its contents are not further formatted
  out = out.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, src) => `<img alt="${alt}" src="${src}">`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt, href) => {
    const safe = /^(https?:|mailto:|#|\.?\/)/.test(href) ? href : '#';
    return `<a href="${safe}"${safe.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  out = out.replace(/_([^_]+)_/g, '<em>$1</em>');
  return out;
}

/** Strip a leading YAML frontmatter block (`---` … `---`) if present. */
function stripFrontmatter(md: string): string {
  const m = md.match(/^﻿?---\n[\s\S]*?\n---\n?/);
  return m ? md.slice(m[0].length) : md;
}

export function renderMarkdown(md: string): string {
  const lines = stripFrontmatter(md.replace(/^﻿/, '').replace(/\r\n/g, '\n')).split('\n');
  const html: string[] = [];
  let i = 0;

  const listStack: Array<'ul' | 'ol'> = [];
  const closeLists = () => {
    while (listStack.length) html.push(`</${listStack.pop()}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    const fence = line.match(/^```(.*)$/);
    if (fence) {
      closeLists();
      const lang = fence[1].trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      html.push(
        `<pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(buf.join('\n'))}</code></pre>`
      );
      continue;
    }

    // blank line
    if (/^\s*$/.test(line)) {
      closeLists();
      i++;
      continue;
    }

    // drop a line that is nothing but a raw block-level HTML tag (opening or
    // closing wrapper, or a bare <img> banner). The governed docs open with a
    // <p align><img></p> logo block that has no place in the app chrome; the
    // text renderer stays HTML-safe (inline tags in prose are still escaped),
    // and markdown image syntax ![alt](src) still works via inline().
    if (/^\s*<\/?(p|div|span|section|figure|picture|source|br|hr|img)\b[^>]*>\s*$/i.test(line)) {
      closeLists();
      i++;
      continue;
    }

    // horizontal rule
    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      closeLists();
      html.push('<hr>');
      i++;
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeLists();
      const level = h[1].length;
      html.push(`<h${level}>${inline(h[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      closeLists();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // list item
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

    // paragraph (gather until blank / block start)
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

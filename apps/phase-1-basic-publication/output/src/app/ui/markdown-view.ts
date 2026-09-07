import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A deliberately small markdown renderer for the topic Preview tab — headings,
 * bold/italic/code, unordered lists, paragraphs. No library (style.visual-theme
 * mustNever "Introduce a new icon library or dependency ...").
 *
 * variable.substitution mustNever "Resolve or substitute a variable's value
 * live": {{name}} tokens are rendered VERBATIM here — Preview shows the raw
 * token, never the value.
 */
@Component({
  selector: 'app-markdown-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="md" [innerHTML]="html()"></div>`,
  styles: [
    `
      .md { font-size: 0.875rem; color: var(--text-body); line-height: 1.6; }
      .md h1, .md h2, .md h3 { font-family: var(--font-display); color: var(--text-title); margin: 18px 0 6px; }
      .md h1 { font-size: 1.15rem; }
      .md h2 { font-size: 1rem; }
      .md h3 { font-size: 0.9rem; }
      .md code { font-family: var(--font-mono); font-size: 0.82em; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
      .md ul { margin: 8px 0; padding-left: 20px; }
      .md p { margin: 8px 0; }
    `
  ]
})
export class MarkdownView {
  readonly source = input<string>('');

  readonly html = computed(() => render(this.source()));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

function render(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  for (const line of lines) {
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const li = /^\s*[-*]\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
    } else if (li) {
      flushPara();
      list.push(li[1]);
    } else if (line.trim() === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return out.join('\n');
}

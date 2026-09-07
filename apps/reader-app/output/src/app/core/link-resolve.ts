/**
 * navigation.routing micro.relative-link-resolution — pure path arithmetic only.
 *
 * Given the directory the currently displayed file lives in (as real on-disk
 * path segments) and a relative href as authored in the markdown, fold "./" and
 * "../" the way any browser resolves a relative URL. No parsing of the link's
 * text, no guessing what it "means" — segment arithmetic and nothing else.
 */
export function resolveRelativePath(baseDir: string[], href: string): string[] {
  const out = [...baseDir];
  for (const seg of href.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (out.length) out.pop();
      continue;
    }
    out.push(seg);
  }
  return out;
}

/** Classify an href the way navigation.routing needs to. */
export type HrefKind = 'external' | 'anchor' | 'absolute' | 'relative';

export function classifyHref(href: string): HrefKind {
  if (/^(https?:|mailto:)/i.test(href)) return 'external';
  if (href.startsWith('#')) return 'anchor';
  if (href.startsWith('/')) return 'absolute';
  return 'relative';
}

/** Strip a trailing file-type extension from the last path segment (URL form). */
export function toRouteUrl(realSegments: string[]): string {
  if (realSegments.length === 0) return '/';
  const last = realSegments[realSegments.length - 1].replace(/\.[^./]+$/, '');
  return '/' + [...realSegments.slice(0, -1), last].map(encodeURIComponent).join('/');
}

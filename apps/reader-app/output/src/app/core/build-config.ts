/**
 * The one place build-config.yaml's values enter the app.
 *
 * build-config.yaml → contentSource.rootDir is "docs" (repo-relative). At
 * runtime the browser cannot read the repo's docs/ tree, so
 * `scripts/sync-content.mjs` copies it into `src/assets/content/` and this
 * constant points there. Every persona sourceFolder (persona-catalog) and every
 * topicMap / standardReference path (content-source) is joined onto
 * CONTENT_ROOT — nothing else hardcodes a path. Repoint CONTENT_ROOT (and the
 * sync script's source) at a different tree and the rest of the app is
 * unchanged.
 */
export const CONTENT_ROOT = 'assets/content';

/** Join a path segment onto the content root, collapsing slashes. */
export function resolveContentPath(...segments: string[]): string {
  return [CONTENT_ROOT, ...segments]
    .join('/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/+$/, '');
}

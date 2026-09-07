/**
 * The one place build-config.yaml's contentSource.rootDir enters the app.
 *
 * rootDir is "docs" (repo-relative). The browser can't read the repo tree, so
 * scripts/build-manifest.mjs mirrors docs/content/ and docs/schema/ into
 * src/assets/content/ and this constant points there. Every path
 * (content.folder-browser, delivery.request-response) is joined onto
 * CONTENT_ROOT — nothing else names a path.
 */
export const CONTENT_ROOT = 'assets/content';

export function resolveContentPath(...segments: string[]): string {
  return [CONTENT_ROOT, ...segments]
    .join('/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/+$/, '');
}

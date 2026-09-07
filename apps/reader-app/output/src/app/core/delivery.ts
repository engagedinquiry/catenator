import type { ContentBrowser } from './content-browser';

/**
 * delivery.request-response — return a file's content for the current route, or
 * an explicit not-found result.
 *
 * contractShape: input [rootId, path] -> markdownContent | { type: 'not-found', path }
 *
 * mustNever:
 *  - return content other than what the route specifies -> the fetch URL comes
 *     only from browser.resolveUrl() for the resolved real path.
 *  - return a blank result for a missing file without an explicit not-found ->
 *     a missing node, a non-file node, or a fetch failure all yield not-found.
 */
export type DeliveryResult =
  | { type: 'content'; text: string; name: string }
  | { type: 'not-found'; path: string };

export async function deliver(
  browser: ContentBrowser,
  rootId: string,
  urlSegments: string[],
  fetchText: (url: string) => Promise<string> = defaultFetchText
): Promise<DeliveryResult> {
  const path = [rootId, ...urlSegments].join('/');
  const found = browser.resolve(rootId, urlSegments);
  if (!found || found.node.type !== 'file') {
    return { type: 'not-found', path };
  }
  try {
    const text = await fetchText(browser.resolveUrl(rootId, found.realPath));
    return { type: 'content', text, name: found.node.name };
  } catch {
    return { type: 'not-found', path };
  }
}

/** The home README — the one-file case, no root. */
export async function deliverHome(
  browser: ContentBrowser,
  fetchText: (url: string) => Promise<string> = defaultFetchText
): Promise<DeliveryResult> {
  try {
    return { type: 'content', text: await fetchText(browser.homeUrl()), name: 'README.md' };
  } catch {
    return { type: 'not-found', path: 'README.md' };
  }
}

async function defaultFetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

import type { FolderBrowser } from './folder-browser';

/**
 * delivery.request-response — return the file's content for the currently
 * selected root + category + file.
 *
 * contractShape: input [activeRoot, selectedCategory, selectedFile] -> markdownContent
 *
 * mustNever:
 *  - "Return content other than what view.state currently has selected" -> the
 *     URL is built only from the three passed-in values, via FolderBrowser.
 *  - "Read from or write to a URL" (as navigation) -> no route params; the
 *     inputs come straight from view.state (micro.reads-from-state-not-url).
 */
export type DeliveryResult =
  | { ok: true; text: string; file: string }
  | { ok: false; message: string };

export async function deliver(
  browser: FolderBrowser,
  root: string,
  category: string,
  file: string,
  fetchText: (url: string) => Promise<string> = defaultFetchText
): Promise<DeliveryResult> {
  // root + category are empty only for the home README (the one-file case);
  // any other view requires all three.
  if (!file || ((root || category) && !(root && category))) {
    return { ok: false, message: 'Nothing selected.' };
  }
  try {
    const text = await fetchText(browser.fileUrl(root, category, file));
    return { ok: true, text, file };
  } catch {
    return { ok: false, message: `Could not load ${category}/${file}.` };
  }
}

async function defaultFetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

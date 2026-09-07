import { Injectable, signal } from '@angular/core';
import {
  Manifest,
  RootConfig,
  TreeNode,
  displayName,
  displayTitle,
  orderSort,
  resolveNode,
  sortChildren,
  urlSegmentFor
} from './content-tree';

export { displayName, displayTitle, orderSort, urlSegmentFor };
export type { TreeNode, RootConfig };

/** content.browser: a folder's README.md child, if it has one (its default content). */
export function folderReadme(folder: TreeNode | null): TreeNode | null {
  if (!folder || folder.type !== 'folder') return null;
  return (folder.children ?? []).find((c) => c.type === 'file' && /^readme\.md$/i.test(c.name)) ?? null;
}

/**
 * content.browser — one recursive mechanism for walking pre-authored folders of
 * arbitrary depth. Per-root presentation (dropdown vs tree) is a config value
 * carried in the manifest, from build-config.yaml's contentSource.roots — never
 * hardcoded by root name here. All tree logic lives in content-tree.ts (pure).
 *
 * URLs mirror the folder path with order prefixes kept and only the trailing
 * file-type extension dropped (so a bookmarked URL never 404s on a static host).
 *
 * mustNever:
 *  - hardcode a persona/topic/filename or assumed depth -> from manifest.json.
 *  - hardcode a root's navigationMode -> `RootConfig.navigationMode`.
 *  - hardcode a source root path -> `RootConfig.path` + `resolveUrl()`.
 *  - display an order prefix -> `displayName()` (kept for URL + sort).
 */
const CONTENT_ROOT = 'assets/content';

@Injectable({ providedIn: 'root' })
export class ContentBrowser {
  private manifest = signal<Manifest | null>(null);
  readonly ready = signal(false);
  readonly error = signal<string>('');

  async load(): Promise<void> {
    if (this.manifest()) return;
    try {
      const res = await fetch(`${CONTENT_ROOT}/manifest.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.manifest.set((await res.json()) as Manifest);
      this.ready.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'unknown');
    }
  }

  homeUrl(): string {
    return `${CONTENT_ROOT}/${this.manifest()?.home ?? 'README.md'}`;
  }

  roots(): RootConfig[] {
    return this.manifest()?.roots ?? [];
  }
  root(id: string): RootConfig | undefined {
    return this.roots().find((r) => r.id === id);
  }

  /** Immediate children of a real path within a root, order-sorted. */
  children(rootId: string, realSegments: string[]): TreeNode[] | null {
    const found = resolveNode(this.root(rootId)?.tree ?? null, realSegments);
    if (!found || found.node.type !== 'folder') return null;
    return sortChildren(found.node.children ?? []);
  }

  /** Resolve URL segments (extensions stripped) to the node + its real path. */
  resolve(rootId: string, urlSegments: string[]): { node: TreeNode; realPath: string[] } | null {
    return resolveNode(this.root(rootId)?.tree ?? null, urlSegments);
  }

  /** The README node of a folder at a real path, or null. */
  readmeAt(rootId: string, realSegments: string[]): TreeNode | null {
    return folderReadme(resolveNode(this.root(rootId)?.tree ?? null, realSegments)?.node ?? null);
  }

  isFile(rootId: string, urlSegments: string[]): boolean {
    return this.resolve(rootId, urlSegments)?.node.type === 'file';
  }

  /** Fetch URL for a file, from its real on-disk path. */
  resolveUrl(rootId: string, realSegments: string[]): string {
    const root = this.root(rootId);
    return [CONTENT_ROOT, root?.path.replace(/\/$/, ''), ...realSegments].filter(Boolean).join('/');
  }
}

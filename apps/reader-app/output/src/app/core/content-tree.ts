/**
 * content.browser — the pure tree logic (no Angular), so it is unit-testable
 * and shared by ContentBrowser and the build.
 *
 * micro.strip-order-prefix-for-display / numeric-sort-by-order-prefix:
 * `displayName` removes the leading order token for display only; `orderSort`
 * sorts by it numerically, unprefixed entries last.
 */
export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  /** a markdown file's first H1 (build-manifest.mjs), used as its display title. */
  title?: string;
  children?: TreeNode[];
}
export interface RootConfig {
  id: string;
  path: string;
  navigationMode: 'dropdown' | 'tree';
  tree: TreeNode;
}
export interface Manifest {
  home: string;
  roots: RootConfig[];
}

/** "2-descriptors" -> "descriptors"; "3.1-interface.md" -> "interface.md". */
export function displayName(name: string): string {
  return name.replace(/^\d+(?:\.\d+)*[-.\s]+/, '') || name;
}

/**
 * content.browser micro.sentence-case-folder-labels: a folder's displayed label,
 * after order-prefix stripping — hyphens become spaces, first letter capitalized
 * (e.g. a two-word hyphenated folder becomes a capitalized two-word phrase).
 * Folders only, never file titles (those use their H1).
 */
export function folderLabel(name: string): string {
  const s = displayName(name).replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * content.browser micro.title-from-h1-not-filename: the label shown for a node
 * everywhere (nav entry, browser tab). A markdown file's first H1 wins; the
 * fallback is the order-stripped filename with its extension dropped. Folders
 * use the sentence-cased order-stripped folder name.
 */
export function displayTitle(node: TreeNode): string {
  if (node.type === 'folder') return folderLabel(node.name);
  return node.title ?? displayName(node.name).replace(/\.[^.]+$/, '');
}

/**
 * content.browser micro.first-file-is-folder-default-content: a folder's default
 * content is whichever file sorts FIRST (numeric-sort-by-order-prefix) — never a
 * filename match against "README" or any other name. Ordering, not naming.
 */
export function firstSortedFile(folder: TreeNode | null): TreeNode | null {
  if (!folder || folder.type !== 'folder') return null;
  return sortChildren(folder.children ?? []).find((c) => c.type === 'file') ?? null;
}

/** Numeric sort by order prefix (2 before 10, 3.1 before 3.2); unprefixed last. */
export function orderSort(a: string, b: string): number {
  const parse = (n: string) => {
    const m = n.match(/^(\d+(?:\.\d+)*)/);
    return m ? m[1].split('.').map(Number) : null;
  };
  const pa = parse(a);
  const pb = parse(b);
  if (pa && pb) {
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] ?? 0) - (pb[i] ?? 0);
      if (d) return d;
    }
    return a.localeCompare(b);
  }
  if (pa) return -1;
  if (pb) return 1;
  return a.localeCompare(b);
}

export function sortChildren(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((x, y) => orderSort(x.name, y.name));
}

/**
 * A file's real name minus its type extension — used for the URL segment only.
 * The order prefix stays (it's part of the real path). "3.1-interface.md" ->
 * "3.1-interface"; a folder name is returned unchanged.
 */
export function urlSegmentFor(node: TreeNode): string {
  return node.type === 'folder' ? node.name : node.name.replace(/\.[^.]+$/, '');
}

/** Match a URL segment to a child: exact name first, then a file by its stem. */
function matchChild(children: TreeNode[], seg: string): TreeNode | null {
  return (
    children.find((c) => c.name === seg) ??
    children.find((c) => c.type === 'file' && urlSegmentFor(c) === seg) ??
    null
  );
}

/**
 * Walk a root's tree by URL segments (extensions stripped). Returns the node and
 * its real on-disk path, or null (not-found).
 */
export function resolveNode(
  tree: TreeNode | null,
  urlSegments: string[]
): { node: TreeNode; realPath: string[] } | null {
  let node = tree;
  const realPath: string[] = [];
  for (const seg of urlSegments) {
    if (!node || node.type !== 'folder') return null;
    const next = matchChild(node.children ?? [], seg);
    if (!next) return null;
    realPath.push(next.name);
    node = next;
  }
  return node ? { node, realPath } : null;
}

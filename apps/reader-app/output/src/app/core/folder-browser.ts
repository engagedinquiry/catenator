import { Injectable, signal } from '@angular/core';
import { resolveContentPath } from './build-config';

/**
 * content.folder-browser — one generic mechanism for browsing a folder of
 * subfolders of files, used identically for content/ and schema/.
 *
 * mustNever:
 *  - "Hardcode a persona name, topic name, or filename" -> every label comes
 *     from manifest.json, which build-manifest.mjs generates by reading disk.
 *  - "Treat content/ and schema/ as needing different logic" -> categories()/
 *     files()/fileUrl() take the root as a parameter; there is no per-root branch.
 *  - "Hardcode a source root path" -> paths go through resolveContentPath().
 *
 * micro.folder-name-is-the-label: the strings returned here ARE the on-disk
 * folder / file names, passed straight to the template.
 */
type Manifest = Record<string, Record<string, string[]>>;

@Injectable({ providedIn: 'root' })
export class FolderBrowser {
  private manifest = signal<Manifest | null>(null);
  private loadError = signal<string>('');

  readonly ready = signal(false);
  readonly error = this.loadError.asReadonly();

  async load(): Promise<void> {
    if (this.manifest()) return;
    try {
      const res = await fetch(resolveContentPath('manifest.json'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.manifest.set((await res.json()) as Manifest);
      this.ready.set(true);
    } catch (e) {
      this.loadError.set(e instanceof Error ? e.message : 'unknown');
    }
  }

  /** The roots the manifest was built for (e.g. "content/", "schema/"). */
  roots(): string[] {
    return Object.keys(this.manifest() ?? {});
  }

  /** Immediate subfolders of a root — each is a category the reader can pick. */
  categories(root: string): string[] {
    return Object.keys(this.manifest()?.[root] ?? {});
  }

  /** Files inside a selected subfolder. */
  files(root: string, category: string): string[] {
    return this.manifest()?.[root]?.[category] ?? [];
  }

  /** URL for a selected file's raw content. */
  fileUrl(root: string, category: string, file: string): string {
    return resolveContentPath(root, category, file);
  }
}

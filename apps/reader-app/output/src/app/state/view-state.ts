import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ContentBrowser, displayName, displayTitle, urlSegmentFor } from '../core/content-browser';
import type { TreeNode } from '../core/content-browser';
import { deliver, deliverHome, DeliveryResult } from '../core/delivery';
import { pageTitle } from '../brand/brand';

export type NavMode = 'none' | 'persona' | 'schema';

const PERSONA_ROOT = 'personas';
const SCHEMA_ROOT = 'schema';

/**
 * view.state — the nav-panel state machine, driven entirely by the URL
 * (navigation.routing). `applyRoute()` is the single entry point: in-app
 * controls navigate the router, and a direct/bookmarked load hits the same
 * `applyRoute()` — so both paths produce identical state (direct-load-works).
 *
 * mustNever:
 *  - show persona topics AND the schema tree together -> `mode` is one value;
 *     the panel's lower section renders on `mode` alone (mutual-exclusivity).
 *  - leave a stale active state after switching -> every applyRoute() fully
 *     rebuilds mode / persona / path (bidirectional-reset).
 *  - leave the open file/folder unmarked -> `selectedSegments` + `isActive*`.
 *
 * `selectedSegments` holds the REAL on-disk path; URLs drop only the trailing
 * file extension.
 */
@Injectable({ providedIn: 'root' })
export class ViewState {
  readonly browser = inject(ContentBrowser);
  private router = inject(Router);
  private title = inject(Title);

  readonly mode = signal<NavMode>('none');
  readonly selectedPersona = signal<string | null>(null);
  readonly selectedSegments = signal<string[]>([]);

  readonly loading = signal(false);
  readonly result = signal<DeliveryResult | null>(null);
  readonly expanded = signal<Set<string>>(new Set());

  readonly personaOptions = computed(() => this.browser.root(PERSONA_ROOT)?.tree.children ?? []);

  async applyRoute(url: string): Promise<void> {
    const clean = url.split('?')[0].split('#')[0];
    const segs = clean.split('/').map(decodeURIComponent).filter(Boolean);

    if (segs.length === 0) {
      this.set('none', null, []);
      await this.loadHome();
      this.title.setTitle(pageTitle([]));
      return;
    }

    const [root, ...rest] = segs;

    if (root === PERSONA_ROOT) {
      const found = rest.length ? this.browser.resolve(PERSONA_ROOT, rest) : null;

      if (rest.length >= 2) {
        if (found?.node.type === 'file') {
          this.set('persona', rest[0], found.realPath);
          await this.loadFile(PERSONA_ROOT, found.realPath);
          this.setTitleFor(found.node);
        } else {
          this.set('persona', rest[0], rest);
          this.notFound(clean);
        }
        return;
      }

      // /personas/<folder>: mode persona, topic list shown, AND the folder's
      // README.md renders immediately — no "pick a topic" placeholder
      // (view.state.readme-renders-immediately-on-persona-select).
      const folder = rest[0] ?? null;
      const readme = folder ? this.browser.readmeAt(PERSONA_ROOT, [folder]) : null;
      if (folder && readme) {
        const real = [folder, readme.name];
        this.set('persona', folder, real);
        await this.loadFile(PERSONA_ROOT, real);
        this.setTitleFor(readme);
      } else {
        this.set('persona', folder, folder ? [folder] : []);
        this.result.set(null);
        this.loading.set(false);
        this.title.setTitle(pageTitle(folder ? [displayName(folder)] : []));
      }
      return;
    }

    if (root === SCHEMA_ROOT) {
      const found = rest.length ? this.browser.resolve(SCHEMA_ROOT, rest) : { node: null, realPath: [] as string[] };
      if (rest.length && !found) {
        this.set('schema', null, rest);
        this.notFound(clean);
        this.title.setTitle(pageTitle(['Not found']));
        return;
      }
      const real = found?.realPath ?? [];
      this.set('schema', null, real);
      this.autoExpand(real);
      if (found?.node?.type === 'file') {
        await this.loadFile(SCHEMA_ROOT, real);
        this.setTitleFor(found.node);
      } else {
        this.result.set(null);
        this.loading.set(false);
        this.title.setTitle(pageTitle(real.map(displayName).reverse()));
      }
      return;
    }

    this.set('none', null, []);
    this.notFound(clean);
    this.title.setTitle(pageTitle(['Not found']));
  }

  /** ui.edge-cases.dynamic-page-title: file H1 + its folders + the product name. */
  private setTitleFor(node: TreeNode): void {
    const folders = this.selectedSegments().slice(0, -1).map(displayName).reverse();
    this.title.setTitle(pageTitle([displayTitle(node), ...folders]));
  }

  private set(mode: NavMode, persona: string | null, real: string[]): void {
    this.mode.set(mode);
    this.selectedPersona.set(persona);
    this.selectedSegments.set(real);
  }
  private notFound(path: string): void {
    this.result.set({ type: 'not-found', path: path.replace(/^\//, '') });
    this.loading.set(false);
  }
  private async loadHome(): Promise<void> {
    this.loading.set(true);
    this.result.set(await deliverHome(this.browser));
    this.loading.set(false);
  }
  private async loadFile(rootId: string, urlSegments: string[]): Promise<void> {
    this.loading.set(true);
    this.result.set(await deliver(this.browser, rootId, urlSegments));
    this.loading.set(false);
  }
  private autoExpand(realSegments: string[]): void {
    const next = new Set(this.expanded());
    for (let i = 1; i < realSegments.length; i++) next.add(realSegments.slice(0, i).join('/'));
    this.expanded.set(next);
  }

  // ---- control actions: each navigates; applyRoute() rebuilds the state ----

  private navTo(rootId: string, urlSegments: string[]): void {
    void this.router.navigateByUrl('/' + [rootId, ...urlSegments].map(encodeURIComponent).join('/'));
  }

  goHome(): void {
    void this.router.navigateByUrl('/');
  }
  selectPersona(folder: string): void {
    if (folder) this.navTo(PERSONA_ROOT, [folder]);
  }
  openSchema(): void {
    void this.router.navigateByUrl('/' + SCHEMA_ROOT);
  }
  /** open a node given its containing folder's real path + the node itself. */
  openNode(rootId: string, parentReal: string[], node: TreeNode): void {
    this.navTo(rootId, [...parentReal, urlSegmentFor(node)]);
  }

  toggleFolder(realSegments: string[]): void {
    const key = realSegments.join('/');
    const next = new Set(this.expanded());
    next.has(key) ? next.delete(key) : next.add(key);
    this.expanded.set(next);
  }
  isExpanded(realSegments: string[]): boolean {
    return this.expanded().has(realSegments.join('/'));
  }
  isActivePath(mode: NavMode, realSegments: string[]): boolean {
    return this.mode() === mode && realSegments.join('/') === this.selectedSegments().join('/');
  }
  isAncestorOfOpen(realSegments: string[]): boolean {
    const open = this.selectedSegments();
    return realSegments.length < open.length && realSegments.every((s, i) => open[i] === s);
  }
}

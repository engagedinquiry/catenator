import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ContentBrowser, displayName, TreeNode } from '../core/content-browser';
import { ViewState } from '../state/view-state';

/**
 * content.browser navigationMode 'tree' — an expandable list of arbitrary depth,
 * rendered recursively (recursive-not-fixed-depth). Folders toggle; files open.
 * Display strips the order prefix; the real name is used for the URL and sort.
 *
 * ui.edge-cases.semantic-accessible-controls: a real <ul>/<li> tree with
 * aria-expanded on folder toggles; every entry is a <button>.
 * view.state.active-state-highlighting: the open file and its ancestor folders
 * are marked.
 */
@Component({
  selector: 'app-schema-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="tree" role="tree">
      @for (node of nodes(); track node.name) {
        <li role="treeitem" [attr.aria-expanded]="node.type === 'folder' ? state.isExpanded(pathOf(node)) : null">
          @if (node.type === 'folder') {
            <button
              type="button"
              class="row folder"
              [class.ancestor]="state.isAncestorOfOpen(pathOf(node))"
              (click)="state.toggleFolder(pathOf(node))">
              <span class="twist">{{ state.isExpanded(pathOf(node)) ? '▾' : '▸' }}</span>
              {{ label(node.name) }}
            </button>
            @if (state.isExpanded(pathOf(node))) {
              <app-schema-tree [prefix]="pathOf(node)" />
            }
          } @else {
            <button
              type="button"
              class="row file"
              [class.active]="state.isActivePath('schema', pathOf(node))"
              (click)="state.openNode('schema', prefix(), node)">
              {{ label(node.name) }}
            </button>
          }
        </li>
      } @empty {
        <li class="empty">No documents yet</li>
      }
    </ul>
  `,
  styles: [
    `
      .tree { list-style: none; margin: 0; padding: 0 0 0 10px; }
      .tree .tree { border-left: 1px solid var(--border-subtle); }
      .row {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        text-align: left;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-control);
        padding: 5px 8px;
        font-family: var(--font-mono);
        font-size: 0.78rem;
        color: var(--text-body);
        cursor: pointer;
      }
      .row:hover { background: #f1f5f9; color: var(--text-title); }
      .row.active { background: var(--accent-blue); border-color: var(--accent-blue); color: #fff; font-weight: 700; }
      .row.ancestor { color: var(--accent-blue-strong); font-weight: 700; }
      .twist { width: 10px; color: var(--text-muted); }
      .empty { color: var(--text-muted); font-size: 0.75rem; padding: 5px 8px; }
    `
  ]
})
export class SchemaTree {
  /** parent path segments; empty at the root level. */
  readonly prefix = input<string[]>([]);

  readonly state = inject(ViewState);
  private browser = inject(ContentBrowser);

  nodes(): TreeNode[] {
    return this.browser.children('schema', this.prefix()) ?? [];
  }
  /** real on-disk path segments of a node. */
  pathOf(node: TreeNode): string[] {
    return [...this.prefix(), node.name];
  }
  label(name: string): string {
    return displayName(name);
  }
}

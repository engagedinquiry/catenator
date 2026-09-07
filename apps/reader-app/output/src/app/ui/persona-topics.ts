import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentBrowser, displayTitle } from '../core/content-browser';
import type { TreeNode } from '../core/content-browser';
import { ViewState } from '../state/view-state';

/**
 * content.browser navigationMode 'dropdown', lower half — the selected persona's
 * flat topic list (personas/ folders are not expected to nest; if one did, the
 * same recursive walk still applies, but this list shows its immediate files).
 *
 * ui.edge-cases.empty-folder-message: an empty folder says "No topics yet".
 * view.state.active-state-highlighting: the open topic is marked.
 */
@Component({
  selector: 'app-persona-topics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (topics().length === 0) {
      <p class="empty">No topics yet</p>
    } @else {
      <ul class="topics">
        @for (n of topics(); track n.name) {
          <li>
            <button
              type="button"
              class="row"
              [class.active]="state.isActivePath('persona', [persona(), n.name])"
              (click)="state.openNode('personas', [persona()], n)">
              {{ title(n) }}
            </button>
          </li>
        }
      </ul>
    }
  `,
  styles: [
    `
      .topics { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
      .row {
        width: 100%;
        text-align: left;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-control);
        padding: 6px 8px;
        font-family: var(--font-mono);
        font-size: 0.78rem;
        color: var(--text-body);
        cursor: pointer;
      }
      .row:hover { background: #f1f5f9; color: var(--text-title); }
      .row.active { background: var(--accent-blue); border-color: var(--accent-blue); color: #fff; font-weight: 700; }
      .empty { color: var(--text-muted); font-size: 0.75rem; margin: 6px 0 0; }
    `
  ]
})
export class PersonaTopics {
  readonly state = inject(ViewState);
  private browser = inject(ContentBrowser);

  persona(): string {
    return this.state.selectedPersona() ?? '';
  }
  topics(): TreeNode[] {
    const p = this.persona();
    if (!p) return [];
    return (this.browser.children('personas', [p]) ?? []).filter((n) => n.type === 'file');
  }
  title(node: TreeNode): string {
    return displayTitle(node);
  }
}

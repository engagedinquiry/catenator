import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * One generic list — used for both the category list and the file list
 * (content.folder-browser is one mechanism; so is its presentation). Each label
 * IS the on-disk folder / file name, shown verbatim (micro.folder-name-is-the-label).
 *
 * style.visual-theme: selected item gets a filled background; unselected are
 * outlined; hover tints — the shared Catenator list-item treatment.
 */
@Component({
  selector: 'app-list-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-view">
      <div class="crumbs">
        <button type="button" class="crumb" (click)="home.emit()">Home</button>
        @if (parentLabel()) {
          <span class="sep">/</span>
          <button type="button" class="crumb" (click)="back.emit()">{{ parentLabel() }}</button>
        }
      </div>
      <h2>{{ heading() }}</h2>
      @if (items().length === 0) {
        <p class="empty">Nothing here.</p>
      } @else {
        <ul class="items">
          @for (it of items(); track it) {
            <li>
              <button
                type="button"
                class="item"
                [class.selected]="it === selected()"
                (click)="pick.emit(it)">
                {{ it }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .list-view { max-width: 680px; margin: 0 auto; padding: 24px 32px 80px; }
      .crumbs { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 0.75rem; }
      .crumb {
        background: transparent;
        border: 0;
        padding: 0;
        color: var(--accent-blue);
        cursor: pointer;
        font: inherit;
        text-decoration: underline;
      }
      .sep { color: var(--text-muted); }
      h2 { margin: 0 0 14px; }
      .items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
      .item {
        width: 100%;
        text-align: left;
        padding: 9px 12px;
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        background: var(--canvas-bg);
        color: var(--text-body);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-control);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .item:hover { background: #f1f5f9; color: var(--text-title); }
      .item.selected {
        background: var(--accent-blue);
        border-color: var(--accent-blue);
        color: #ffffff;
        font-weight: 700;
      }
      .empty { color: var(--text-muted); font-size: 0.8125rem; }
    `
  ]
})
export class ListView {
  readonly heading = input.required<string>();
  readonly items = input.required<string[]>();
  readonly selected = input<string | null>(null);
  /** shown as a second crumb; clicking it emits back. Omit at the top level. */
  readonly parentLabel = input<string | null>(null);

  readonly pick = output<string>();
  readonly back = output<void>();
  readonly home = output<void>();
}

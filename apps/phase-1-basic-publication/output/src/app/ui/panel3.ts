import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GuidePanel } from './guide-panel';
import { QualityCheckPanel } from './quality-check-panel';

/**
 * layout.three-panel Panel 3 — a Guide tab and a Quality Check tab.
 * Both are present for this phase.
 */
@Component({
  selector: 'app-panel3',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuidePanel, QualityCheckPanel],
  template: `
    <div class="p3-tabs">
      <button type="button" [class.on]="tab() === 'guide'" (click)="tab.set('guide')">Guide</button>
      <button type="button" [class.on]="tab() === 'quality'" (click)="tab.set('quality')">Quality Check</button>
    </div>
    <div class="p3-body">
      @if (tab() === 'guide') { <app-guide-panel /> } @else { <app-quality-check-panel /> }
    </div>
  `,
  styles: [
    `
      .p3-tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--border-subtle); position: sticky; top: 0; background: var(--canvas-bg); }
      .p3-tabs button {
        flex: 1;
        background: transparent;
        border: 0;
        border-bottom: 2px solid transparent;
        border-radius: 0;
        color: var(--text-muted);
        font-family: var(--font-display);
        font-size: 0.75rem;
        font-weight: 700;
        padding: 10px 8px;
      }
      .p3-tabs button.on { color: var(--accent-blue-strong); border-bottom-color: var(--accent-blue); }
      .p3-body { padding: 16px; }
    `
  ]
})
export class Panel3 {
  readonly tab = signal<'guide' | 'quality'>('guide');
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { QualityReport } from '../core/quality-check';
import { runQualityCheck } from '../core/quality-check';
import { PublicationStore } from '../core/publication-store';

/**
 * quality-check.four-checks — Panel 3's Quality Check tab.
 *
 * mustNever "Enforce any of these four checks live, while typing": the check
 * only runs from the explicit "Run checks" button below — `report` is null
 * until then, and nothing subscribes it to store changes.
 *
 * micro.check-report-is-per-item: each failure line comes straight from
 * runQualityCheck(), which names the specific topic / source id / variable /
 * persona gap.
 */
@Component({
  selector: 'app-quality-check-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="run">
      <button (click)="run()">Run checks</button>
      @if (report()) { <button class="ghost" (click)="report.set(null)">Clear</button> }
    </div>

    @if (report(); as r) {
      @for (c of r.results; track c.id) {
        <div class="check" [class.pass]="c.passed" [class.fail]="!c.passed">
          <div class="check-hd">
            <span class="mark">{{ c.passed ? '✓' : '✕' }}</span>
            {{ c.label }}
          </div>
          @if (!c.passed) {
            <ul>
              @for (f of c.failures; track $index) { <li>{{ f }}</li> }
            </ul>
          }
        </div>
      }
      @if (!r.refractionAllowed) {
        <p class="err">Refraction is blocked until at least one persona exists.</p>
      }
    } @else {
      <p class="lead">Run the four checks against the whole publication before refracting.</p>
    }
  `,
  styles: [
    `
      .run { display: flex; gap: 8px; margin-bottom: 14px; }
      .check { border: 1px solid var(--border-subtle); border-radius: var(--radius-card); padding: 10px 12px; margin-bottom: 8px; }
      .check.pass { background: #f0fdf4; border-color: #bbf7d0; }
      .check.fail { background: #fef2f2; border-color: #fecaca; }
      .check-hd { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 600; color: var(--text-title); }
      .check.pass .mark { color: #15803d; }
      .check.fail .mark { color: #b91c1c; }
      ul { margin: 8px 0 0; padding-left: 20px; }
      li { font-size: 0.78rem; color: #7f1d1d; margin-bottom: 3px; }
    `
  ]
})
export class QualityCheckPanel {
  private store = inject(PublicationStore);
  readonly report = signal<QualityReport | null>(null);

  run(): void {
    this.report.set(runQualityCheck(this.store.publication()));
  }
}

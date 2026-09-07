import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GUIDE_BLOCKS } from '../core/guide-content';
import { PublicationStore } from '../core/publication-store';

/**
 * guide.static-per-selection — shows the one fixed Guide block for whichever of
 * the five selection types is active in Panel 1.
 *
 * mustNever "Generate Guide content dynamically or react to the specific
 * content being edited": this component reads GUIDE_BLOCKS[selection.type] and
 * nothing else — it never looks at topic content, names, or values.
 * micro.five-fixed-blocks: GUIDE_BLOCKS has exactly five keys; there is no
 * per-topic branch.
 */
@Component({
  selector: 'app-guide-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>{{ block().title }}</h2>
    @for (para of block().body; track $index) {
      <p>{{ para }}</p>
    }
  `,
  styles: [
    `
      h2 { margin-top: 0; }
      p { font-size: 0.8125rem; color: var(--text-body); margin: 0 0 10px; line-height: 1.55; }
    `
  ]
})
export class GuidePanel {
  private store = inject(PublicationStore);
  readonly block = computed(() => GUIDE_BLOCKS[this.store.selection().type]);
}

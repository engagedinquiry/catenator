import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AccordionNav } from './accordion-nav';
import { EditorGeneric } from './editor-generic';
import { Panel3 } from './panel3';

/**
 * layout.three-panel — Panel 1 (accordion navigation), Panel 2
 * (editor.generic, inline), Panel 3 (Guide + Quality Check tabs).
 *
 * mustNever "Let this component alter publication data / hierarchy / pipeline":
 * this file is layout only — it places three child components and owns no state
 * and no logic.
 */
@Component({
  selector: 'app-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccordionNav, EditorGeneric, Panel3],
  template: `
    <div class="workspace">
      <div class="panel panel-1"><app-accordion-nav /></div>
      <main class="panel panel-2"><app-editor-generic /></main>
      <aside class="panel panel-3"><app-panel3 /></aside>
    </div>
  `,
  styles: [
    `
      .workspace { flex: 1; min-height: 0; display: flex; overflow: hidden; }
      .panel { height: 100%; box-sizing: border-box; overflow-y: auto; }
      .panel-1 {
        width: 260px;
        min-width: 260px;
        background: var(--panel-bg);
        border-right: 1px solid var(--border-subtle);
      }
      .panel-2 { flex: 1; min-width: 0; background: var(--panel-bg); }
      .panel-3 {
        width: 320px;
        min-width: 320px;
        background: var(--canvas-bg);
        border-left: 1px solid var(--border-subtle);
      }
    `
  ]
})
export class Workspace {}

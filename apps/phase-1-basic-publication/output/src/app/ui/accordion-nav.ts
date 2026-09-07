import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PublicationStore } from '../core/publication-store';
import { TopicTreeNode } from './topic-tree-node';

/**
 * layout.three-panel Panel 1.
 *
 * micro.accordion-sections-fixed: EXACTLY five sections this phase —
 * Publication, Topics, Variables, Sources, Personas. Shared Blocks is NOT a
 * section here (system.yaml mustNever). The list below is literally these five
 * and the branding/layout test asserts it.
 *
 * Every item opens inline in Panel 2 (editor.generic) — no modal dialogs
 * anywhere.
 */
type SectionKey = 'publication' | 'topics' | 'variables' | 'sources' | 'personas';

@Component({
  selector: 'app-accordion-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TopicTreeNode],
  template: `
    <div class="acc">
      <!-- 1. Publication -->
      <section>
        <button type="button" class="hd" (click)="toggle('publication')" [class.open]="isOpen('publication')">
          <span class="caret">{{ isOpen('publication') ? '▾' : '▸' }}</span> Publication
        </button>
        @if (isOpen('publication')) {
          <div class="body">
            <button type="button" class="pick" [class.on]="sel().type === 'publication'" (click)="store.select('publication')">
              {{ store.meta().displayName || 'Untitled publication' }}
            </button>
          </div>
        }
      </section>

      <!-- 2. Topics -->
      <section>
        <button type="button" class="hd" (click)="toggle('topics')" [class.open]="isOpen('topics')">
          <span class="caret">{{ isOpen('topics') ? '▾' : '▸' }}</span> Topics
          <span class="count">{{ topicCount() }}</span>
        </button>
        @if (isOpen('topics')) {
          <div class="body">
            @for (t of store.topics(); track t.id) {
              <app-topic-tree-node [topic]="t" [depth]="0" />
            } @empty {
              <p class="empty">No topics yet.</p>
            }
            <button type="button" class="add" (click)="store.addTopic()">＋ Add topic</button>
          </div>
        }
      </section>

      <!-- 3. Variables -->
      <section>
        <button type="button" class="hd" (click)="toggle('variables')" [class.open]="isOpen('variables')">
          <span class="caret">{{ isOpen('variables') ? '▾' : '▸' }}</span> Variables
          <span class="count">{{ store.variables().length }}</span>
        </button>
        @if (isOpen('variables')) {
          <div class="body">
            <button type="button" class="pick" [class.on]="sel().type === 'variables'" (click)="store.select('variables')">
              Edit variables
            </button>
          </div>
        }
      </section>

      <!-- 4. Sources -->
      <section>
        <button type="button" class="hd" (click)="toggle('sources')" [class.open]="isOpen('sources')">
          <span class="caret">{{ isOpen('sources') ? '▾' : '▸' }}</span> Sources
          <span class="count">{{ store.sources().length }}</span>
        </button>
        @if (isOpen('sources')) {
          <div class="body">
            <button type="button" class="pick" [class.on]="sel().type === 'sources'" (click)="store.select('sources')">
              Edit sources
            </button>
          </div>
        }
      </section>

      <!-- 5. Personas -->
      <section>
        <button type="button" class="hd" (click)="toggle('personas')" [class.open]="isOpen('personas')">
          <span class="caret">{{ isOpen('personas') ? '▾' : '▸' }}</span> Personas
          <span class="count">{{ store.personas().length }} / 2</span>
        </button>
        @if (isOpen('personas')) {
          <div class="body">
            <button type="button" class="pick" [class.on]="sel().type === 'personas'" (click)="store.select('personas')">
              Edit personas
            </button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .acc { display: flex; flex-direction: column; }
      section { border-bottom: 1px solid var(--border-subtle); }
      .hd {
        width: 100%;
        text-align: left;
        background: transparent;
        border: 0;
        border-radius: 0;
        padding: 10px 12px;
        font-family: var(--font-display);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-body);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .hd:hover { background: #f1f5f9; color: var(--text-title); }
      .caret { color: var(--text-muted); font-size: 0.7rem; }
      .count { margin-left: auto; font-weight: 600; color: var(--text-muted); letter-spacing: 0; }
      .body { padding: 4px 8px 12px; }
      .empty { color: var(--text-muted); font-size: 0.75rem; margin: 4px 6px; }
      .pick {
        width: 100%;
        text-align: left;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-control);
        padding: 6px 8px;
        font: inherit;
        font-size: 0.8125rem;
        color: var(--text-body);
        cursor: pointer;
      }
      .pick:hover { background: #f1f5f9; }
      .pick.on { background: var(--accent-blue-light); color: var(--accent-blue-strong); font-weight: 600; }
      .add {
        margin-top: 8px;
        background: var(--canvas-bg);
        color: var(--text-body);
        border: 1px solid var(--border-control);
        font-size: 0.72rem;
      }
      .add:hover { background: #f1f5f9; color: var(--text-title); border-color: var(--border-control); }
    `
  ]
})
export class AccordionNav {
  readonly store = inject(PublicationStore);
  readonly sel = this.store.selection;

  private open = signal<Record<SectionKey, boolean>>({
    publication: true,
    topics: true,
    variables: false,
    sources: false,
    personas: true
  });

  readonly topicCount = computed(() => countTree(this.store.topics()));

  isOpen(k: SectionKey): boolean {
    return this.open()[k];
  }
  toggle(k: SectionKey): void {
    this.open.update((o) => ({ ...o, [k]: !o[k] }));
  }
}

function countTree(nodes: readonly { children: readonly unknown[] }[]): number {
  let n = 0;
  for (const node of nodes as readonly { children: readonly { children: readonly unknown[] }[] }[]) {
    n += 1 + countTree(node.children);
  }
  return n;
}

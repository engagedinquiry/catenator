import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { personaById } from '../core/persona-catalog';
import { topicById } from '../core/content-source';
import { ReaderStore } from '../state/reader-store';
import { BRAND_LINE } from '../brand/brand';
import { PersonaSwitcher } from '../ui/persona-switcher';
import { TopicList } from '../ui/topic-list';
import { ContentPane } from '../ui/content-pane';

/**
 * layout.reader-shell — the page structure for /:personaId and
 * /:personaId/:topicId:
 *
 *   top-bar      full width, top  — branding (left) + persona dropdown (right)
 *   topic-list   left, FIXED width — does not grow/shrink with content or height
 *   content-pane remaining space, right of the topic list
 *
 * Route params arrive as component inputs (withComponentInputBinding). An
 * unknown personaId / topicId redirects home rather than guessing
 * (system.yaml mustNever "Infer a persona for the reader").
 */
@Component({
  selector: 'app-persona-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PersonaSwitcher, TopicList, ContentPane],
  template: `
    <div class="shell">
      <header class="top-bar">
        <span class="tb-brand">{{ brandLine }}</span>
        <span class="tb-spacer"></span>
        <app-persona-switcher />
      </header>

      <div class="body">
        <aside class="topic-panel"><app-topic-list /></aside>
        <main class="content-panel">
          <div class="content-wrap"><app-content-pane /></div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; height: 100%; }
      .shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }

      /* top-bar: full width, top. Branding left, persona dropdown right — the
         one place right-placement is allowed (no-right-alignment micro). */
      .top-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 48px;
        flex-shrink: 0;
        padding: 0 16px;
        background: var(--canvas-bg);
        border-bottom: 1px solid var(--border-subtle);
      }
      .tb-brand {
        font-family: var(--font-display);
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }
      .tb-spacer { flex: 1; }

      .body { flex: 1; min-height: 0; display: flex; flex-direction: row; overflow: hidden; }

      /* topic-list: left, fixed width — width is a constant, unaffected by its
         own content, the content pane, or page height (fixed-topic-list-width). */
      .topic-panel {
        width: 232px;
        min-width: 232px;
        max-width: 232px;
        flex: 0 0 232px;
        background: var(--panel-bg);
        border-right: 1px solid var(--border-subtle);
        overflow-y: auto;
      }

      .content-panel { flex: 1; min-width: 0; overflow-y: auto; background: var(--panel-bg); }
      .content-wrap { max-width: 760px; margin: 0 auto; padding: 26px 32px 88px; }
    `
  ]
})
export class PersonaPage {
  readonly personaId = input.required<string>();
  readonly topicId = input<string | undefined>(undefined);

  readonly brandLine = BRAND_LINE;
  private store = inject(ReaderStore);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const persona = this.personaId();
      const topic = this.topicId();
      if (!personaById(persona)) {
        void this.router.navigate(['/']);
        return;
      }
      if (topic !== undefined && !topicById(topic)) {
        void this.router.navigate(['/', persona]);
        return;
      }
      void this.store.setRoute(persona, topic);
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReaderStore } from '../state/reader-store';
import { PersonaSwitcher } from '../ui/persona-switcher';
import { TopicList } from '../ui/topic-list';
import { ContentPane } from '../ui/content-pane';

/**
 * The reader workspace: persona switcher + topic list on the left, delivered
 * content in the center. Two independent selectors, never one implied by the
 * other (delivery.request-response micro.both-explicit).
 */
@Component({
  selector: 'app-reader-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PersonaSwitcher, TopicList, ContentPane],
  template: `
    <div class="reader-layout">
      <aside class="reader-side">
        <app-persona-switcher />
        <app-topic-list />
      </aside>
      <main class="reader-main">
        <div class="reader-wrap">
          <app-content-pane />
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .reader-layout { display: flex; flex-direction: row; height: 100%; min-height: 0; }
      .reader-side {
        width: 260px;
        min-width: 260px;
        background: var(--panel-bg);
        border-right: 1px solid var(--border-subtle);
        overflow-y: auto;
      }
      .reader-main { flex: 1; min-width: 0; overflow-y: auto; background: var(--panel-bg); }
      .reader-wrap { max-width: 760px; margin: 0 auto; padding: 26px 32px 88px; }
      @media (max-width: 720px) {
        .reader-layout { flex-direction: column; }
        .reader-side { width: 100%; min-width: 0; border-right: 0; border-bottom: 1px solid var(--border-subtle); }
      }
    `
  ]
})
export class ReaderPage implements OnInit {
  private store = inject(ReaderStore);

  ngOnInit(): void {
    // delivery.request-response micro.default-on-load: topic "start", no persona.
    if (this.store.response() === null) void this.store.load();
  }
}

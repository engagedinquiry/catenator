import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReaderStore } from '../state/reader-store';

/**
 * layout.reader-shell micro.persona-switcher-is-dropdown: a single <select>
 * showing the six personas from persona.catalog — not six buttons or a list.
 * Changing it routes to /:newPersonaId/:currentTopicId so the content pane
 * updates (delivery.request-response) and the topic persists
 * (content.source micro.topic-persists-across-persona-switch).
 */
@Component({
  selector: 'app-persona-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ps">
      <span class="ps-label">Reading as</span>
      <select (change)="pick($event)">
        @for (p of store.personas; track p.id) {
          <option [value]="p.id" [selected]="p.id === store.personaId()">{{ p.label }}</option>
        }
      </select>
    </label>
  `,
  styles: [
    `
      .ps { display: inline-flex; align-items: center; gap: 8px; }
      .ps-label {
        font-family: var(--font-display);
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--text-muted);
      }
      select {
        font: inherit;
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 0.8125rem;
        color: var(--text-title);
        background: var(--canvas-bg);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-control);
        padding: 5px 8px;
      }
      select:focus { outline: none; border-color: var(--accent-blue); box-shadow: 0 0 0 3px var(--accent-blue-light); }
    `
  ]
})
export class PersonaSwitcher {
  readonly store = inject(ReaderStore);
  private router = inject(Router);

  pick(ev: Event): void {
    const personaId = (ev.target as HTMLSelectElement).value;
    if (!personaId) return;
    this.router.navigate(['/', personaId, this.store.topicId()]);
  }
}

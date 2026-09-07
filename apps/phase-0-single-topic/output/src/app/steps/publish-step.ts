import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { deliver } from '../core/delivery';
import { SessionStore } from '../core/session-store';

/**
 * Step 5 — Publish / deliver. delivery.request-response.
 *
 * The reader picks a persona and nothing else — topicId is supplied implicitly
 * (micro.topic-id-implicit-in-single-topic-scope). The selector shows the plain
 * persona name only (micro.clean-persona-name-display).
 * micro.grounding-gate: every request runs check.grounding first; an ungrounded
 * claim returns {type: ungrounded-claim} and the output is not shown.
 */
@Component({
  selector: 'app-publish-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h2>Step 5 — Deliver a reader's version</h2>
    <p class="hint">Choose a reader. The output is grounding-checked against the topic and sources before it's served.</p>

    <label for="pick">Reading as</label>
    <select id="pick" [ngModel]="selectedId()" (ngModelChange)="selectedId.set($event)">
      <option value="">Choose a reader…</option>
      @for (p of store.personas(); track p.id) {
        <option [value]="p.id">{{ p.name }}</option>
      }
    </select>

    @if (response(); as r) {
      @if (r.ok) {
        <pre class="out">{{ r.text }}</pre>
      } @else {
        <div class="err">{{ r.error.message }}</div>
      }
    }

    <div class="actions">
      <button class="ghost" (click)="back()">← Back</button>
      <span></span>
    </div>
  `
})
export class PublishStep {
  readonly store = inject(SessionStore);
  private router = inject(Router);

  readonly selectedId = signal('');
  readonly response = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return deliver(
      { topicId: this.store.topicId(), personaId: id },
      this.store.refractedOutputs(),
      this.store.topicText(),
      this.store.sources()
    );
  });

  back(): void {
    this.router.navigate(['/refract']);
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { checkGrounding } from '../core/grounding';
import { DeliveryResponse, resolveDelivery } from '../core/publish';
import { SessionStore } from '../core/session-store';

/**
 * Step 5 — Publish for delivery (delivery.request-response).
 *
 *  - The reader chooses a persona only. topicId is supplied implicitly from the
 *    single in-session topic — there is no topic input in the UI.
 *  - The persona selector shows the plain persona name only.
 *  - resolveDelivery returns exactly the requested persona's output, and only
 *    if it has been refracted and is grounded (or verifier-approved).
 */
@Component({
  selector: 'app-publish-step',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Step 5 — Publish for delivery</h2>
    <p class="hint">Choose a reader; get that reader's refracted version back. No caching, no persistence — it resolves against this session only.</p>

    <div class="card">
      <label for="pub-persona">Reader</label>
      <select id="pub-persona" [(ngModel)]="personaId">
        @for (r of store.refractions(); track r.personaId) {
          <option [value]="r.personaId">{{ r.personaName }}</option>
        }
      </select>
      <div class="row">
        <button (click)="send()">Publish for delivery</button>
      </div>
    </div>

    @if (response(); as res) {
      <strong>Response</strong>
      <pre class="out">{{ pretty(res) }}</pre>
      @if (res.ok) {
        <h2>Rendered output — {{ res.personaName }}</h2>
        <pre class="out">{{ res.output }}</pre>
      }
    }

    <div class="actions">
      <button class="ghost" (click)="router.navigate(['/refract'])">← Back</button>
      <span></span>
    </div>
  `
})
export class PublishStep {
  readonly store = inject(SessionStore);
  readonly router = inject(Router);

  personaId = this.store.refractions()[0]?.personaId ?? '';
  response = signal<DeliveryResponse | null>(null);

  private ungroundedIds = computed(() => {
    const ids = new Set<string>();
    for (const r of this.store.refractions()) {
      if (checkGrounding(r, this.store.topicText(), this.store.sources()).ungrounded.length > 0) {
        ids.add(r.personaId);
      }
    }
    return ids;
  });

  send(): void {
    this.response.set(
      resolveDelivery(
        { topicId: this.store.topicId(), personaId: this.personaId },
        {
          sessionTopicId: this.store.topicId(),
          refractedOutputs: this.store.refractedOutputs(),
          groundingApproved: this.store.groundingApproved(),
          ungroundedPersonaIds: this.ungroundedIds()
        }
      )
    );
  }

  pretty(res: DeliveryResponse): string {
    if (!res.ok) return JSON.stringify(res, null, 2);
    const short = res.output.length > 120 ? res.output.slice(0, 120) + '… (full text below)' : res.output;
    return JSON.stringify({ ...res, output: short }, null, 2);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CompilerError } from '../core/models';
import { refractOnce } from '../core/refraction';
import { SessionStore } from '../core/session-store';
import { transportFor } from '../core/transports';

/**
 * Step 4 — Refract. byok-compiler.contract.
 *
 * micro.refract-all-personas-one-action: one "Refract for all personas" action
 * generates output for every persona; no per-persona trigger.
 * interrupt.conditional-api-key.hard-block-at-refract-only: a missing key blocks
 * ONLY here — the button is disabled and the page explains why.
 * micro.call-failure-behavior: an error is surfaced visibly on the page.
 * micro.clean-persona-name-display: only the plain name is shown.
 */
@Component({
  selector: 'app-refract-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Step 4 — Refract for every reader</h2>
    <p class="hint">One action. One call per persona, via {{ store.provider() }}.</p>

    @if (!store.hasApiKey()) {
      <div class="err">
        Step 4 needs a {{ store.provider() }} API key. Steps 0–3 don't —
        <a routerLink="/settings">add one in Settings</a> to refract.
      </div>
    }

    <div class="row">
      <button [disabled]="!store.hasApiKey() || running()" (click)="refractAll()">
        {{ running() ? 'Refracting…' : 'Refract for all personas' }}
      </button>
      @if (done()) { <span class="ok-box">All {{ store.personas().length }} personas refracted.</span> }
    </div>

    @if (error()) {
      <div class="err">
        Refraction failed ({{ error()!.type }}): {{ error()!.message }}
        The call was retried once automatically.
      </div>
    }

    @for (p of store.personas(); track p.id) {
      <div class="card">
        <h2 style="margin-top:0">{{ p.name }}</h2>
        @if (outputOf(p.id); as text) {
          <pre class="out">{{ text }}</pre>
        } @else {
          <p class="hint">Not refracted yet.</p>
        }
      </div>
    }

    <div class="actions">
      <button class="ghost" (click)="back()">← Back</button>
      <button [disabled]="!done()" (click)="next()">Continue →</button>
    </div>
  `,
  imports: [RouterLink]
})
export class RefractStep {
  readonly store = inject(SessionStore);
  private router = inject(Router);

  readonly running = signal(false);
  readonly error = signal<CompilerError | null>(null);
  readonly done = computed(() => this.store.allRefracted());

  outputOf(id: string): string | undefined {
    return this.store.refractedOutputs().get(id);
  }

  async refractAll(): Promise<void> {
    this.error.set(null);
    const transport = transportFor(this.store.provider());
    if (!transport) {
      this.error.set({ type: 'network', message: `Unknown provider "${this.store.provider()}".`, retryable: false });
      return;
    }
    this.running.set(true);
    const key = this.store.apiKey();
    const model = this.store.model();
    const topicText = this.store.topicText();
    const sources = this.store.sources();

    for (const persona of this.store.personas()) {
      const result = await refractOnce(transport, key, model, {
        topicText,
        sources,
        persona: { name: persona.name, summary: persona.summary, dimensions: persona.dimensions }
      });
      if (!result.ok) {
        this.error.set(result.error); // surfaced visibly, not console-only
        this.running.set(false);
        return;
      }
      this.store.putRefraction(persona.id, result.text);
    }
    this.running.set(false);
  }

  next(): void {
    this.router.navigate(['/publish']);
  }
  back(): void {
    this.router.navigate(['/personas']);
  }
}

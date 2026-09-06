import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroundingReport } from '../core/grounding';
import { RefractAllResult } from '../core/refraction.service';
import { RefractionService } from '../core/refraction.service';
import { SessionStore } from '../core/session-store';

/**
 * Step 4 — Refract (BYOK). byok-compiler.contract + check.grounding.
 *
 *  - micro.refract-all-personas-one-action: one button refracts every persona.
 *  - "Fail silently on a call error": structured errors are shown here, not
 *    just logged.
 *  - clean-persona-name-display: only the plain persona name is ever shown.
 *  - check.grounding: claims that don't trace to topic/sources are listed;
 *    delivery of that persona is blocked until the verifier approves.
 */
@Component({
  selector: 'app-refract-step',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Step 4 — Refract</h2>
    <p class="hint">One call per persona, {{ store.provider() === 'gemini' ? 'Gemini' : 'Claude' }} · {{ store.model() }}. Same topic text, one distinct output each.</p>

    @if (!store.hasApiKey()) {
      <p class="err">No API key set. <a routerLink="/settings">Add one in Settings</a>, then come back.</p>
    }

    <div class="row">
      <button [disabled]="!store.hasApiKey() || busy()" (click)="run()">{{ refractLabel() }}</button>
      @if (store.hasRefractions() && deliverable()) {
        <button class="ghost" (click)="router.navigate(['/publish'])">Continue to publish →</button>
      }
    </div>

    @if (error()) { <p class="err">{{ error() }}</p> }

    @for (f of failures(); track f.personaName) {
      <div class="warn-box">
        <strong>{{ f.personaName }}</strong> — call failed after one automatic retry.
        <br />Type: <code>{{ f.error.type }}</code> · retryable: <code>{{ f.error.retryable }}</code>
        <br />{{ f.error.message }}
      </div>
    }

    @if (store.hasRefractions()) {
      @if (divergence(); as d) {
        <div class="card"><strong>Divergence check</strong><p class="hint">{{ d }}</p></div>
      }

      @for (r of store.refractions(); track r.personaId) {
        <h2>{{ r.personaName }} <span class="hint">({{ r.provider }} · {{ r.model }})</span></h2>

        @if (reportFor(r.personaId); as rep) {
          <div class="card">
            <strong>Grounding — {{ rep.claims.length }} specific claim(s) checked</strong>
            @if (rep.ungrounded.length === 0) {
              <p class="hint">Every checked claim traces to the topic text or sources.</p>
            } @else {
              <p class="err">{{ rep.ungrounded.length }} claim(s) could not be traced. Review, then approve for delivery.</p>
            }
            <ul class="claim-list">
              @for (c of rep.claims; track c.text) {
                <li>
                  <span class="claim-tag" [class.grounded]="c.grounded" [class.ungrounded]="!c.grounded">
                    {{ c.grounded ? 'traced' : 'not traced' }}
                  </span>
                  <code>{{ c.text }}</code>
                </li>
              }
            </ul>
            @if (rep.ungrounded.length > 0 && !store.groundingApproved().has(rep.personaId)) {
              <button class="ghost" (click)="store.approveGrounding(rep.personaId)">
                I have checked these against the topic — approve for delivery
              </button>
            }
            @if (rep.ungrounded.length > 0 && store.groundingApproved().has(rep.personaId)) {
              <p class="hint">Approved by verifier.</p>
            }
          </div>
        }

        <pre class="out">{{ r.output }}</pre>
      }
    }

    <div class="actions">
      <button class="ghost" (click)="router.navigate(['/personas'])">← Back</button>
      <span></span>
    </div>
  `
})
export class RefractStep {
  readonly store = inject(SessionStore);
  readonly router = inject(Router);
  private svc = inject(RefractionService);

  busy = signal(false);
  error = signal('');
  reports = signal<GroundingReport[]>([]);
  failures = signal<RefractAllResult['failures']>([]);

  refractLabel = computed(() => {
    if (this.busy()) return 'Refracting…';
    if (this.store.hasRefractions()) return 'Re-run refraction for all personas';
    const n = this.store.personas().length;
    return `Refract for ${n === 1 ? '1 persona' : n + ' personas'}`;
  });

  reportFor(personaId: string): GroundingReport | undefined {
    return this.reports().find((r) => r.personaId === personaId);
  }

  deliverable = computed(() =>
    this.reports().every(
      (r) => r.ungrounded.length === 0 || this.store.groundingApproved().has(r.personaId)
    )
  );

  divergence = computed(() => {
    const rs = this.store.refractions();
    if (rs.length < 2) return rs.length === 1 ? 'Only one persona — nothing to compare.' : '';
    const [a, b] = rs;
    if (a.output.trim() === b.output.trim()) return '⚠ Outputs are identical — refraction did not diverge.';
    const wA = new Set(a.output.toLowerCase().split(/\W+/).filter(Boolean));
    const wB = new Set(b.output.toLowerCase().split(/\W+/).filter(Boolean));
    const shared = [...wA].filter((w) => wB.has(w)).length;
    const union = new Set([...wA, ...wB]).size;
    const overlap = union ? Math.round((shared / union) * 100) : 0;
    return `Outputs differ. Lexical overlap ${overlap}% · lengths ${a.output.length} vs ${b.output.length} chars.`;
  });

  async run(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    this.failures.set([]);
    try {
      const res = await this.svc.refractAll();
      this.reports.set(res.grounding);
      this.failures.set(res.failures);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.busy.set(false);
    }
  }
}

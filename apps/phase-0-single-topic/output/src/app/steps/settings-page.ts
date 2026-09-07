import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStore } from '../core/session-store';
import { SUPPORTED_PROVIDERS } from '../core/transports';

/**
 * Settings — BYOK key entry. NOT a step (interrupt.conditional-api-key mustNever
 * "Add this as a permanent numbered step"). Reachable any time; held in memory
 * for the session only (state.topic-refraction persistenceScope).
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h1>Settings — bring your own key</h1>
    <p class="lead">Held in memory for this session only. A refresh clears it, along with everything else.</p>

    <label for="provider">Provider</label>
    <select id="provider" [ngModel]="store.provider()" (ngModelChange)="store.setProvider($event)">
      @for (p of providers; track p) { <option [value]="p">{{ p }}</option> }
    </select>

    <label for="model">Model</label>
    <input id="model" type="text" [ngModel]="store.model()" (ngModelChange)="store.model.set($event)" placeholder="Model id" />

    <label for="key">API key</label>
    <input id="key" type="password" [ngModel]="store.apiKey()" (ngModelChange)="store.apiKey.set($event)" placeholder="Paste your key" />

    <div class="actions">
      <button class="ghost" (click)="done()">← Back</button>
      <span>{{ store.hasApiKey() ? 'Key set for this session.' : '' }}</span>
    </div>
  `
})
export class SettingsPage {
  readonly store = inject(SessionStore);
  readonly providers = SUPPORTED_PROVIDERS;
  private router = inject(Router);
  done(): void {
    this.router.navigate(['/intro']);
  }
}

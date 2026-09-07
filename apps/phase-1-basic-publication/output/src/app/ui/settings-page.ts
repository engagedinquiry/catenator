import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicationStore } from '../core/publication-store';
import { SUPPORTED_PROVIDERS } from '../core/transports';

/**
 * Settings — BYOK key entry. A plain page, not a modal dialog (system.yaml
 * mustNever) and not one of Panel 1's five accordion sections. Held in memory
 * for the session only.
 *
 * refraction.publication-level mustNever "Depend on a specific model provider":
 * the provider list is SUPPORTED_PROVIDERS from the transport registry.
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="wrap">
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
        <button class="ghost" (click)="done()">← Back to workspace</button>
        <span>{{ store.hasApiKey() ? 'Key set for this session.' : '' }}</span>
      </div>
    </div>
  `,
  styles: [`.wrap { max-width: 520px; margin: 0 auto; padding: 32px 28px; }`]
})
export class SettingsPage {
  readonly store = inject(PublicationStore);
  readonly providers = SUPPORTED_PROVIDERS;
  private router = inject(Router);
  done(): void {
    this.router.navigate(['/']);
  }
}

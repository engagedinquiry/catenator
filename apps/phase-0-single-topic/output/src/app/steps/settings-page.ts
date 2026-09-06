import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStore } from '../core/session-store';
import { PROVIDERS } from '../core/transports';

/**
 * Settings — BYOK. The key is held in memory for this session only; it is never
 * written to disk and is sent only to the selected provider's API host.
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Settings</h2>
    <p class="hint">Your API key is held in memory for this session only. It is never written to disk, and is sent only to the provider you choose.</p>

    <div class="card">
      <label for="set-provider">Provider</label>
      <select id="set-provider" [(ngModel)]="provider" (ngModelChange)="onProvider()">
        @for (p of providers; track p.id) {
          <option [value]="p.id">{{ p.label }}</option>
        }
      </select>

      <label for="set-key">API key</label>
      <input id="set-key" [type]="show() ? 'text' : 'password'" [(ngModel)]="key" placeholder="Paste your key" />
      <div class="row">
        <label style="margin:0"><input type="checkbox" [(ngModel)]="showFlag" (ngModelChange)="show.set(showFlag)" /> show</label>
      </div>

      <label for="set-model">Model</label>
      <input id="set-model" type="text" [(ngModel)]="model" placeholder="Model id" />
    </div>

    <div class="actions">
      <button class="ghost" (click)="router.navigate(['/topic'])">← Back to flow</button>
      <button (click)="save()">Save</button>
    </div>
    @if (saved()) { <p class="hint" style="color:var(--ok)">Saved for this session.</p> }
  `
})
export class SettingsPage {
  readonly store = inject(SessionStore);
  readonly router = inject(Router);
  readonly providers = PROVIDERS;

  provider = this.store.provider();
  key = this.store.apiKey();
  model = this.store.model();
  show = signal(false);
  showFlag = false;
  saved = signal(false);

  onProvider(): void {
    this.store.setProvider(this.provider);
    this.model = this.store.model();
  }

  save(): void {
    this.store.setProvider(this.provider);
    if (this.model.trim()) this.store.model.set(this.model.trim());
    this.store.apiKey.set(this.key.trim());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { folderLabel } from '../core/content-browser';
import { renderFile } from '../core/markdown';
import { ViewState } from '../state/view-state';

/**
 * layout.shell content-pane — the rendered README / file content, a loading
 * indicator while fetching (ui.edge-cases.loading-state), an explicit not-found
 * state (delivery.explicit-not-found), or a prompt when a persona is chosen but
 * no topic is open yet.
 */
@Component({
  selector: 'app-content-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="content-wrap">
      @if (state.loading()) {
        <p class="note" role="status">Loading…</p>
      } @else if (res()?.type === 'content') {
        <article class="markdown" [innerHTML]="html()" (click)="onLinkClick($event)"></article>
      } @else if (res()?.type === 'not-found') {
        <div class="pane-state">
          <h2>Not found</h2>
          <p>Nothing exists at <code>{{ notFoundPath() }}</code>.</p>
          <p class="note">The file may have been moved or removed since this link was made.</p>
        </div>
      } @else if (state.mode() === 'persona') {
        <div class="pane-state">
          <h2>{{ label(state.selectedPersona()) }}</h2>
          <p class="note">Pick a topic from the list on the left.</p>
        </div>
      } @else {
        <p class="note">Choose a persona, or open the schema docs.</p>
      }
    </div>
  `,
  styles: [
    `
      app-content-pane { display: block; height: 100%; }
      .content-wrap { max-width: 780px; margin: 0 auto; padding: 28px 36px 96px; }
      .note { color: var(--text-muted); font-size: 0.8125rem; }
      .pane-state h2 { margin-top: 0; }
    `
  ]
})
export class ContentPane {
  readonly state = inject(ViewState);
  private sanitizer = inject(DomSanitizer);

  readonly res = this.state.result;

  readonly notFoundPath = computed(() => {
    const r = this.res();
    return r?.type === 'not-found' ? '/' + r.path : '';
  });

  readonly html = computed(() => {
    const r = this.res();
    if (r?.type !== 'content') return '';
    return this.sanitizer.bypassSecurityTrustHtml(renderFile(r.name, r.text));
  });

  label(name: string | null): string {
    return name ? folderLabel(name) : "";
  }

  /**
   * navigation.routing.resolved-link-becomes-app-navigation: a click on a link
   * inside rendered markdown that resolves to an internal path routes through
   * the app (no page reload); external links are left to the browser.
   */
  onLinkClick(ev: MouseEvent): void {
    const a = (ev.target as HTMLElement).closest('a');
    if (!a) return;
    if (this.state.followLink(a.getAttribute('href') ?? '')) ev.preventDefault();
  }
}

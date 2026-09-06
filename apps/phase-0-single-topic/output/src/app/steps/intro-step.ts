import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BRAND } from '../brand/brand';

/**
 * step.introduction — frame the lab's purpose before any data entry.
 * mustNever: "Include any form field or data-entry control on this step".
 * micro.no-data-entry: captures no state; purely explanatory.
 */
@Component({
  selector: 'app-intro-step',
  standalone: true,
  template: `
    <h2>{{ brand.tagline }}</h2>
    <p class="lead">A short lab. You bring one topic; you leave with it rewritten for the people who need to read it.</p>

    <div class="card">
      <p>
        You paste <strong>one conceptual topic</strong> as raw text. You describe where it
        came from and what it covers. You name <strong>up to two readers</strong> and pick
        which dimensions each reading should bend along: format, depth, framing, reading
        time, evidence.
      </p>
      <p>
        Then you <strong>refract</strong>: one pass over the same topic text per reader,
        run through your own model provider with your own key. The outputs read
        differently because the readers differ — no facts are added or changed. Finally
        you <strong>publish for delivery</strong>: a plain request that returns a chosen
        persona’s version.
      </p>
      <p class="hint">Nothing is saved. Everything lives in this session only.</p>
    </div>

    <div class="actions">
      <span></span>
      <button (click)="begin()">Begin →</button>
    </div>
  `
})
export class IntroStep {
  readonly brand = BRAND;
  private router = inject(Router);

  begin(): void {
    this.router.navigate(['/topic']);
  }
}

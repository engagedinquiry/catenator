import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BRAND } from '../brand/brand';

/**
 * step.introduction — frame the lab before any data entry.
 *
 * mustNever "Include any form field or data-entry control on this step".
 * micro.no-data-entry: nothing here writes state. Content: one short paragraph
 * (purpose + outcome) and a "Begin" action to Step 1.
 */
@Component({
  selector: 'app-intro-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ brand.tagline }}</h1>
    <p class="lead">
      Take one conceptual topic, ground it with a source, describe up to two readers, and generate a version of
      the topic shaped for each reader using your own model provider. At the end you can publish those versions so
      a reader requests the one written for them.
    </p>
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

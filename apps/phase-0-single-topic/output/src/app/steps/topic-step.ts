import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStore } from '../core/session-store';

/**
 * Step 1 — the one conceptual topic. system.yaml mustNever "Allow more than 1
 * topic per lab instance": a single textarea, no way to add a second.
 */
@Component({
  selector: 'app-topic-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h2>Step 1 — Paste one conceptual topic</h2>
    <p class="hint">Plain text in. One topic. This is the only source of facts for every refraction later.</p>

    <label for="t">Topic text</label>
    <textarea id="t" class="big" [(ngModel)]="text" placeholder="Paste the topic here…"></textarea>

    <div class="actions">
      <span></span>
      <button [disabled]="!text.trim()" (click)="next()">Continue →</button>
    </div>
  `
})
export class TopicStep {
  private store = inject(SessionStore);
  private router = inject(Router);
  text = this.store.topicText();

  next(): void {
    if (!this.text.trim()) return;
    this.store.setTopic(this.text);
    this.router.navigate(['/sources']);
  }
}

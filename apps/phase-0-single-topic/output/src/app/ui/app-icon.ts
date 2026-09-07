import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  ViewEncapsulation,
  inject
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_REGISTRY, IconName } from './icon-registry';

/**
 * `<app-icon [name] [size]>` — renders a registry SVG string. ViewEncapsulation
 * .None so `svg { fill: currentColor }` reaches across the innerHTML boundary.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span class="app-icon-wrapper" [innerHTML]="svg"></span>`,
  styles: [
    `
      app-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        color: inherit;
      }
      app-icon .app-icon-wrapper { display: inline-flex; width: 100%; height: 100%; }
      app-icon svg {
        width: var(--app-icon-size, 20px) !important;
        height: var(--app-icon-size, 20px) !important;
        fill: currentColor !important;
        display: block;
        pointer-events: none;
      }
    `
  ],
  host: { '[style.--app-icon-size.px]': 'size' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppIcon implements OnChanges {
  private sanitizer = inject(DomSanitizer);

  @Input({ required: true }) name!: IconName;
  @Input() size = 20;

  svg: SafeHtml = '';

  ngOnChanges(): void {
    const raw = ICON_REGISTRY[this.name];
    this.svg = raw ? this.sanitizer.bypassSecurityTrustHtml(raw) : '';
  }
}

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from './session-store';
import { canReach, earliestIncomplete, StepPath } from './step-order';

export { earliestIncomplete };

/**
 * gating.linear-sequential — route guards over the pure step-order logic.
 *
 * micro.redirect-on-incomplete: a direct access to a later step redirects to
 * `earliestIncomplete`. The step-nav panel renders plain routerLinks, so a click
 * on a locked step hits the same guard (layout.three-panel.nav-display-only).
 *
 * interrupt.conditional-api-key.hard-block-at-refract-only is handled inside the
 * Refract step, not here — a missing key is not "a prior step's data" and must
 * not block Steps 0-3.
 */
function guardFor(target: StepPath): CanActivateFn {
  return () => {
    const s = inject(SessionStore);
    const router = inject(Router);
    if (canReach(target, s)) return true;
    return router.createUrlTree(['/', earliestIncomplete(s)]);
  };
}

export const sourcesGuard = guardFor('sources');
export const personasGuard = guardFor('personas');
export const refractGuard = guardFor('refract');
export const publishGuard = guardFor('publish');

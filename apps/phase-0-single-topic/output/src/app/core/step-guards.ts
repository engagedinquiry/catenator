import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FlowState, redirectTarget, StepPath } from './gate-rules';
import { SessionStore } from './session-store';

/**
 * gating.linear-sequential — Angular wiring over the pure rules in gate-rules.ts.
 *
 * mustNever: "Allow step-nav clicks to skip incomplete prior steps" — StepNav
 * rows are plain routerLinks, so a click on a locked step runs the same guard
 * and redirects back exactly as typing the URL would.
 */
function flowState(s: SessionStore): FlowState {
  return {
    hasTopic: s.hasTopic(),
    hasSources: s.hasSources(),
    hasPersonas: s.hasPersonas(),
    hasRefractions: s.hasRefractions()
  };
}

function guardFor(step: StepPath): CanActivateFn {
  return () => {
    const store = inject(SessionStore);
    const router = inject(Router);
    const target = redirectTarget(step, flowState(store));
    return target === null ? true : router.createUrlTree(['/' + target]);
  };
}

export const sourcesGuard = guardFor('sources');
export const personasGuard = guardFor('personas');
export const refractGuard = guardFor('refract');
export const publishGuard = guardFor('publish');

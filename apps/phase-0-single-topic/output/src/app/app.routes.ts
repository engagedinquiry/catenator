import { Routes } from '@angular/router';
import { personasGuard, publishGuard, refractGuard, sourcesGuard } from './core/step-guards';

/**
 * deployedProcess.steps: [Introduction, Topic, Sources, Personas, Refract, Publish]
 * plus a non-step Settings page. interrupt.conditional-api-key is deliberately
 * NOT a route here — it is a shell banner.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'intro' },
  { path: 'intro', loadComponent: () => import('./steps/intro-step').then((m) => m.IntroStep) },
  { path: 'topic', loadComponent: () => import('./steps/topic-step').then((m) => m.TopicStep) },
  {
    path: 'sources',
    canActivate: [sourcesGuard],
    loadComponent: () => import('./steps/sources-step').then((m) => m.SourcesStep)
  },
  {
    path: 'personas',
    canActivate: [personasGuard],
    loadComponent: () => import('./steps/personas-step').then((m) => m.PersonasStep)
  },
  {
    path: 'refract',
    canActivate: [refractGuard],
    loadComponent: () => import('./steps/refract-step').then((m) => m.RefractStep)
  },
  {
    path: 'publish',
    canActivate: [publishGuard],
    loadComponent: () => import('./steps/publish-step').then((m) => m.PublishStep)
  },
  { path: 'settings', loadComponent: () => import('./steps/settings-page').then((m) => m.SettingsPage) },
  { path: '**', redirectTo: 'intro' }
];

import { Routes } from '@angular/router';

/**
 * navigation.routes — three real, bookmarkable levels:
 *
 *   /                     -> home: renders docs/README.md, the "which one is
 *                            you?" router. NOT a persona/topic view.
 *   /:personaId           -> that persona's topic list, defaulting to 'start'
 *   /:personaId/:topicId  -> a specific topic for that persona
 *
 * plus /standard — the persona-invariant Catenator standard. It is listed
 * before /:personaId so the literal segment wins over the param.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home-page').then((m) => m.HomePage) },
  { path: 'standard', loadComponent: () => import('./pages/standard-page').then((m) => m.StandardPage) },
  {
    path: ':personaId/:topicId',
    loadComponent: () => import('./pages/persona-page').then((m) => m.PersonaPage)
  },
  { path: ':personaId', loadComponent: () => import('./pages/persona-page').then((m) => m.PersonaPage) },
  { path: '**', redirectTo: '' }
];

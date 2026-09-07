import { Routes } from '@angular/router';

/**
 * A Delivery-only app: one reader workspace plus a persona-invariant "view the
 * standard" area. No wizard, no gating, no auth.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/reader-page').then((m) => m.ReaderPage) },
  { path: 'standard', loadComponent: () => import('./pages/standard-page').then((m) => m.StandardPage) },
  { path: '**', redirectTo: '' }
];

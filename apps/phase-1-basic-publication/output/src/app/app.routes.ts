import { Routes } from '@angular/router';

/**
 * Two routes only. This phase is a single workspace (three-panel layout), not a
 * step sequence — Panel 1 selection drives everything, held in PublicationStore.
 *
 * Settings (BYOK key entry) is a plain page, reachable any time — NOT a modal
 * dialog (system.yaml mustNever) and not one of Panel 1's five accordion
 * sections.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./ui/workspace').then((m) => m.Workspace) },
  { path: 'settings', loadComponent: () => import('./ui/settings-page').then((m) => m.SettingsPage) },
  { path: '**', redirectTo: '' }
];

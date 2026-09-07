import { Component } from '@angular/core';
import { Routes } from '@angular/router';

/**
 * navigation.routing — every content path is a real, bookmarkable URL that
 * mirrors the folder path exactly, order prefixes included. One catch-all route
 * so the Router accepts any real path; the root `App` component watches
 * `router.url` and
 * `ViewState.applyRoute()` derives the state — so a direct/bookmarked load
 * behaves identically to clicking through (micro.direct-load-works).
 *
 * Routes are set only by the app's own controls (Home, dropdown, topic list,
 * schema tree) — never by intercepting markdown-rendered <a> tags.
 */
@Component({ selector: 'app-route-sink', standalone: true, template: '' })
export class RouteSink {}

export const routes: Routes = [{ path: '**', component: RouteSink }];

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

// view.state mustNever "Use Angular Router" — no provideRouter, no routes.
bootstrapApplication(App).catch((err) => console.error(err));

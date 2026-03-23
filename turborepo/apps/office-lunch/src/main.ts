import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initDb } from '@office-lunch/util';

(window as unknown as { __initDb: typeof initDb }).__initDb = initDb;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

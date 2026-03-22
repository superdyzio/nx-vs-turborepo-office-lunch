import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initDb } from './app/helpers/init-db';

(window as any).__initDb = initDb;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Hash-based routing (/it-ops-maturity-dashboard/#/admin instead of
    // /it-ops-maturity-dashboard/admin) - this app is mounted as a subfolder
    // of the CSM shell (see angular.json's assets glob copying this app's
    // build output to /it-ops-maturity-dashboard), which the shell's server
    // config has no knowledge of. With path-based routing, a hard reload on
    // any route past the root sends the server a URL it can't map to a real
    // file, so it falls back to the SHELL's own index.html instead of this
    // app's - the shell then boots at a URL it doesn't recognize and its
    // login guard fires (reads as "reload -> redirected to login").
    // Everything after "#" never reaches the server at all, so the browser
    // only ever requests /it-ops-maturity-dashboard/ (a real file that
    // already reloads correctly) - this fixes reloads identically in local
    // dev, UAT, and production with no server-side rewrite rule or dev-server
    // proxy config needed anywhere.
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
  ],
};

/**
 * Application configuration for Angular 19
 * Replaces app.module.ts with modern standalone configuration
 * Preserves all services and providers from legacy application
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHighcharts } from 'highcharts-angular';
import { highchartsFactory } from './highcharts-init';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, 
      // withHashLocation(), // REMOVED: Using PathLocationStrategy for clean URLs
      withComponentInputBinding() // Enable route parameter binding to component inputs
    ),
    provideHttpClient(
      withInterceptors([tokenInterceptor]) // Token interceptor for authentication headers
    ),
    provideAnimations(),
    provideNativeDateAdapter(), // Required for MatDatepicker
    provideHighcharts({
      instance: highchartsFactory as any
    })
  ]
};

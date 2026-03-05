import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const config: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    importProvidersFrom(BrowserAnimationsModule)
  ]
};
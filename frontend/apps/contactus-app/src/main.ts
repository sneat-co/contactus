// Main entry point for contactus.app
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  getStandardSneatProviders,
  provideAppInfo,
  provideRolesByType,
} from '@sneat/app';
import { SneatApp } from '@sneat/core';
import { authRoutes } from '@sneat/auth-ui';
import { provideContactusInternal } from '@sneat/extension-contactus-internal';
import { App } from './app/app';
import { appRoutes } from './app/app.routes';
import { contactusAppEnvironmentConfig } from './environments/environment';
import { registerIonicons } from './register-ionicons';

bootstrapApplication(App, {
  providers: [
    ...getStandardSneatProviders(contactusAppEnvironmentConfig),
    // Bind the contactus contract tokens (CONTACT_SERVICE, …) to their concrete
    // implementations. The app is the composition root and may wire -internal.
    ...provideContactusInternal(),
    // 'contactus' is not yet a member of the @sneat/core SneatApp union; cast
    // until it is registered upstream (tracked follow-up).
    provideAppInfo({ appId: 'contactus' as SneatApp, appTitle: 'Contactus.app' }),
    provideRouter([...appRoutes, ...authRoutes]),
    provideRolesByType(undefined),
  ],
}).catch((err) => console.error(err));

registerIonicons();

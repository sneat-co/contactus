import { Route } from '@angular/router';
import { contactusRoutes } from '@sneat/extension-contactus-internal';
import { SpaceComponentBaseParams } from '@sneat/space-components';
import { ContactusSpaceMenuComponent } from './contactus-space-menu.component';

// Thin, contactus-only space shell. It provides SpaceComponentBaseParams (which
// resolves the active space from the :spaceType/:spaceID route params) to all
// children, then mounts ONLY the contactus routes — unlike sneat-app's
// @sneat/space-pages, which bundles every extension. This keeps contactus.app
// decoupled while reusing the published @sneat/space-components context wiring.
//
// contactusRoutes is exported by -internal (not -shared): in this extension the
// pages/routes live in the internal tier, and the app is the composition root
// allowed to consume type:internal.
export const contactusSpaceRoutes: Route[] = [
  {
    path: '',
    providers: [SpaceComponentBaseParams],
    children: [
      {
        // contactus-specific side menu (space selector + Contacts/Members)
        // instead of the generic SpaceMenuComponent, which hardcodes every
        // sneat-app extension — none of which exist here.
        path: '',
        component: ContactusSpaceMenuComponent,
        outlet: 'menu',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'contacts',
      },
      ...contactusRoutes,
    ],
  },
];

# contactus

Contactus — the Sneat **contacts & membership system of record**. A Sneat
**Space** owns **Contacts** (people, companies, pets) and **Members**, each
carrying typed metadata, communication channels, addresses, roles, and
relationships. Contactus answers *"who is connected to this space?"*.

**License:** [AGPL-3.0](LICENSE)

## Repository layout

This repo hosts two independent toolchains in subdirectories — neither
`package.json` nor `go.mod` lives at the repo root (mirrors the
[`assetus`](https://github.com/sneat-co/assetus) layout):

| Directory | Stack | Description |
|-----------|-------|-------------|
| [`backend/`](backend) | Go | The `contactus` space module (extraction is a separate planned workstream — see [`backend/README.md`](backend/README.md)) |
| [`frontend/`](frontend) | Nx · Angular · Ionic · pnpm | The `contactus-app` standalone app and the `@sneat/extension-contactus-*` libraries (see [Frontend](#frontend)) |

## Backend

The backend is a Sneat **space module** persisted on **Firestore via dalgo**
under `/spaces/{spaceID}/ext/contactus/...`. Its extraction into this repo is a
separate planned workstream; today it lives in
[`github.com/sneat-co/sneat-core-modules/contactus`](https://github.com/sneat-co/sneat-core-modules/tree/main/contactus).
See [`backend/README.md`](backend/README.md).

## Frontend

```bash
cd frontend
pnpm install
npx nx build contactus-app
npx nx run-many -t lint test
```

### Library structure (extension library-architecture convention)

The contactus frontend follows the **extension library-architecture** convention —
an extension is split into three libraries by *runtime weight* and *visibility*,
so other repos can depend on a light **contract** instead of the full bundle, and
cross-extension calls go through dependency-inverted `InjectionToken`s rather than
direct implementation imports. The convention is defined in
[`sneat-co/sneat-libs` → `spec/features/extension-library-architecture`](https://github.com/sneat-co/sneat-libs/tree/main/spec/features/extension-library-architecture/README.md).

| Lib | nx tags | Holds | May depend on |
|-----|---------|-------|---------------|
| [`@sneat/extension-contactus-contract`](frontend/libs/extensions/contactus/contract) | `type:contract` | Contact/Member DTOs/types/enums + the contactus `InjectionToken`s (`CONTACT_SERVICE`, …). Runtime-light — no components/services. | other contracts + foundational `@sneat/*` |
| [`@sneat/extension-contactus-shared`](frontend/libs/extensions/contactus/shared) | `type:shared` | The app-facing UI: components, pipes, modals. Obtains services via the contract tokens. | `-contract` + foundational — **never `-internal`** |
| [`@sneat/extension-contactus-internal`](frontend/libs/extensions/contactus/internal) | `type:internal` | The concrete services, pages and routes (`contactusRoutes`) + `provideContactusInternal()`. Private implementation. | `-contract` / `-shared` + foundational |

The boundary matrix is enforced by `@nx/enforce-module-boundaries` in
`frontend/eslint.config.mjs` (a `type:shared → type:internal` import fails lint).
`-internal` is consumed only by the composition-root **app**, which wires
`provideContactusInternal()` at bootstrap (`frontend/apps/contactus-app/src/main.ts`)
to bind the contactus contract tokens to their concrete services, and mounts
`contactusRoutes` from `-internal`.

## Standards

This is a **Sneat extension** — build it against the shared platform standards:

- **[Sneat extension standards](https://github.com/sneat-co/sneat-libs/blob/main/docs/extension-standards/README.md)** — backend wiring, frontend apps, and UX conventions.
- **[Frontend UX standards](https://github.com/sneat-co/sneat-specs/blob/main/standards/frontend-ux/README.md)** — cards, buttons, lists, page layout, forms, modals, and loading/empty/error states.
- **[Screen flows & the UI component checklist](https://github.com/sneat-co/sneat-specs/blob/main/standards/frontend-ux/flows.md)** — read **before** building any form, page, or wizard: it covers how screens connect (entry → action → exit) so they don't end up orphaned.

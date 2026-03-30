# Architecture Documentation

> Keep this file updated as features are added or architecture changes.

## Last Updated
2026-03-30

## Table of Contents
- [Overview](#overview)
- [Tech Stack Summary](#tech-stack-summary)
- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Mock Backend (server shape)](#mock-backend-server-shape)
- [Logical Database](#logical-database)
- [API Shape](#api-shape)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)

## Overview

**Heirloom** is a frontend-only SPA built with Vite and React, deployable to **Surge.sh**. It intentionally **mimics** a full-stack app: in-browser modules under `src/mockBackend/` correspond to `server/routes`, `server/services`, `server/queries`, and `server/db` so future migration to a real Express + PostgreSQL API is mostly a swap of the transport layer (HTTP) while keeping helper and Redux patterns stable.

## Tech Stack Summary

- **Frontend**: React 19, React Router 7, Redux Toolkit, Ionic React (UI primitives), Tailwind CSS, React Hot Toast
- **Build / host**: Vite 6, static `dist/` on Surge
- **Testing**: Vitest, Testing Library
- **Backend (production)**: None — mock only
- **Database (production)**: None — see `DATABASE_SCHEMA.md` for the **logical** schema implemented in `src/mockBackend/db`

## System Architecture

### High-Level Diagram

```
[Browser / Surge CDN]
        │
        ▼
[ React + Redux + Router ]
        │
        ▼
[ helpers → mockBackend/routes → services → queries → db ]
        │
        └── (future) fetch('/api/...') → Express → PostgreSQL
```

## Frontend Architecture

### Component hierarchy

```
main.jsx
├── Provider (Redux)
├── NativeProvider (web placeholder)
├── BrowserRouter
└── IonApp
    └── AppRoutes
        ├── Home (public)
        ├── Login (public)
        └── AppShell (private)
            └── AppNav
```

### State management

- **auth**: user, `isAuthenticated`, `isProfileComplete`, status
- **global**: `appName` and other cross-cutting UI state (extend per feature)

### Routing

- **Public**: `/`, `/login`
- **Private**: `/app` (wrapped in `PrivateRoute`)
- **Lazy loading**: route components use `React.lazy`

### Key contexts

- **NativeProvider** (`src/utils/NativeContext.jsx`): Surge/web shell exposes `isNative: false`; extend if you add Capacitor later.

### Configuration

- **Vite**: `vite.config.js` (`base: './'` for static hosts)
- **Tailwind**: `tailwind.config.js`, `src/index.css`

## Mock Backend (server shape)

| Full-stack template | Heirloom |
|---------------------|----------|
| `server/db/index.js` | `src/mockBackend/db/index.js` |
| `server/queries/*` | `src/mockBackend/queries/*` |
| `server/services/*` | `src/mockBackend/services/*` |
| `server/routes/*` | `src/mockBackend/routes/*` |

**Request flow (conceptual)**  
UI → `helpers/*` → `mockBackend/routes` → `services` → `queries` → in-memory store (optional `localStorage` persistence hooks in `db/index.js`).

## Logical Database

Authoritative documentation: **`DATABASE_SCHEMA.md`**. The mock seed user (`demo`) matches the documented `users` table for local demos.

## API Shape

When replacing mocks with a real backend, target the same JSON envelopes the mock services return today, for example:

- **POST login (conceptual)**: `{ user, isProfileComplete }` on success
- **GET me**: same shape or 401

(See `src/mockBackend/services/authService.js` for current mock responses.)

## Deployment

### Surge

1. `npm run build`
2. `npx surge dist your-domain.surge.sh`  
   or use `npm run deploy:surge` if the Surge CLI is installed globally.

### Notes

- **No SSR**: all data is client-side or from future real APIs.
- **CSP**: basic policy in `index.html`; relax only when you add trusted third-party origins.

## Development Workflow

1. Add UI under `src/components/` / `src/routes/`.
2. Add feature helpers under `src/helpers/`.
3. Mirror server layers under `src/mockBackend/` (`queries` → `services` → `routes`).
4. Update **`ARCHITECTURE.md`** and **`DATABASE_SCHEMA.md`** when behavior or schema changes.
5. Add tests under `src/tests/` per `TESTING_GUIDELINES.md`.

## Testing Strategy

- **Unit / component**: Vitest + Testing Library in `src/tests/`
- **Shared fetch mocks**: `src/tests/__mocks__/fetchMocks.js` when you introduce real `fetch` calls

## Known Limitations

- Mock auth session is in-memory (lost on full page reload) unless you extend persistence.
- Ionic `routerLink` is not used; navigation uses React Router (`useNavigate` / `Link`).

## Future Improvements

- Optional **MSW** or **OpenAPI**-generated client when backend exists.
- **Capacitor** if you need native shells; align with `APP_SHELL_PROMPT.md` native section.

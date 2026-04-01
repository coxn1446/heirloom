# Heirloom

Frontend-only React app designed for [Surge.sh](https://surge.sh) static hosting. There is **no Node server** in production: `src/mockBackend` mirrors the service/query/route layers of a typical Express + PostgreSQL stack so you can build features against a stable shape, then swap in real APIs later.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm start` | CRA dev server (Fast Refresh **off** — required for React 19 + CRA; see `ARCHITECTURE.md`) |
| `npm run build` | Production build → `build/` |
| `npm test` | Jest (via `react-scripts`) |
| `npm run deploy:surge` | Build and deploy `build/` (requires `surge` CLI) |

## Mock auth

- Open the app, go to **Sign in**, use username **`demo`** (no password in the shell).
- Session is in-memory inside `src/mockBackend/services/authService.js` (refresh clears it unless you extend persistence).

## Documentation

- `ARCHITECTURE.md` — system design (static + mock backend).
- `DATABASE_SCHEMA.md` — logical schema; implementation is mock data until a real DB exists.
- `APP_SHELL_PROMPT.md` — reference architecture for full-stack apps (parent template).
- `DOCUMENTATION_GUIDE.md` — how to maintain docs.
- `TESTING_GUIDELINES.md` — testing conventions.

## Project layout

Client code follows the app-shell layout under `src/` (`components/`, `routes/`, `store/`, `helpers/`, `tests/`). Server-shaped code lives under `src/mockBackend/` (`db/`, `queries/`, `services/`, `routes/`).

# Pokédex

A Pokédex built with SvelteKit 3 and Svelte 5. It reads Pokémon, item and move data from [PokeAPI](https://pokeapi.co) and trading cards from [TCGdex](https://tcgdex.dev).

## Features

Search with type, generation and stat filters, Pokémon detail pages with evolution chains and learnsets per game, side-by-side comparison, a team builder, a battle simulator, items, berries, TMs, natures, abilities and TCG cards. `FEATURES.md` lists what exists and what is planned.

## Requirements

Node.js 22.17 or newer (`engines` is enforced by `.npmrc`).

## Getting started

```bash
npm ci
npm run dev
```

The dev server runs on http://localhost:5173. No environment variables are needed.

## Scripts

| Command            | What it does                                             |
| ------------------ | -------------------------------------------------------- |
| `npm run dev`      | Dev server with the cache debug widget                   |
| `npm run build`    | Production build with `adapter-node`, output in `build/` |
| `npm run preview`  | Serves the production build locally                      |
| `npm run check`    | Type check with `svelte-check`                           |
| `npm run lint`     | Prettier check and ESLint                                |
| `npx vitest --run` | Unit and component tests                                 |
| `npm run test:e2e` | Playwright tests, including the axe accessibility audit  |

Run `npx playwright install chromium` once before the e2e tests. To run the production build on its own, use `PORT=3000 node build`.

## Project layout

```
src/
  routes/          Pages and their +page.server.ts loaders
  components/      Svelte components (ui, battle, search, team, header)
  lib/
    api/           fetchJson (retry, timeout), TtlCache (LRU), bounded batch fetching
    services/      PokeAPI and TCGdex clients built on lib/api
    stores/        Rune based stores (*.svelte.ts)
    utils/         Pure logic: type chart, learnsets, sorting, filters
    testing/       Fixtures shared by tests
e2e/               Playwright tests
```

Imports use the `#lib/...` alias, defined in `package.json` `imports` and `tsconfig.json` `paths`.

## How data loading works

Every outbound request goes through `src/lib/api/http.ts`. It retries network errors and 429 or 5xx responses, fails fast on 4xx, and caps parallel requests at 20 for batch fetches. Responses are cached in an LRU `TtlCache` with in-flight de-duplication, so two callers asking for the same Pokémon share one request.

Server loaders return only what a page renders. The home page sends a summary of eight Pokémon, not the full API objects. The Pokémon detail page answers 404 for an unknown name, 502 when PokeAPI is down, and sends a `Cache-Control` header.

## Testing

Unit tests cover the API layer, the battle engine, the type chart, sorting, filters, learnsets and the team store. Component tests cover the shared UI. Playwright covers the main flows and runs an axe audit on nine pages. The audit fails on any non-contrast violation and caps color contrast violations per page, so they can go down but not up.

CI (`.github/workflows/ci.yml`) runs lint, type check, unit tests, build and e2e on every pull request.

## Known gaps

- Offline support (a service worker) is not implemented.
- 75 `{#each}` blocks have no key. ESLint reports them as warnings.
- Some decorative overlays on type colored cards still fail color contrast. The budgets in `e2e/a11y.test.ts` show where.
- TypeScript stays on 6 because SvelteKit 3 requires `typescript ^6`.

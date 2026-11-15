# Perso frontend

React/Vite/TypeScript, Persian-first RTL, mint styling and Vazirmatn served locally. The live application uses the Go API through `/api/v1` and the parent Nginx reverse proxy. The explicit `?mode=demo` preview is a separate lazily loaded healthcare prototype; failed live requests never fall back to its fixtures.

Requires Node 24:

```sh
npm ci
npm run dev
npm run typecheck
npm run build
```

Vite proxies `/api` to `http://127.0.0.1:8080`; override with `API_PROXY_TARGET` during local development. Enter the server's operator API token on the login form. It is kept in session storage and never placed in URLs or build-time configuration. Language preference uses local storage. Source status and interests are server data, while navigation uses URL hashes and survives reload.

The initial live catalog is electronics. Add interests from the actual catalog; adding an interest does not invent a price, offer, seller or stock state. Unsupported prototype settings are absent from the live UI. Outreach defaults to disabled and its enabled status comes from the authenticated session endpoint.

## Contract and tests

From a parent checkout, generate transport types from the canonical backend OpenAPI specification:

```sh
npm run generate:api
npm run check:api
```

`src/api/schema.ts` is generated. `src/api/client.ts` owns transport behavior and `src/live/useResource.ts` protects resource updates from out-of-order responses. The mint live styles are scoped under `.live-app`.

```sh
npx playwright install chromium
npm test
```

The isolated preview test runs standalone. Set `PERSO_E2E_LIVE=1` and `PERSO_E2E_TOKEN` only against a disposable full stack to run all server-backed tests. The parent CI starts that stack and tests actual login, ingestion, interests, source pause/resume, error states, mobile RTL/LTR and automated WCAG AA checks. Browser traces/screenshots are diagnostic artifacts and ignored by git.

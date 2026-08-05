# declarative-migrations.github.io

The organization site for [**dpm**](https://github.com/declarative-migrations/declarative-postgres-migrate.rs) —
declarative, ORM-agnostic Postgres schema migration. A single static page:
introspect two states, diff the catalogs, emit reviewable SQL, prove
convergence, countersign with seven independent tools.

Live at <https://declarative-migrations.github.io>.

## Stack

- [Astro](https://astro.build) static build (no client-side JavaScript).
- Deployed to GitHub Pages by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`.
- Verified in CI by [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (Playwright browser tests) on every push and pull request.

## Layout

```
src/
  layouts/Layout.astro   document shell: <head> meta, CSP, global styles
  pages/index.astro      the page content + page-scoped styles
tests/
  site.spec.mjs          Playwright browser-automation tests
playwright.config.mjs    builds the site, previews it, runs tests against it
```

## Develop

```sh
npm install
npm run dev        # http://localhost:4321 with hot reload
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Test

The test suite is **browser automation** ([Playwright](https://playwright.dev)):
it builds the site, serves the production output with `astro preview`, and
drives a headless Chromium (desktop + mobile viewport) against it — so what CI
checks is exactly what Pages ships.

```sh
npx playwright install chromium   # one-time
npm test                          # build + preview + run the browser tests
npm run test:ui                   # interactive Playwright UI
```

What it asserts: title/description/canonical metadata, a single tagline `h1`,
the install commands (curl / brew / cargo, with `{repo}` actually
interpolated), all four feature cards, all seven cross-check tools, the ORM
table, the primary CTA link targets, that every link has a real `href`, the
Content-Security-Policy (no inline/remote script permitted), accessibility
basics (`lang`, favicon, a labelled flow diagram), no horizontal overflow at
mobile width, dark-mode background, and a clean console (no page or console
errors).

## Security

The page ships a `Content-Security-Policy` `<meta>` tag
([`Layout.astro`](src/layouts/Layout.astro)): `default-src 'self'`,
`script-src 'self'` (no inline or remote script), `object-src 'none'`. GitHub
Pages cannot set response headers, so header-only directives
(`frame-ancestors`, `upgrade-insecure-requests`) are intentionally omitted — a
CDN in front of Pages would be the place to add them. GitHub Actions are
SHA-pinned; workflow tokens are least-privilege (`contents: read` for CI;
Pages-scoped for deploy).

## License

MIT © Alex Mills. See [LICENSE](LICENSE).

import { test, expect } from '@playwright/test';

const REPO = 'https://github.com/declarative-migrations/declarative-postgres-migrate.rs';

// Fail the suite on any uncaught page error or console error — a static
// content site should load with a clean console.
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.testErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.testErrors ?? [], 'no page/console errors').toEqual([]);
});

test('loads with correct title and meta', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/dpm/i);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Postgres schema migration/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://declarative-migrations.github.io/');
});

test('exactly one h1 with the tagline', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText('Diff it like one');
});

test('install section shows curl, brew, and cargo commands', async ({ page }) => {
  await page.goto('/');
  const install = page.locator('section', { hasText: 'Install' }).first();
  await expect(install).toContainText('curl -fsSL');
  await expect(install).toContainText('scripts/install.sh | bash');
  await expect(install).toContainText('brew install declarative-migrations/tap/dpm');
  await expect(install).toContainText('cargo install --git');
  // the {repo} interpolation must have rendered, not leaked as a literal brace
  await expect(install).not.toContainText('{repo}');
});

test('all four feature cards render', async ({ page }) => {
  await page.goto('/');
  for (const title of ['Any source, any target', 'Convergence, proven', 'Destructive = two consents', 'Supabase-aware']) {
    await expect(page.locator('.card h3', { hasText: title })).toBeVisible();
  }
});

test('all seven cross-check tools are listed', async ({ page }) => {
  await page.goto('/');
  const tools = ['migra', 'pgdiff', 'atlas', 'stripe/pg-schema-diff', 'liquibase', 'apgdiff', 'flyway'];
  const chips = page.locator('.tool');
  await expect(chips).toHaveCount(tools.length);
  // Set-equality on normalized chip text — substring matching would conflate
  // pgdiff/apgdiff.
  const labels = (await chips.allInnerTexts()).map((t) => t.replace('✓', '').trim()).sort();
  expect(labels).toEqual([...tools].sort());
});

test('ORM table lists the expected rows', async ({ page }) => {
  await page.goto('/');
  for (const orm of ['Drizzle', 'Prisma', 'SeaORM', 'Raw SQL']) {
    await expect(page.locator('table td', { hasText: orm }).first()).toBeVisible();
  }
});

test('primary CTA links point at the canonical repo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', REPO);
  await expect(page.getByRole('link', { name: /Releases/ })).toHaveAttribute('href', `${REPO}/releases`);
});

test('every link has a non-empty href and no dead fragments', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) {
    expect(h, 'href present').toBeTruthy();
    expect(h === '#' || h === '', 'no placeholder href').toBeFalsy();
  }
});

test('CSP meta present and forbids remote/inline script', async ({ page }) => {
  await page.goto('/');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  // the script-src directive itself must be exactly 'self' — no 'unsafe-inline'
  // /'unsafe-eval' between it and the next directive separator.
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toMatch(/script-src[^;]*unsafe/);
});

test('accessibility basics: lang, landmarks, favicon', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  // the ASCII flow diagram is labelled for screen readers
  await expect(page.locator('.flow')).toHaveAttribute('role', 'img');
  await expect(page.locator('.flow')).toHaveAttribute('aria-label', /convergence/i);
});

test('no horizontal overflow at the current viewport', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'body must not scroll horizontally').toBeLessThanOrEqual(1);
});

test('dark mode applies the dark background', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto('/');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  // --bg dark is #101318 => rgb(16, 19, 24)
  expect(bg).toBe('rgb(16, 19, 24)');
  await ctx.close();
});

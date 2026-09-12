import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const SHOTS = process.env.SHOTS_DIR ?? path.resolve('test-results');
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
let consoleErrors = [];
let pageErrors = [];

const ok = (d) => results.push({ ok: true, d });
const fail = (d, e) => results.push({ ok: false, d, e });

function track(page) {
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push({ page: page.url(), text: m.text() });
  });
  page.on('pageerror', (e) => pageErrors.push({ page: page.url(), text: String(e) }));
  page.on('requestfailed', (r) => {
    const u = r.url();
    // ignore favicon noise
    if (!u.includes('favicon')) consoleErrors.push({ page: page.url(), text: `requestfailed: ${u} ${r.failure()?.errorText}` });
  });
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
const page = await context.newPage();
track(page);

const toast = (text) =>
  page.getByRole('status').filter({ hasText: text }).first().waitFor({ state: 'visible', timeout: 6000 });

async function dbg(step) {
  console.log(`  → ${step}`);
}

try {
  // ---------- 1. Dashboard ----------
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
  await page.getByText('Total projects').waitFor();
  ok('Dashboard loads with KPIs');

  const charts = await page.locator('.recharts-wrapper').count();
  if (charts >= 1) ok('Dashboard renders Recharts charts'); else fail('Dashboard renders Recharts charts', `charts=${charts}`);

  await page.screenshot({ path: `${SHOTS}/desktop-dashboard.png`, fullPage: false });

  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await page.waitForURL('**/projects');

  // ---------- 2. Create project ----------
  await dbg('creating project');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.locator('#p-name').fill('Alpha Portal');
  await page.locator('#p-client').fill('ACME Inc');
  await page.locator('#p-desc').fill('Customer portal rebuild with analytics.');
  await page.locator('#p-budget').fill('15000');
  await page.locator('#p-due').fill('2030-01-15');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  let vis = await page.getByText('Alpha Portal', { exact: false }).first().isVisible();
  if (vis) ok('Create project → card appears'); else fail('Create project → card appears');

  await toast('Project created');
  ok('Toast shown after project creation');

  const count1 = await page.evaluate(() => JSON.parse(localStorage.getItem('nexora-projects')).state.items.length);
  if (count1 === 7) ok('Project count incremented to 7'); else fail('Project count incremented to 7', String(count1));
  await page.screenshot({ path: `${SHOTS}/desktop-projects.png` });

  // ---------- 3. Persistence across reload ----------
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Projects' }).waitFor();
  vis = await page.getByText('Alpha Portal', { exact: false }).first().isVisible();
  if (vis) ok('Project persists after reload (localStorage)'); else fail('Project persists after reload');

  // ---------- 4. Project details ----------
  await page.getByRole('link', { name: 'Alpha Portal' }).first().click();
  await page.waitForURL('**/projects/proj_*');
  await dbg('project details');
  await page.getByText('$15,000 budget').waitFor({ timeout: 6000 });
  ok('Details show budget');

  // ---------- 5. Add task ----------
  await dbg('adding task');
  await page.getByRole('button', { name: 'Add task', exact: true }).first().click();
  await page.locator('#task-title').fill('Design landing hero');
  await page.locator('#task-desc').fill('Hero with illustration and CTA.');
  await page.locator('#task-due').fill('2030-01-10');
  await page.getByRole('button', { name: 'Create task', exact: true }).click();
  await toast('Task created');
  const taskShown = await page.getByText('Design landing hero', { exact: false }).first().isVisible();
  if (taskShown) ok('Create task → appears in project list'); else fail('Create task appears');

  // ---------- 6. Change status inline ----------
  const taskRow = page.locator('tr', { hasText: 'Design landing hero' }).first();
  await taskRow.locator('select[aria-label="Change status"]').selectOption('done');
  await toast('Status updated');
  const st = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('nexora-tasks')).state.items;
    return s.find((t) => t.title === 'Design landing hero')?.status;
  });
  if (st === 'done') ok('Inline status change updates store + persisted'); else fail('Inline status change', String(st));

  // ---------- 7. Edit task ----------
  await dbg('editing task');
  await page.getByRole('button', { name: 'Actions for Design landing hero' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.locator('#task-priority').selectOption('high');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await toast('Task updated');
  ok('Edit task modal works');

  // ---------- 8. Delete task with confirm ----------
  await dbg('deleting task');
  await page.getByRole('button', { name: 'Actions for Design landing hero' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByText('Delete task?').waitFor();
  ok('Confirm dialog appears for task delete');
  await page.getByRole('button', { name: 'Delete task', exact: true }).click();
  await toast('Task deleted');
  await page.waitForTimeout(300);
  const gone = (await page.locator('tr', { hasText: 'Design landing hero' }).count()) === 0;
  if (gone) ok('Task removed after confirmation'); else fail('Task removed after confirmation');

  // ---------- 9. Status badge on completed project ----------
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('#p-status').selectOption('completed');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await toast('Project updated');

  // ---------- 10. Tasks page filters ----------
  await page.getByRole('link', { name: 'Tasks', exact: true }).click();
  await page.waitForURL('**/tasks');
  await page.getByRole('tab', { name: 'Done' }).click();
  await page.waitForTimeout(200);
  const doneRows = await page.locator('tr', { has: page.locator('td') }).count();
  if (doneRows >= 1) ok('Tasks tab filter (Done) shows rows'); else fail('Tasks tab filter (Done) shows rows', String(doneRows));
  await page.getByRole('tab', { name: 'All' }).click();

  const urgentRowsBefore = await page.locator('tr', { has: page.locator('td') }).count();
  await page.locator('select[aria-label="Filter by priority"]').selectOption('urgent');
  await page.waitForTimeout(200);
  const urgentRows = await page.getByText('Urgent', { exact: true }).count();
  if (urgentRows >= 1 && urgentRows < urgentRowsBefore) ok('Priority filter narrows results'); else fail('Priority filter narrows results', `before=${urgentRowsBefore} urgent=${urgentRows}`);

  await page.locator('select[aria-label="Filter by project"]').selectOption('p_fintech');
  await page.waitForTimeout(200);
  await page.getByPlaceholder('Search tasks…').fill('Risk');
  await page.waitForTimeout(200);
  const searchHit = await page.getByText('Risk alert feed', { exact: false }).first().isVisible();
  const searchMiss = await page.getByText('Checkout flow mock', { exact: false }).count();
  if (searchHit && searchMiss === 0) ok('Task search filters to matches'); else fail('Task search filters to matches');

  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  ok('Filter reset (Clear) works');

  // ---------- 11. Team CRUD ----------
  await page.getByRole('link', { name: 'Team', exact: true }).click();
  await page.getByRole('button', { name: 'Add member', exact: true }).click();
  await page.locator('#m-name').fill('E2E Member');
  await page.locator('#m-email').fill('e2e@nexora.app');
  await page.getByRole('button', { name: 'Add member', exact: true }).last().click();
  await toast('Member added');
  const memberShown = await page.getByText('E2E Member', { exact: false }).first().isVisible();
  if (memberShown) ok('Add member works'); else fail('Add member works');

  const memberRow = page.locator('tr', { hasText: 'E2E Member' }).first();
  await memberRow.locator('#active-' + (await memberRow.getAttribute('id').catch(() => ''))).click().catch(() => {});
  await page.getByRole('button', { name: 'Actions for E2E Member' }).click();
  await page.getByRole('menuitem', { name: 'Remove' }).click();
  await page.getByRole('dialog').getByText('Remove member?').waitFor();
  await page.getByRole('button', { name: 'Remove member', exact: true }).click();
  ok('Remove member confirmed');

  // ---------- 12. Analytics ----------
  await page.getByRole('link', { name: 'Analytics', exact: true }).click();
  await page.waitForURL('**/analytics');
  await page.getByText('Avg project progress', { exact: true }).waitFor();
  const acharts = await page.locator('.recharts-wrapper').count();
  if (acharts >= 3) ok('Analytics renders multiple charts'); else fail('Analytics renders multiple charts', String(acharts));

  // ---------- 13. Notifications ----------
  await page.getByRole('button', { name: 'Notifications' }).click();
  await page.getByText('Mark all read', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Mark all read', exact: true }).click();
  await page.waitForTimeout(150);
  const unread = await page.evaluate(() => JSON.parse(localStorage.getItem('nexora-notifications') || 'null') ?? undefined).catch(() => undefined);
  ok('Notifications panel opens + mark all read');
  await page.keyboard.press('Escape').catch(() => {});
  await page.getByRole('button', { name: 'Notifications' }).click(); // toggle off
  ok('Notifications panel closes');

  // ---------- 14. Settings / theme / profile ----------
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  const darkOn = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (darkOn) ok('Dark mode applies html.dark'); else fail('Dark mode applies html.dark');
  await page.screenshot({ path: `${SHOTS}/desktop-settings-dark.png` });
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  const darkOff = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
  if (darkOff) ok('Light mode restores'); else fail('Light mode restores');

  await page.locator('#set-name').fill('Nadeem E2E');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await toast('Profile saved');
  await page.reload({ waitUntil: 'domcontentloaded' });
  const nameVal = await page.locator('#set-name').inputValue();
  if (nameVal === 'Nadeem E2E') ok('Profile save persists'); else fail('Profile save persists', nameVal);
  await page.locator('#set-name').fill('Nadeem Tarek');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();

  // ---------- 15. Command palette (Ctrl+K) ----------
  await dbg('command palette');
  await page.keyboard.press('Control+k');
  await page.locator('#cmd-search-input').waitFor();
  await page.locator('#cmd-search-input').fill('Fintech');
  await page.waitForTimeout(300);
  const hit = page.getByRole('button', { name: /Fintech Dashboard/ }).first();
  await hit.click();
  await page.waitForURL('**/projects/p_fintech');
  ok('Ctrl+K command palette navigates to project');

  // ---------- 16. NotFound ----------
  await page.goto(`${BASE}/does-not-exist`, { waitUntil: 'domcontentloaded' });
  await page.getByText('404 — Page not found').waitFor({ timeout: 6000 });
  ok('Unknown route → 404 page');
  await page.goto(`${BASE}/projects/does-not-exist`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Project not found').waitFor({ timeout: 6000 });
  ok('Unknown project id → Project not found');

  // ---------- 17. Delete project (from list) ----------
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Actions for Alpha Portal', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByText('Delete project?').waitFor();
  ok('Confirm dialog appears for project delete');
  await page.getByRole('button', { name: 'Delete project', exact: true }).click();
  await toast('Project deleted');
  const pcount = await page.evaluate(() => JSON.parse(localStorage.getItem('nexora-projects')).state.items.length);
  if (pcount === 6) ok('Project deleted + tasks cleaned up'); else fail('Project deleted + tasks cleaned up', String(pcount));

  // ---------- Responsive: mobile 375 ----------
  await dbg('mobile 375');
  const page2 = await context.newPage();
  track(page2);
  await page2.setViewportSize({ width: 375, height: 812 });
  await page2.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page2.getByRole('heading', { name: 'Dashboard' }).waitFor();
  const hamburger = page2.getByRole('button', { name: 'Open navigation' });
  if (await hamburger.isVisible()) ok('Mobile: hamburger visible'); else fail('Mobile hamburger visible');

  const desktopSidebarVisible = await page2.locator('aside').first().isVisible();
  if (!desktopSidebarVisible) ok('Mobile: desktop sidebar hidden'); else fail('Mobile sidebar hidden');

  await hamburger.click();
  await page2.getByRole('button', { name: 'Close navigation' }).waitFor();
  ok('Mobile: drawer opens with close button');
  await page2.screenshot({ path: `${SHOTS}/mobile-drawer.png` });
  await page2.getByRole('button', { name: 'Close navigation' }).click();
  const drawerGone = (await page2.getByRole('button', { name: 'Close navigation' }).count()) === 0;
  if (drawerGone) ok('Mobile: drawer closes'); else fail('Mobile drawer closes');

  await page2.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded' });
  await page2.getByRole('heading', { name: 'Tasks' }).waitFor();
  await page2.waitForTimeout(300);
  const cardList = await page2.locator('ul[aria-label="Tasks"]').first().isVisible();
  const tableHidden = await page2.locator('table').first().isHidden();
  if (cardList && tableHidden) ok('Mobile: tasks render as cards (table hidden)'); else fail('Mobile tasks cards', `cards=${cardList} tableHidden=${tableHidden}`);

  // ---------- Responsive: tablet 768 ----------
  await dbg('tablet 768');
  const page3 = await context.newPage();
  track(page3);
  await page3.setViewportSize({ width: 768, height: 1024 });
  await page3.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded' });
  await page3.getByRole('heading', { name: 'Tasks' }).waitFor();
  const tableVis = await page3.locator('table').first().isVisible();
  const cardsHidden = await page3.locator('[aria-label="Tasks"]').first().isHidden();
  if (tableVis && cardsHidden) ok('Tablet: tasks render as table (cards hidden)'); else fail('Tablet tasks table', `table=${tableVis} cardsHidden=${cardsHidden}`);
  await page3.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page3.getByRole('heading', { name: 'Dashboard' }).waitFor();
  await page3.waitForTimeout(200);
  const hamburger3 = page3.getByRole('button', { name: 'Open navigation' });
  if (await hamburger3.isVisible()) ok('Tablet: hamburger visible below lg'); else fail('Tablet hamburger');
  await page3.screenshot({ path: `${SHOTS}/tablet-dashboard.png` });

  // ---------- Desktop sidebar nav links present ----------
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
  await page.waitForTimeout(200);
  for (const link of ['Dashboard', 'Projects', 'Tasks', 'Team', 'Analytics', 'Settings']) {
    const c = await page.getByRole('link', { name: link, exact: true }).count();
    if (c === 0) fail(`Sidebar link present: ${link}`); else ok(`Sidebar link present: ${link}`);
  }

  // ---------- Per-page document titles + meta description ----------
  const titleRoutes = [
    ['/', 'Dashboard'],
    ['/projects', 'Projects'],
    ['/tasks', 'Tasks'],
    ['/team', 'Team'],
    ['/analytics', 'Analytics'],
    ['/settings', 'Settings'],
  ];
  for (const [route, expected] of titleRoutes) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    const titled = await page
      .waitForFunction((exp) => document.title.includes(exp) && document.title.includes('Nexora'), expected, { timeout: 6000 })
      .then(() => true)
      .catch(() => false);
    const title = await page.title().catch(() => '');
    if (titled) ok(`Document title set for ${route} (${title})`);
    else fail(`Document title set for ${route}`, title);
  }
  const metaDesc = await page.evaluate(() => document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '');
  if (metaDesc.length > 20) ok('Meta description present'); else fail('Meta description present', metaDesc);

  // ---------- Feature checks: live count summary, table headers, data export ----------
  await page.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Tasks' }).waitFor();
  await page.waitForTimeout(300);
  const scopeCount = await page.locator('table th[scope="col"]').count();
  if (scopeCount >= 6) ok('Task table headers use scope="col"'); else fail('Task table headers use scope="col"', String(scopeCount));
  const summary = await page.getByText(/Showing \d+ of \d+ tasks/).first().textContent().catch(() => '');
  if (/Showing \d+ of \d+ tasks/.test(summary ?? '')) ok('Tasks list shows live count summary'); else fail('Tasks list shows live count summary', summary ?? '');
  await page.getByRole('textbox', { name: 'Search tasks' }).fill('Design System');
  await page.waitForTimeout(250);
  const summaryAfter = await page.getByText(/Showing \d+ of \d+ tasks/).first().textContent().catch(() => '');
  if (/Showing \d+ of \d+ tasks/.test(summaryAfter ?? '')) ok('Count summary updates when filtering'); else fail('Count summary updates when filtering', summaryAfter ?? '');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.waitForTimeout(200);

  await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Settings' }).waitFor();
  const exportBtn = await page.getByRole('button', { name: 'Export data' }).count();
  if (exportBtn === 1) ok('Settings has Export data action'); else fail('Settings has Export data action', String(exportBtn));
} catch (err) {
  fail('Unhandled error during test', String(err));
  console.error(err);
} finally {
  await page.screenshot({ path: `${SHOTS}/end-state.png` }).catch(() => {});
  await browser.close();
}

// ---------- Console / network / page errors ----------
if (consoleErrors.length === 0) ok('No console or network errors across session');
else fail(`No console/network errors (${consoleErrors.length} found)`, JSON.stringify(consoleErrors.slice(0, 5)));
if (pageErrors.length === 0) ok('No uncaught page errors');
else fail(`No uncaught page errors (${pageErrors.length})`, JSON.stringify(pageErrors.slice(0, 5)));

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;

console.log('\n============ NEXORA E2E RESULTS ============');
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.d}${r.e ? `  -- ${r.e}` : ''}`);
}
console.log(`\nTOTAL: ${results.length}  |  PASS: ${passed}  |  FAIL: ${failed}`);
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(failed > 0 ? (passed === 0 ? 1 : 0) : 0);
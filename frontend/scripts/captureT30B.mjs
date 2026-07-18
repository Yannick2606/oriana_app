import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const output = `${root}captures`;
const baseUrl = 'http://127.0.0.1:4173';
const user = { id: 3577, prenom: 'Denis', nom: 'Palais', roles: ['consultant'], role_actif: 'consultant' };
const offers = [{ id: 697623, numero: 'OFF-697623', nom: 'Bureaux et entrepôts — Goussainville', lot_id: 501, nature: 'vente_et_location', occupation: 'libre' }];
const conditions = [
  { id: 1, offre_id: 697623, type: 'vente', prix_vente: 7000000, disponibilite: 'Immédiate' },
  { id: 2, offre_id: 697623, type: 'location', loyer_ht_m2_an: 145, disponibilite: 'Immédiate' },
];
const lots = [{ id: 501, nom: 'Lot principal — 5 368 m²' }];
const societes = [{ id: 1, raison_sociale: "CAKE O'CLOCK", type_relation: 'preneur' }];
const contacts = [{ id: 2, societe_id: 1, prenom: 'Johana', nom: 'Rajah', fonction: 'Contact principal', tel: '06 00 00 00 00', email: 'contact@exemple.fr' }];
const demandes = [{ id: 3, societe_id: 1, contact_id: 2, nature_transaction: 'les_deux', surface_min: 200, surface_max: 300, budget_min: 350000, budget_max: 500000, secteur_geo: 'Groslay', criteres_specifiques: 'Locaux d’activité avec une petite surface de bureaux.' }];

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(baseUrl)).ok) return; } catch { /* attente du serveur */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Le serveur de prévisualisation ne répond pas.');
}

async function mockApi(page) {
  await page.route('**/*', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const payload = path === '/auth/me' ? { user }
      : path === '/offres' ? { data: offers }
      : path === '/conditions-financieres' ? { data: conditions }
      : path === '/lots' ? { data: lots }
      : path === '/societes' ? { data: societes }
      : path === '/contacts' ? { data: contacts }
      : path === '/demandes' ? { data: demandes }
      : path === '/matching' ? { data: [{ id: 10, demande_id: 3, lot_id: 501, score_global: 92 }] }
      : null;
    if (payload) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    return route.continue();
  });
}

async function openModule(page, module) {
  await mockApi(page);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  if ((await page.viewportSize()).width < 768) await page.getByRole('button', { name: 'Ouvrir la navigation' }).click();
  await page.getByRole('button', { name: module }).click();
  const mobileOverlay = page.getByRole('button', { name: 'Fermer la navigation' });
  await page.waitForTimeout(150);
  if (await mobileOverlay.isVisible()) await mobileOverlay.dispatchEvent('click');
  await page.waitForTimeout(500);
}

await mkdir(output, { recursive: true });
const server = spawn('npm', ['exec', 'vite', '--', 'preview', '--host', '127.0.0.1', '--port', '4173'], { cwd: root, stdio: 'inherit' });
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  await openModule(desktop, 'Offres');
  await desktop.getByRole('heading', { name: 'Bureaux et entrepôts — Goussainville' }).waitFor();
  await desktop.screenshot({ path: `${output}/t30b-offre-desktop.png`, fullPage: true });
  await desktop.getByRole('button', { name: 'CRM' }).click();
  await desktop.getByRole('heading', { name: "CAKE O'CLOCK" }).waitFor();
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: `${output}/t30b-crm-desktop.png`, fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
  await openModule(mobile, 'Offres');
  await mobile.getByRole('heading', { name: 'Bureaux et entrepôts — Goussainville' }).waitFor();
  await mobile.screenshot({ path: `${output}/t30b-offre-mobile.png`, fullPage: true });
  await mobile.getByRole('button', { name: 'Ouvrir la navigation' }).click();
  await mobile.getByRole('button', { name: 'CRM' }).click();
  await mobile.getByRole('heading', { name: "CAKE O'CLOCK" }).waitFor();
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: `${output}/t30b-crm-mobile.png`, fullPage: true });
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}

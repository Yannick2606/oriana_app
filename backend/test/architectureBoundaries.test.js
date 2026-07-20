import assert from 'node:assert/strict';
import test from 'node:test';

import { inspectSource } from '../scripts/checkArchitecture.js';

const repoRoot = process.cwd();

test('refuse un connecteur fournisseur dans un service métier', () => {
  const violations = inspectSource({
    repoRoot,
    file: 'backend/src/services/offresService.js',
    source: "import { gristClient } from './gristClient.js';",
  });

  assert.deepEqual(violations.map(({ rule }) => rule), ['backend-provider-composition-only']);
});

test('refuse une dépendance inverse d’un service vers un middleware', () => {
  const violations = inspectSource({
    repoRoot,
    file: 'backend/src/services/offresService.js',
    source: "import { scopeByRole } from '../middlewares/scopeByRole.js';",
  });

  assert.deepEqual(violations.map(({ rule }) => rule), ['backend-service-no-middleware']);
});

test('réserve le réseau frontend à la couche API', () => {
  const violations = inspectSource({
    repoRoot,
    file: 'frontend/src/offres/OffresPage.jsx',
    source: "export async function load() { return fetch('/offres'); }",
  });

  assert.deepEqual(violations.map(({ rule }) => rule), ['frontend-network-via-api']);
});

test('autorise la composition des fournisseurs et le client API frontend', () => {
  const serverViolations = inspectSource({
    repoRoot,
    file: 'backend/src/server.js',
    source: "import { createN8nConnector } from './services/n8nConnector.js';",
  });
  const apiViolations = inspectSource({
    repoRoot,
    file: 'frontend/src/api/client.js',
    source: "export async function request() { return fetch('/api'); }",
  });

  assert.deepEqual([...serverViolations, ...apiViolations], []);
});

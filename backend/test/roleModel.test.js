import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeRoleNames } from '../src/services/roleModel.js';

test('normalise les anciens rôles vers le modèle hiérarchique sans doublon', () => {
  assert.deepEqual(normalizeRoleNames(['L', 'manager', 'master_consultant', 'admin']), ['master_consultant', 'admin_agence']);
});

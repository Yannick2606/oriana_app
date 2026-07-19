import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activeRoleName,
  canAdministerUsers,
  canManageAgencyData,
  normalizeRoleNames,
} from '../src/services/roleModel.js';

test('normalise les anciens rôles vers le modèle hiérarchique sans doublon', () => {
  assert.deepEqual(normalizeRoleNames(['L', 'manager', 'master_consultant', 'admin']), ['master_consultant', 'admin_agence']);
  assert.equal(activeRoleName('manager'), 'master_consultant');
});

test('centralise les politiques d’agence et d’administration pour les cinq rôles', () => {
  const expected = [
    { role: 'consultant', agency: false, administration: false },
    { role: 'master_consultant', agency: false, administration: false },
    { role: 'directeur_agence', agency: true, administration: true },
    { role: 'admin_agence', agency: true, administration: true },
    { role: 'super_admin', agency: false, administration: true },
  ];

  for (const { role, agency, administration } of expected) {
    assert.equal(canManageAgencyData(role), agency, `gestion agence ${role}`);
    assert.equal(canAdministerUsers(role), administration, `administration ${role}`);
  }

  assert.equal(canManageAgencyData('manager'), false);
  assert.equal(canAdministerUsers('admin'), true);
});

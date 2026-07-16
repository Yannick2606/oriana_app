import assert from 'node:assert/strict';
import test from 'node:test';

import { dateValue, listValue, normalizedRoles, utcValue } from '../src/services/gristImportMappings.js';
import { validateSnapshot } from '../src/services/gristPostgresImport.js';

test('convertit ChoiceList, anciens rôles et dates historiques explicitement', () => {
  assert.deepEqual(listValue(['L', 2, 3]), [2, 3]);
  assert.deepEqual(normalizedRoles({ role: ['L', 'manager', 'admin'] }), ['master_consultant', 'admin_agence']);
  assert.equal(utcValue(1_700_000_000), '2023-11-14T22:13:20.000Z');
  assert.equal(dateValue(1_700_000_000), '2023-11-14');
});

test('le contrôle à blanc ne révèle que table, identifiant et code de rejet', () => {
  const snapshot = Object.fromEntries([
    'Agences', 'Adresses', 'Utilisateurs', 'Ref_Roles', 'Ref_Familles', 'Societes', 'Contacts',
    'Sites', 'Batiments', 'Cellules', 'Lots', 'Ref_Categories_Carac', 'Ref_Caracteristiques',
    'Caracteristiques_Bien', 'Offres', 'Conditions_Financieres', 'Mandats', 'Demandes',
    'Matching_demandes_lots', 'Traitements_Agents',
  ].map((table) => [table, []]));
  snapshot.Lots.push({ id: 11, fields: { nom_lot: 'contenu-confidentiel', batiment_id: 99 } });
  const result = validateSnapshot(snapshot);
  assert.deepEqual(result.rejections, [{ source_table: 'Lots', legacy_grist_id: 11, code: 'REFERENCE_ABSENTE_Batiments' }]);
  assert.equal(JSON.stringify(result).includes('contenu-confidentiel'), false);
});

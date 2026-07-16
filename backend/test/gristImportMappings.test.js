import assert from 'node:assert/strict';
import test from 'node:test';

import { dateValue, importTables, listValue, normalizedHistoricalUsage, normalizedRoles, utcValue } from '../src/services/gristImportMappings.js';
import { validateSnapshot } from '../src/services/gristPostgresImport.js';

test('convertit ChoiceList, anciens rôles et dates historiques explicitement', () => {
  assert.deepEqual(listValue(['L', 2, 3]), [2, 3]);
  assert.deepEqual(normalizedRoles({ role: ['L', 'manager', 'admin'] }), ['master_consultant', 'admin_agence']);
  assert.equal(utcValue(1_700_000_000), '2023-11-14T22:13:20.000Z');
  assert.equal(dateValue(1_700_000_000), '2023-11-14');
  assert.equal(normalizedHistoricalUsage('entrepôt'), 'logistique');
  assert.equal(normalizedHistoricalUsage('Bureaux'), 'Bureaux');
});

test('le contrôle à blanc rattache explicitement entrepôt à la famille logistique', () => {
  const snapshot = Object.fromEntries(importTables.map((table) => [table, []]));
  snapshot.Ref_Familles.push({ id: 1, fields: { code: 'logistique', libelle: 'Logistique' } });
  snapshot.Lots.push({ id: 4, fields: { reference_lot: 'Lot 4', usage: 'entrepôt' } });
  assert.deepEqual(validateSnapshot(snapshot).rejections, []);
});

test('le contrôle à blanc ne révèle que table, identifiant et code de rejet', () => {
  const snapshot = Object.fromEntries(importTables.map((table) => [table, []]));
  snapshot.Lots.push({ id: 11, fields: { nom_lot: 'contenu-confidentiel', batiment_id: 99 } });
  const result = validateSnapshot(snapshot);
  assert.deepEqual(result.rejections, [{ source_table: 'Lots', legacy_grist_id: 11, code: 'REFERENCE_ABSENTE_Batiments' }]);
  assert.equal(JSON.stringify(result).includes('contenu-confidentiel'), false);
});

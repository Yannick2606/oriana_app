import assert from 'node:assert/strict';
import test from 'node:test';

import { createPostgresPool } from '../src/services/postgres.js';
import { createPostgresClient } from '../src/services/postgresClient.js';
import { importSnapshot } from '../src/services/gristPostgresImport.js';
import { importTables } from '../src/services/gristImportMappings.js';

const enabled = Boolean(process.env.POSTGRES_INTEGRATION_TESTS);

test('PostgreSQL conserve le contrat, les relations et l’idempotence de l’import', { skip: !enabled }, async () => {
  const pool = createPostgresPool();
  const snapshot = Object.fromEntries(importTables.map((table) => [table, []]));
  snapshot.Agences = [
    { id: 1, fields: { nom: 'Agence test', actif: true } },
    { id: 2, fields: { nom: 'Autre agence', actif: true } },
  ];
  snapshot.Ref_Familles = [{ id: 50, fields: { code: 'logistique', libelle: 'Logistique' } }];
  snapshot.Utilisateurs = [
    { id: 10, fields: { nom: 'Test', prenom: 'User', email: 'integration@example.invalid', mot_de_passe_hash: 'test-non-secret', agence_id: 1, role: ['L', 'consultant'], actif: true } },
    { id: 11, fields: { nom: 'Collègue', prenom: 'User', email: 'collegue@example.invalid', mot_de_passe_hash: 'test-non-secret', agence_id: 1, role: ['L', 'consultant'], actif: true } },
  ];
  snapshot.Sites = [{ id: 20, fields: { nom_site: 'Site test', agence_id: 1, consultant_responsable_id: 10, parcelles: ['L', 'A1'] } }];
  snapshot.Batiments = [{ id: 30, fields: { nom_batiment: 'Bâtiment test', site_id: 20, consultant_responsable_id: 10 } }];
  snapshot.Lots = [{ id: 40, fields: { reference_lot: 'Lot historique', batiment_id: 30, agence_id: 1, consultant_responsable_id: 10, usage: 'entrepôt', prix_vente: 500000, date_disponibilite: 1_700_000_000 } }];
  try {
    const first = await importSnapshot(pool, snapshot); const second = await importSnapshot(pool, snapshot);
    assert.equal(first.imported, true); assert.equal(second.imported, true);
    const client = createPostgresClient(pool);
    const agency = await pool.query('SELECT id FROM agences WHERE legacy_grist_id = 1');
    const user = await pool.query('SELECT id FROM utilisateurs WHERE legacy_grist_id = 10');
    const lots = await client.list('Lots', { agence_id: [agency.rows[0].id] });
    assert.equal(lots.length, 1); assert.equal(lots[0].fields.nom, 'Lot historique');
    assert.equal(lots[0].fields.prix_vente, 500000);
    assert.equal(lots[0].fields.usage_historique, 'entrepôt');
    assert.equal(lots[0].fields.date_disponibilite, '2023-11-14');
    const count = await pool.query('SELECT count(*)::integer AS count FROM lots WHERE legacy_grist_id = 40');
    assert.equal(count.rows[0].count, 1);
    const relation = await pool.query('SELECT b.legacy_grist_id FROM lots l JOIN batiments b ON b.id = l.batiment_id WHERE l.legacy_grist_id = 40');
    assert.equal(Number(relation.rows[0].legacy_grist_id), 30);
    const buildingAgency = await pool.query('SELECT a.legacy_grist_id FROM batiments b JOIN agences a ON a.id = b.agence_id WHERE b.legacy_grist_id = 30');
    assert.equal(Number(buildingAgency.rows[0].legacy_grist_id), 1);
    const usage = await pool.query('SELECT f.code FROM lots l JOIN ref_familles f ON f.id = l.usage_id WHERE l.legacy_grist_id = 40');
    assert.equal(usage.rows[0].code, 'logistique');
    assert.equal((await client.list('Lots', { gestionnaire: [user.rows[0].id] })).length, 1);
    assert.equal((await client.list('Lots', { gestionnaire: [999_999] })).length, 0);
  } finally { await pool.end(); }
});

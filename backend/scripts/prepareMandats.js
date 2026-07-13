import { gristClient } from '../src/services/gristClient.js';

const entries = [
  ['numero', 'Text'], ['numero_registre', 'Text'], ['offre_id', 'Ref:Offres'],
  ['societe_mandante', 'Ref:Societes'], ['type', 'Choice'], ['nature', 'Choice'],
  ['avancement', 'Choice'], ['date_debut', 'Date'], ['date_fin', 'Date'],
  ['honoraires_mode', 'Choice'], ['honoraires_montant', 'Numeric'],
  ['honoraires_charge', 'Choice'], ['gestionnaire', 'Ref:Utilisateurs'], ['donnee_exclusive', 'Bool'],
  ['agence_id', 'Ref:Agences'],
];
const columns = entries.map(([id, type]) => ({ id, fields: { type } }));
const tables = await gristClient.listTables();
const ids = new Set(tables.map((table) => table.id));
const missing = ['Offres', 'Societes', 'Agences', 'Utilisateurs'].filter((table) => !ids.has(table));
if (missing.length > 0) throw new Error(`Tables Grist préalables manquantes : ${missing.join(', ')}`);
if (!ids.has('Mandats')) {
  await gristClient.createTables([{ id: 'Mandats', columns }]);
  console.log('Table Mandats créée.');
}
await gristClient.addOrUpdateColumns('Mandats', columns);
console.log('Schéma Mandats vérifié.');

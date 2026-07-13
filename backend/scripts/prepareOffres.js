import { gristClient } from '../src/services/gristClient.js';

function columns(entries) {
  return entries.map(([id, type]) => ({ id, fields: { type } }));
}

const schemas = {
  Offres: [
    ['numero', 'Text'],
    ['nom', 'Text'],
    ['lot_id', 'Ref:Lots'],
    ['nature', 'Choice'],
    ['type_contrat', 'Choice'],
    ['occupation', 'Choice'],
    ['stade_commercialisation', 'Choice'],
    ['gestionnaire', 'Ref:Utilisateurs'],
    ['co_gestionnaires', 'RefList:Utilisateurs'],
    ['agence_id', 'Ref:Agences'],
  ],
  Conditions_Financieres: [
    ['offre_id', 'Ref:Offres'],
    ['type', 'Choice'],
    ['prix_vente', 'Numeric'],
    ['loyer_ht_m2_an', 'Numeric'],
    ['loyer_global_an', 'Numeric'],
    ['charges_ht_m2_an', 'Numeric'],
    ['depot_garantie', 'Numeric'],
    ['taxe_fonciere', 'Numeric'],
    ['teom', 'Numeric'],
    ['cfe', 'Numeric'],
    ['taux_net_initial', 'Numeric'],
    ['taux_net_potentiel', 'Numeric'],
    ['disponibilite', 'Date'],
  ],
};

const tables = await gristClient.listTables();
const tableIds = new Set(tables.map((table) => table.id));
const dependencies = ['Agences', 'Utilisateurs', 'Lots'];
const missing = dependencies.filter((table) => !tableIds.has(table));
if (missing.length > 0) {
  throw new Error(`Tables Grist préalables manquantes : ${missing.join(', ')}`);
}

for (const [table, entries] of Object.entries(schemas)) {
  if (!tableIds.has(table)) {
    await gristClient.createTables([{ id: table, columns: columns(entries) }]);
    console.log(`Table ${table} créée.`);
  }
  await gristClient.addOrUpdateColumns(table, columns(entries));
  console.log(`Schéma ${table} vérifié.`);
}

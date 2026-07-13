import { gristClient } from '../src/services/gristClient.js';

const columnsByTable = {
  Sites: [
    ['nom', 'Text'],
    ['adresse_id', 'Ref:Adresses'],
    ['surface_terrain', 'Numeric'],
    ['section_cadastrale', 'Text'],
    ['parcelles', 'ChoiceList'],
    ['divisible', 'Bool'],
    ['reserve_fonciere', 'Bool'],
    ['servitudes', 'Text'],
    ['en_bloc', 'Bool'],
    ['gestionnaire', 'Ref:Utilisateurs'],
    ['agence_id', 'Ref:Agences'],
  ],
  Batiments: [
    ['site_id', 'Ref:Sites'],
    ['nom', 'Text'],
    ['numero', 'Text'],
    ['annee_construction', 'Int'],
    ['surface_totale', 'Numeric'],
    ['etat', 'Choice'],
    ['divisible', 'Bool'],
    ['copropriete', 'Bool'],
    ['erp', 'Bool'],
    ['igh', 'Bool'],
    ['erp_categorie', 'Text'],
    ['erp_type', 'Text'],
    ['destination_plu', 'Text'],
    ['decret_tertiaire', 'Bool'],
    ['photos', 'Attachments'],
    ['gestionnaire', 'Ref:Utilisateurs'],
    ['agence_id', 'Ref:Agences'],
  ],
  Cellules: [
    ['batiment_id', 'Ref:Batiments'],
    ['nom', 'Text'],
    ['numero', 'Text'],
    ['surface', 'Numeric'],
    ['etage', 'Choice'],
    ['type_bien', 'Ref:Ref_Familles'],
    ['photos', 'Attachments'],
    ['gestionnaire', 'Ref:Utilisateurs'],
    ['agence_id', 'Ref:Agences'],
  ],
  Lots: [
    ['nom', 'Text'],
    ['numero', 'Text'],
    ['cellules', 'RefList:Cellules'],
    ['site_id', 'Ref:Sites'],
    ['surface', 'Numeric'],
    ['divisible', 'Bool'],
    ['nombre_parking', 'Int'],
    ['en_bloc', 'Bool'],
    ['gestionnaire', 'Ref:Utilisateurs'],
    ['agence_id', 'Ref:Agences'],
  ],
};

function columns(entries) {
  return entries.map(([id, type]) => ({ id, fields: { type } }));
}

const existingTables = await gristClient.listTables();
const tableIds = new Set(existingTables.map((table) => table.id));
const dependencies = ['Adresses', 'Agences', 'Utilisateurs', 'Ref_Familles'];
const missingDependencies = dependencies.filter((table) => !tableIds.has(table));

if (missingDependencies.length > 0) {
  throw new Error(`Tables Grist préalables manquantes : ${missingDependencies.join(', ')}`);
}

for (const table of ['Sites', 'Batiments', 'Lots']) {
  if (!tableIds.has(table)) {
    throw new Error(`Table Grist préalable manquante : ${table}`);
  }
}

if (!tableIds.has('Cellules')) {
  await gristClient.createTables([{ id: 'Cellules', columns: columns(columnsByTable.Cellules) }]);
  console.log('Table Cellules créée.');
}

for (const [table, entries] of Object.entries(columnsByTable)) {
  await gristClient.addOrUpdateColumns(table, columns(entries));
  console.log(`Schéma ${table} vérifié.`);
}

import { gristClient } from '../src/services/gristClient.js';

const schemas = {
  Societes: [
    ['raison_sociale', 'Text'], ['enseigne', 'Text'], ['siren', 'Text'], ['siret', 'Text'],
    ['code_ape', 'Text'], ['libelle_ape', 'Text'], ['forme_juridique', 'Text'], ['capital', 'Numeric'],
    ['effectif_salarie', 'Numeric'], ['adresse_siege', 'Ref:Adresses'], ['contact_principal', 'Ref:Contacts'],
    ['type_relation', 'Choice'], ['gestionnaire', 'Ref:Utilisateurs'], ['donnee_exclusive', 'Bool'], ['agence_id', 'Ref:Agences'],
  ],
  Contacts: [
    ['nom', 'Text'], ['prenom', 'Text'], ['fonction', 'Text'], ['email', 'Text'], ['tel', 'Text'],
    ['mobile', 'Text'], ['societe_id', 'Ref:Societes'], ['gestionnaire', 'Ref:Utilisateurs'],
    ['donnee_exclusive', 'Bool'], ['agence_id', 'Ref:Agences'],
  ],
  Demandes: [
    ['societe_id', 'Ref:Societes'], ['contact_id', 'Ref:Contacts'], ['nature_transaction', 'Choice'],
    ['familles', 'RefList:Ref_Familles'], ['surface_min', 'Numeric'], ['surface_max', 'Numeric'],
    ['budget_min', 'Numeric'], ['budget_max', 'Numeric'], ['secteur_geo', 'Text'],
    ['criteres_specifiques', 'Text'], ['gestionnaire', 'Ref:Utilisateurs'], ['donnee_exclusive', 'Bool'],
    ['agence_id', 'Ref:Agences'],
  ],
};

const tables = await gristClient.listTables();
const ids = new Set(tables.map((table) => table.id));
const dependencies = ['Adresses', 'Agences', 'Utilisateurs', 'Ref_Familles'];
const missing = dependencies.filter((table) => !ids.has(table));
if (missing.length) throw new Error(`Tables Grist préalables manquantes : ${missing.join(', ')}`);

for (const [table, entries] of Object.entries(schemas)) {
  const columns = entries.map(([id, type]) => ({ id, fields: { type } }));
  if (!ids.has(table)) {
    const initialColumns = columns.filter((column) => {
      const reference = column.fields.type.match(/^Ref(?:List)?:([^:]+)$/)?.[1];
      return !reference || ids.has(reference);
    });
    await gristClient.createTables([{ id: table, columns: initialColumns }]);
    ids.add(table);
  }
}
for (const [table, entries] of Object.entries(schemas)) {
  const columns = entries.map(([id, type]) => ({ id, fields: { type } }));
  await gristClient.addOrUpdateColumns(table, columns);
}

await gristClient.addOrUpdateColumns('Mandats', [{ id: 'donnee_exclusive', fields: { type: 'Bool' } }]);
console.log('Schéma CRM et exclusivité des mandats vérifiés.');

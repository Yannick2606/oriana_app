import { gristClient } from '../src/services/gristClient.js';

function columns(entries) {
  return entries.map(([id, type]) => ({ id, fields: { type } }));
}

const schemas = {
  Ref_Categories_Carac: [
    ['libelle', 'Text'],
    ['ordre', 'Int'],
  ],
  Ref_Caracteristiques: [
    ['libelle', 'Text'],
    ['categorie_id', 'Ref:Ref_Categories_Carac'],
    ['familles', 'RefList:Ref_Familles'],
    ['niveaux', 'ChoiceList'],
    ['type_valeur', 'Choice'],
    ['unite', 'Text'],
    ['ordre', 'Int'],
  ],
  Caracteristiques_Bien: [
    ['caracteristique_id', 'Ref:Ref_Caracteristiques'],
    ['niveau', 'Choice'],
    ['batiment_id', 'Ref:Batiments'],
    ['cellule_id', 'Ref:Cellules'],
    ['lot_id', 'Ref:Lots'],
    ['valeur_bool', 'Bool'],
    ['valeur_nombre', 'Numeric'],
    ['valeur_texte', 'Text'],
    ['agence_id', 'Ref:Agences'],
  ],
};

const categorySeeds = [
  ['BATIMENT', 10],
  ['ENTREPOT', 20],
  ['BUREAUX', 30],
  ['COMMERCE', 40],
];

const characteristicSeeds = [
  ['Accès poids lourds', 'BATIMENT', ['logistique', 'activite'], ['batiment'], 'bool', '', 10],
  ['Hauteur libre', 'ENTREPOT', ['logistique', 'activite'], ['cellule', 'lot'], 'nombre', 'm', 20],
  ['Portes à quai', 'ENTREPOT', ['logistique'], ['cellule', 'lot'], 'nombre', '', 30],
  ['Charge au sol', 'ENTREPOT', ['logistique', 'activite'], ['cellule'], 'nombre', 't/m²', 40],
  ['Climatisation', 'BUREAUX', ['bureaux', 'commerce'], ['cellule', 'lot'], 'bool', '', 50],
  ['Faux plancher', 'BUREAUX', ['bureaux'], ['cellule'], 'bool', '', 60],
  ['Nombre de bureaux', 'BUREAUX', ['bureaux'], ['cellule', 'lot'], 'nombre', '', 70],
  [
    'État général',
    'BATIMENT',
    ['logistique', 'activite', 'bureaux', 'commerce', 'terrain', 'locaux_sociaux'],
    ['batiment', 'cellule', 'lot'],
    'liste',
    '',
    80,
  ],
];

const tables = await gristClient.listTables();
const tableIds = new Set(tables.map((table) => table.id));
const dependencies = ['Agences', 'Ref_Familles', 'Batiments', 'Cellules', 'Lots'];
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
}

const categories = await gristClient.list('Ref_Categories_Carac');
const categoryByLabel = new Map(categories.map((record) => [record.fields.libelle, record]));
for (const [libelle, ordre] of categorySeeds) {
  if (!categoryByLabel.has(libelle)) {
    const record = await gristClient.create('Ref_Categories_Carac', { libelle, ordre });
    categoryByLabel.set(libelle, record);
  }
}

const families = await gristClient.list('Ref_Familles');
const familyByCode = new Map(families.map((record) => [record.fields.code, record.id]));
const characteristics = await gristClient.list('Ref_Caracteristiques');
const existingLabels = new Set(characteristics.map((record) => record.fields.libelle));

for (const [libelle, category, familyCodes, levels, type, unit, order] of characteristicSeeds) {
  if (existingLabels.has(libelle)) {
    continue;
  }
  const familyIds = familyCodes.map((code) => familyByCode.get(code));
  if (familyIds.some((id) => !id)) {
    throw new Error(`Famille de référence absente pour ${libelle}.`);
  }
  await gristClient.create('Ref_Caracteristiques', {
    libelle,
    categorie_id: categoryByLabel.get(category).id,
    familles: ['L', ...familyIds],
    niveaux: ['L', ...levels],
    type_valeur: type,
    unite: unit,
    ordre: order,
  });
}

console.log('Schéma et dictionnaire de qualification vérifiés.');

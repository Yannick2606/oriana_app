import { gristClient } from '../src/services/gristClient.js';
import { createQualificationService } from '../src/services/qualificationService.js';

const created = [];

async function create(table, fields) {
  const record = await gristClient.create(table, fields);
  created.push({ table, id: record.id });
  return record;
}

try {
  const [agences, utilisateurs, familles] = await Promise.all([
    gristClient.list('Agences'),
    gristClient.list('Utilisateurs', { actif: [true] }),
    gristClient.list('Ref_Familles', { code: ['logistique'] }),
  ]);
  const agence = agences[0];
  const utilisateur = utilisateurs[0];
  const famille = familles[0];
  if (!agence || !utilisateur || !famille) {
    throw new Error('Agence, utilisateur actif et famille logistique requis.');
  }

  const suffix = Date.now().toString(36);
  const ownership = { agence_id: agence.id, gestionnaire: utilisateur.id };
  const site = await create('Sites', { nom: `TEST-T06-${suffix}`, ...ownership });
  const batiment = await create('Batiments', {
    site_id: site.id,
    nom: `TEST-T06-${suffix}`,
    ...ownership,
  });
  const cellule = await create('Cellules', {
    batiment_id: batiment.id,
    nom: `TEST-T06-${suffix}`,
    type_bien: famille.id,
    ...ownership,
  });

  const service = createQualificationService(gristClient);
  const dictionary = await service.dictionary('logistique', 'cellule');
  const height = dictionary.find((record) => record.fields.libelle === 'Hauteur libre');
  if (!height) {
    throw new Error('Caractéristique Hauteur libre introuvable.');
  }

  const value = await service.createValue({
    caracteristique_id: height.id,
    niveau: 'cellule',
    cellule_id: cellule.id,
    valeur_nombre: 8.5,
  }, utilisateur.fields ? { ...utilisateur.fields, id: utilisateur.id, agence_id: agence.id } : {
    id: utilisateur.id,
    agence_id: agence.id,
  }, ownership);
  created.push({ table: 'Caracteristiques_Bien', id: value.id });

  const values = await service.listValues('cellule', cellule.id, ownership);
  if (!values.some((record) => record.id === value.id && record.fields.valeur_nombre === 8.5)) {
    throw new Error('Valeur de qualification non relue.');
  }
  console.log('Qualification EAV réelle validée.');
} finally {
  for (const record of created.reverse()) {
    await gristClient.delete(record.table, record.id);
  }
}

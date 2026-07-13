import { gristClient } from '../src/services/gristClient.js';

const created = [];

async function create(table, fields) {
  const record = await gristClient.create(table, fields);
  created.push({ table, id: record.id });
  return record;
}

try {
  const [agences, utilisateurs] = await Promise.all([
    gristClient.list('Agences'),
    gristClient.list('Utilisateurs', { actif: [true] }),
  ]);
  const agence = agences[0];
  const utilisateur = utilisateurs[0];

  if (!agence || !utilisateur) {
    throw new Error('Une agence et un utilisateur actif sont requis pour le contrôle.');
  }

  const suffix = Date.now().toString(36);
  const ownership = { agence_id: agence.id, gestionnaire: utilisateur.id };
  const site = await create('Sites', { nom: `TEST-T05-${suffix}`, ...ownership });
  const batiment = await create('Batiments', {
    site_id: site.id,
    nom: `TEST-T05-${suffix}`,
    ...ownership,
  });
  const cellule = await create('Cellules', {
    batiment_id: batiment.id,
    nom: `TEST-T05-${suffix}`,
    surface: 100,
    ...ownership,
  });
  const lot = await create('Lots', {
    nom: `TEST-T05-${suffix}`,
    cellules: ['L', cellule.id],
    surface: 100,
    ...ownership,
  });

  await Promise.all([
    gristClient.getById('Sites', site.id),
    gristClient.getById('Batiments', batiment.id),
    gristClient.getById('Cellules', cellule.id),
    gristClient.getById('Lots', lot.id),
  ]);
  console.log('Hiérarchie Grist Site → Bâtiment → Cellule → Lot validée.');
} finally {
  for (const record of created.reverse()) {
    await gristClient.delete(record.table, record.id);
  }
}

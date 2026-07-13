import { gristClient } from '../src/services/gristClient.js';
import { createMandatsService } from '../src/services/mandatsService.js';

const created = [];
async function create(table, fields) {
  const record = await gristClient.create(table, fields);
  created.push({ table, id: record.id }); return record;
}

try {
  const [agences, utilisateurs] = await Promise.all([
    gristClient.list('Agences'), gristClient.list('Utilisateurs', { actif: [true] }),
  ]);
  const agence = agences[0]; const utilisateur = utilisateurs[0];
  if (!agence || !utilisateur) throw new Error('Agence et utilisateur actif requis.');
  const suffix = Date.now().toString(36);
  const ownership = { agence_id: agence.id, gestionnaire: utilisateur.id };
  const site = await create('Sites', { nom: `TEST-T08-${suffix}`, ...ownership });
  const batiment = await create('Batiments', { site_id: site.id, nom: `TEST-T08-${suffix}`, ...ownership });
  const cellule = await create('Cellules', { batiment_id: batiment.id, nom: `TEST-T08-${suffix}`, ...ownership });
  const lot = await create('Lots', { nom: `TEST-T08-${suffix}`, cellules: ['L', cellule.id], ...ownership });
  const offre = await create('Offres', {
    numero: `TEST-T08-${suffix}`, lot_id: lot.id, nature: 'vente_et_location', ...ownership,
  });
  const societe = await create('Societes', { raison_sociale: `TEST-T08-${suffix}`, agence_id: agence.id });

  const service = createMandatsService(gristClient);
  const mandat = await service.create({
    numero: `TEST-T08-${suffix}`, numero_registre: `REG-${suffix}`, offre_id: offre.id,
    societe_mandante: societe.id, type: 'exclusif', nature: 'vente',
    date_debut: '2026-07-13', date_fin: '2027-07-12', honoraires_mode: 'pourcentage',
    honoraires_montant: 2_500_000, honoraires_charge: 'mandant',
  }, { id: utilisateur.id, agence_id: agence.id }, ownership);
  created.push({ table: 'Mandats', id: mandat.id });
  await service.update(mandat.id, { honoraires_montant: 2_200_000 }, ownership);
  const reread = await service.get(mandat.id, ownership);
  if (reread.fields.honoraires_montant !== 2_200_000) throw new Error('Honoraires non relus.');
  console.log('Mandat réel créé, modifié et relu.');
} finally {
  for (const record of created.reverse()) await gristClient.delete(record.table, record.id);
}

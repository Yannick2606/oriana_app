import { gristClient } from '../src/services/gristClient.js';
import { createOffresService } from '../src/services/offresService.js';

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
    throw new Error('Une agence et un utilisateur actif sont requis.');
  }

  const suffix = Date.now().toString(36);
  const ownership = { agence_id: agence.id, gestionnaire: utilisateur.id };
  const site = await create('Sites', { nom: `TEST-T07-${suffix}`, ...ownership });
  const batiment = await create('Batiments', {
    site_id: site.id, nom: `TEST-T07-${suffix}`, ...ownership,
  });
  const cellule = await create('Cellules', {
    batiment_id: batiment.id, nom: `TEST-T07-${suffix}`, ...ownership,
  });
  const lot = await create('Lots', {
    nom: `TEST-T07-${suffix}`, cellules: ['L', cellule.id], ...ownership,
  });

  const service = createOffresService(gristClient);
  const user = { id: utilisateur.id, agence_id: agence.id };
  const offer = await service.createOffer({
    numero: `TEST-T07-${suffix}`,
    nom: 'Offre double temporaire',
    lot_id: lot.id,
    nature: 'vente_et_location',
  }, user, ownership);
  created.push({ table: 'Offres', id: offer.id });

  const sale = await service.createCondition({
    offre_id: offer.id, type: 'vente', prix_vente: 1_250_000,
  }, ownership);
  created.push({ table: 'Conditions_Financieres', id: sale.id });
  const rental = await service.createCondition({
    offre_id: offer.id, type: 'location', loyer_ht_m2_an: 125,
  }, ownership);
  created.push({ table: 'Conditions_Financieres', id: rental.id });

  await service.updateCondition(sale.id, { prix_vente: 1_180_000 }, ownership);
  const conditions = await service.listConditions(ownership);
  const types = conditions.filter((record) => record.fields.offre_id === offer.id)
    .map((record) => record.fields.type).sort();
  if (types.join(',') !== 'location,vente') {
    throw new Error('Deux conditions distinctes attendues.');
  }
  const negotiated = await gristClient.getById('Conditions_Financieres', sale.id);
  if (negotiated?.fields.prix_vente !== 1_180_000) {
    throw new Error('Montant négocié non relu.');
  }
  console.log('Offre double nature et négociation réelles validées.');
} finally {
  for (const record of created.reverse()) {
    await gristClient.delete(record.table, record.id);
  }
}

const agencyId = 1;

const users = [
  { id: 1001, nom: 'Rivière', prenom: 'Camille', email: 'camille.riviere@example.invalid', role: ['L', 'super_admin'] },
  { id: 1002, nom: 'Mercier', prenom: 'Samir', email: 'samir.mercier@example.invalid', role: ['L', 'admin'] },
  { id: 1003, nom: 'Legrand', prenom: 'Inès', email: 'ines.legrand@example.invalid', role: ['L', 'directeur_agence'] },
  { id: 1004, nom: 'Fontaine', prenom: 'Noé', email: 'noe.fontaine@example.invalid', role: ['L', 'master_consultant'] },
  { id: 1005, nom: 'Diallo', prenom: 'Aïcha', email: 'aicha.diallo@example.invalid', role: ['L', 'consultant'] },
];

const offerSpecs = [
  {
    numero: 'OFF-95-GON-001',
    nom: 'Gonesse — activité & bureaux indépendants',
    commune: 'Gonesse', codePostal: '95500', departement: 'Val-d’Oise',
    photo: '/demo/offres/gonesse-activite-bureaux.webp',
    photoAlt: 'Bâtiment fictif d’activité et bureaux à Gonesse',
    typeBien: 'activite', surfaceTerrain: 4200, surface: 1850, parking: 34,
    annee: 2018, etat: 'bon_etat', cellules: [1450, 400],
    nature: 'vente_et_location', typeContrat: 'vente_ou_bail_commercial', occupation: 'libre',
    stade: 'commercialisation', disponibilite: '2026-10-01',
    vente: { prix_vente: 3550000, taxe_fonciere: 38200, taux_net_potentiel: 6.2 },
    location: { loyer_ht_m2_an: 145, loyer_global_an: 268250, charges_ht_m2_an: 16, depot_garantie: 67063 },
  },
  {
    numero: 'OFF-95-SOA-002',
    nom: 'Saint-Ouen-l’Aumône — cellule divisible',
    commune: 'Saint-Ouen-l’Aumône', codePostal: '95310', departement: 'Val-d’Oise',
    photo: '/demo/offres/saint-ouen-aumone-parc-activites.webp',
    photoAlt: 'Parc d’activités fictif à Saint-Ouen-l’Aumône',
    typeBien: 'activite', surfaceTerrain: 6100, surface: 920, parking: 18,
    annee: 2021, etat: 'tres_bon_etat', cellules: [620, 300], divisible: true,
    nature: 'location', typeContrat: 'bail_commercial', occupation: 'libre',
    stade: 'commercialisation', disponibilite: '2026-09-15',
    location: { loyer_ht_m2_an: 118, loyer_global_an: 108560, charges_ht_m2_an: 14, depot_garantie: 27140 },
  },
  {
    numero: 'OFF-95-ARG-003',
    nom: 'Argenteuil — immeuble de bureaux',
    commune: 'Argenteuil', codePostal: '95100', departement: 'Val-d’Oise',
    photo: '/demo/offres/argenteuil-bureaux.webp',
    photoAlt: 'Immeuble de bureaux fictif à Argenteuil',
    typeBien: 'bureaux', surfaceTerrain: 2200, surface: 1260, parking: 22,
    annee: 2012, etat: 'renove', cellules: [315, 315, 315, 315],
    nature: 'vente', typeContrat: 'vente_murs', occupation: 'occupe',
    stade: 'commercialisation', disponibilite: '2027-01-01',
    vente: { prix_vente: 4850000, taxe_fonciere: 44600, taux_net_initial: 5.4, taux_net_potentiel: 6.1 },
  },
  {
    numero: 'OFF-77-MIT-004',
    nom: 'Mitry-Mory — entrepôt logistique',
    commune: 'Mitry-Mory', codePostal: '77290', departement: 'Seine-et-Marne',
    photo: '/demo/offres/mitry-mory-logistique.webp',
    photoAlt: 'Entrepôt logistique fictif à Mitry-Mory',
    typeBien: 'logistique', surfaceTerrain: 11200, surface: 4800, parking: 30,
    annee: 2019, etat: 'bon_etat', cellules: [4320, 480],
    nature: 'location', typeContrat: 'bail_commercial', occupation: 'libre',
    stade: 'commercialisation', disponibilite: '2026-11-01',
    location: { loyer_ht_m2_an: 102, loyer_global_an: 489600, charges_ht_m2_an: 12, depot_garantie: 122400 },
  },
  {
    numero: 'OFF-77-CLA-005',
    nom: 'Claye-Souilly — commerce & activité',
    commune: 'Claye-Souilly', codePostal: '77410', departement: 'Seine-et-Marne',
    photo: '/demo/offres/claye-souilly-commerce-activite.webp',
    photoAlt: 'Local commercial et d’activité fictif à Claye-Souilly',
    typeBien: 'commerce', surfaceTerrain: 2700, surface: 760, parking: 26,
    annee: 2023, etat: 'neuf', cellules: [520, 240],
    nature: 'vente_et_location', typeContrat: 'vente_ou_bail_commercial', occupation: 'libre',
    stade: 'pre_lancement', disponibilite: '2026-12-01',
    vente: { prix_vente: 2150000, taxe_fonciere: 21600, taux_net_potentiel: 6.4 },
    location: { loyer_ht_m2_an: 165, loyer_global_an: 125400, charges_ht_m2_an: 18, depot_garantie: 31350 },
  },
];

const crmData = {
  societes: [
    { id: 1100, raison_sociale: 'Atelier Noroît — démonstration', enseigne: 'Noroît', type_relation: 'prospect' },
    { id: 1101, raison_sociale: 'Fluxia Logistique — démonstration', enseigne: 'Fluxia', type_relation: 'preneur' },
    { id: 1102, raison_sociale: 'Maison Sillage — démonstration', enseigne: 'Sillage', type_relation: 'prospect' },
    { id: 1103, raison_sociale: 'Kanso Services — démonstration', enseigne: 'Kanso', type_relation: 'partenaire' },
  ],
  contacts: [
    { id: 1200, societe_id: 1100, prenom: 'Maëlle', nom: 'Roux', fonction: 'Direction', email: 'maelle.roux@example.invalid' },
    { id: 1201, societe_id: 1100, prenom: 'Nabil', nom: 'Caron', fonction: 'Responsable immobilier', email: 'nabil.caron@example.invalid' },
    { id: 1202, societe_id: 1101, prenom: 'Élise', nom: 'Meyer', fonction: 'Direction logistique', email: 'elise.meyer@example.invalid' },
    { id: 1203, societe_id: 1102, prenom: 'Tom', nom: 'Diallo', fonction: 'Développement', email: 'tom.diallo@example.invalid' },
    { id: 1204, societe_id: 1103, prenom: 'Lina', nom: 'Marchal', fonction: 'Conseil immobilier', email: 'lina.marchal@example.invalid' },
    { id: 1205, societe_id: 1103, prenom: 'Sacha', nom: 'Petit', fonction: 'Chargé de projet', email: 'sacha.petit@example.invalid' },
  ],
  demandes: [
    { id: 1300, societe_id: 1100, contact_id: 1200, nature_transaction: 'les_deux', familles: ['L', 'activite'], surface_min: 1200, surface_max: 2100, budget_min: 180000, budget_max: 3800000, secteur_geo: 'Gonesse et Roissy', criteres_specifiques: 'Bâtiment indépendant, accès poids lourds et bureaux intégrés.' },
    { id: 1301, societe_id: 1101, contact_id: 1202, nature_transaction: 'location', familles: ['L', 'logistique'], surface_min: 4000, surface_max: 5500, budget_min: 400000, budget_max: 560000, secteur_geo: 'Mitry-Mory et nord Seine-et-Marne', criteres_specifiques: 'Quais, aire de manœuvre et disponibilité avant fin 2026.' },
    { id: 1302, societe_id: 1102, contact_id: 1203, nature_transaction: 'vente', familles: ['L', 'bureaux'], surface_min: 900, surface_max: 1500, budget_min: 3500000, budget_max: 5200000, secteur_geo: 'Argenteuil et proche couronne nord-ouest', criteres_specifiques: 'Immeuble identifiable, stationnement et possibilité d’occupation partielle.' },
    { id: 1303, societe_id: 1103, contact_id: 1204, nature_transaction: 'les_deux', familles: ['L', 'commerce'], surface_min: 600, surface_max: 900, budget_min: 110000, budget_max: 2400000, secteur_geo: 'Claye-Souilly et Meaux ouest', criteres_specifiques: 'Visibilité commerciale, accès livraison et stationnement clientèle.' },
    { id: 1304, societe_id: 1100, contact_id: 1201, nature_transaction: 'location', familles: ['L', 'activite'], surface_min: 700, surface_max: 1100, budget_min: 85000, budget_max: 145000, secteur_geo: 'Saint-Ouen-l’Aumône et Cergy', criteres_specifiques: 'Cellule divisible avec accès direct et bureaux aménageables.' },
  ],
  matchings: [
    { id: 1400, demande_id: 1300, lot_id: 500, score_global: 94, score_surface: 96, score_budget: 90, score_geographie: 98, score_transaction: 92, score_type_bien: 94 },
    { id: 1401, demande_id: 1300, lot_id: 501, score_global: 82, score_surface: 78, score_budget: 86, score_geographie: 84, score_transaction: 82, score_type_bien: 80 },
    { id: 1402, demande_id: 1301, lot_id: 503, score_global: 96, score_surface: 98, score_budget: 94, score_geographie: 99, score_transaction: 96, score_type_bien: 95 },
    { id: 1403, demande_id: 1302, lot_id: 502, score_global: 91, score_surface: 90, score_budget: 88, score_geographie: 92, score_transaction: 95, score_type_bien: 91 },
    { id: 1404, demande_id: 1303, lot_id: 504, score_global: 89, score_surface: 92, score_budget: 86, score_geographie: 91, score_transaction: 88, score_type_bien: 90 },
    { id: 1405, demande_id: 1304, lot_id: 501, score_global: 93, score_surface: 95, score_budget: 92, score_geographie: 94, score_transaction: 93, score_type_bien: 91 },
  ],
};

function record(id, fields) {
  return { id, fields: { ...fields, agence_id: agencyId } };
}

export function createSandboxData() {
  const tables = {
    Agences: [record(agencyId, { nom: 'Agence Horizon — démonstration', code: 'DEMO-IDF-NORD' })],
    Utilisateurs: users.map(({ id, ...fields }) => record(id, { ...fields, actif: true })),
    Adresses: [], Sites: [], Batiments: [], Cellules: [], Lots: [],
    Offres: [], Conditions_Financieres: [], Mandats: [], Medias: [],
    Societes: [], Contacts: [], Demandes: [], Matching_demandes_lots: [],
  };
  let cellId = 400;
  let conditionId = 700;

  offerSpecs.forEach((spec, index) => {
    const addressId = 100 + index;
    const siteId = 200 + index;
    const buildingId = 300 + index;
    const lotId = 500 + index;
    const offerId = 600 + index;
    const cells = spec.cellules.map((surface, cellIndex) => {
      const id = cellId;
      cellId += 1;
      tables.Cellules.push(record(id, {
        batiment_id: buildingId,
        nom: `${spec.typeBien} ${cellIndex + 1}`,
        numero: `C${cellIndex + 1}`,
        surface,
        etage: cellIndex === 0 ? 'rez_de_chaussee' : `niveau_${cellIndex}`,
        type_bien: spec.typeBien,
        photos: [spec.photo],
      }));
      return id;
    });

    tables.Adresses.push(record(addressId, {
      libelle: `Localisation fictive — secteur ${spec.commune}`,
      code_postal: spec.codePostal,
      ville: spec.commune,
      departement: spec.departement,
      pays: 'France',
      fictive: true,
    }));
    tables.Sites.push(record(siteId, {
      nom: `Site ${spec.commune} — démonstration`, adresse_id: addressId,
      surface_terrain: spec.surfaceTerrain, divisible: Boolean(spec.divisible), en_bloc: true,
      gestionnaire: 1005,
    }));
    tables.Batiments.push(record(buildingId, {
      site_id: siteId, nom: `Bâtiment ${spec.commune}`, numero: `B${index + 1}`,
      annee_construction: spec.annee, surface_totale: spec.surface, etat: spec.etat,
      divisible: Boolean(spec.divisible), copropriete: false, erp: spec.typeBien === 'commerce',
      igh: false, photos: [spec.photo], gestionnaire: 1005,
    }));
    tables.Lots.push(record(lotId, {
      nom: `Lot ${spec.commune}`, numero: `L${index + 1}`, cellules: ['L', ...cells],
      site_id: siteId, surface: spec.surface, divisible: Boolean(spec.divisible),
      nombre_parking: spec.parking, en_bloc: true, gestionnaire: 1005,
    }));
    tables.Offres.push(record(offerId, {
      numero: spec.numero, nom: spec.nom, lot_id: lotId, nature: spec.nature,
      type_contrat: spec.typeContrat, occupation: spec.occupation,
      stade_commercialisation: spec.stade, gestionnaire: 1005,
      co_gestionnaires: ['L', 1004], photo: spec.photo, photo_alt: spec.photoAlt,
      ville: spec.commune, code_postal: spec.codePostal, departement: spec.departement,
    }));
    for (const type of ['vente', 'location']) {
      if (!spec[type]) continue;
      tables.Conditions_Financieres.push(record(conditionId, {
        offre_id: offerId, type, ...spec[type], disponibilite: spec.disponibilite,
      }));
      conditionId += 1;
    }
    tables.Mandats.push(record(800 + index, {
      numero: `MAN-DEMO-${String(index + 1).padStart(3, '0')}`, numero_registre: `R-DEMO-${100 + index}`,
      offre_id: offerId, type: index % 2 === 0 ? 'exclusif' : 'simple', nature: spec.nature,
      avancement: 'actif', date_debut: '2026-07-01', date_fin: '2027-06-30',
      gestionnaire: 1005, donnee_exclusive: false,
    }));
    tables.Medias.push(record(900 + index, {
      offre_id: offerId, type: 'photo', url: spec.photo, alt: spec.photoAlt,
      provenance: 'Image générée par IA pour le bac à sable orIAna', fictif: true,
    }));
  });

  tables.Societes = crmData.societes.map(({ id, ...fields }) => record(id, {
    ...fields, gestionnaire: 1005, donnee_exclusive: false,
  }));
  tables.Contacts = crmData.contacts.map(({ id, ...fields }) => record(id, {
    ...fields, gestionnaire: 1005, donnee_exclusive: false,
  }));
  tables.Demandes = crmData.demandes.map(({ id, ...fields }) => record(id, {
    ...fields, gestionnaire: 1005, donnee_exclusive: false,
  }));
  tables.Matching_demandes_lots = crmData.matchings.map(({ id, ...fields }) => record(id, fields));

  return {
    meta: {
      schema: 'oriana-sandbox-v1', version: 1, date_reference: '2026-07-19',
      territoire: ['Val-d’Oise', 'Nord Seine-et-Marne'],
      avertissement: 'Toutes les identités, adresses précises, sociétés et offres sont fictives.',
    },
    tables,
  };
}

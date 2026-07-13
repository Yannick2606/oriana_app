export const patrimoineConfig = {
  sites: {
    table: 'Sites',
    fields: [
      'nom', 'adresse_id', 'surface_terrain', 'section_cadastrale', 'parcelles', 'divisible',
      'reserve_fonciere', 'servitudes', 'en_bloc',
    ],
    relations: [{ field: 'adresse_id', resource: 'adresses', optional: true, agencyOnly: true }],
  },
  batiments: {
    table: 'Batiments',
    fields: [
      'site_id', 'nom', 'numero', 'annee_construction', 'surface_totale', 'etat', 'divisible',
      'copropriete', 'erp', 'igh', 'erp_categorie', 'erp_type', 'destination_plu',
      'decret_tertiaire', 'photos',
    ],
    relations: [{ field: 'site_id', resource: 'sites' }],
  },
  cellules: {
    table: 'Cellules',
    fields: ['batiment_id', 'nom', 'numero', 'surface', 'etage', 'type_bien', 'photos'],
    relations: [{ field: 'batiment_id', resource: 'batiments' }],
  },
  lots: {
    table: 'Lots',
    fields: [
      'nom', 'numero', 'cellules', 'site_id', 'surface', 'divisible', 'nombre_parking', 'en_bloc',
    ],
    relations: [
      { field: 'cellules', resource: 'cellules', list: true, optional: true },
      { field: 'site_id', resource: 'sites', optional: true },
    ],
  },
  adresses: {
    table: 'Adresses',
    fields: [],
    relations: [],
  },
};

export const patrimoineResources = ['sites', 'batiments', 'cellules', 'lots'];

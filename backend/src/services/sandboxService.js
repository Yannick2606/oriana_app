const exposedTables = [
  'Adresses', 'Sites', 'Batiments', 'Cellules', 'Lots', 'Offres',
  'Conditions_Financieres', 'Mandats', 'Medias',
];

function serialize(record) {
  return { id: record.id, ...record.fields };
}

export function createSandboxService(data) {
  if (data?.meta?.schema !== 'oriana-sandbox-v1') {
    throw new Error('Jeu de démonstration invalide');
  }

  return {
    getOffersDataset() {
      return {
        source: 'sandbox',
        meta: data.meta,
        ...Object.fromEntries(exposedTables.map((table) => [
          table,
          (data.tables[table] ?? []).map(serialize),
        ])),
      };
    },
  };
}

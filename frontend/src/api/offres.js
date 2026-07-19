import { api } from './client';

export const offresApi = {
  async listAll({ sandbox = false } = {}) {
    if (sandbox) {
      const response = await api.get('/sandbox/offres');
      const data = response.data;
      return {
        source: data.source,
        meta: data.meta,
        offers: data.Offres,
        conditions: data.Conditions_Financieres,
        lots: data.Lots,
        sites: data.Sites,
        buildings: data.Batiments,
        cells: data.Cellules,
        addresses: data.Adresses,
        mandates: data.Mandats,
        media: data.Medias,
      };
    }
    const [offers, conditions, lots, sites, buildings, cells, addresses, mandates] = await Promise.all([
      api.get('/offres'), api.get('/conditions-financieres'), api.get('/lots'),
      api.get('/sites'), api.get('/batiments'), api.get('/cellules'), api.get('/adresses'),
      api.get('/mandats'),
    ]);
    return {
      source: 'metier', offers: offers.data, conditions: conditions.data, lots: lots.data,
      sites: sites.data, buildings: buildings.data, cells: cells.data, addresses: addresses.data,
      mandates: mandates.data, media: [],
    };
  },
  createOffer(data) { return api.post('/offres', data); },
  updateOffer(id, data) { return api.put(`/offres/${id}`, data); },
  createCondition(data) { return api.post('/conditions-financieres', data); },
  updateCondition(id, data) { return api.put(`/conditions-financieres/${id}`, data); },
};

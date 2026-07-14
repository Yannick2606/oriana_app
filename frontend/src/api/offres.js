import { api } from './client';

export const offresApi = {
  async listAll() {
    const [offers, conditions, lots] = await Promise.all([api.get('/offres'), api.get('/conditions-financieres'), api.get('/lots')]);
    return { offers: offers.data, conditions: conditions.data, lots: lots.data };
  },
  createOffer(data) { return api.post('/offres', data); },
  updateOffer(id, data) { return api.put(`/offres/${id}`, data); },
  createCondition(data) { return api.post('/conditions-financieres', data); },
  updateCondition(id, data) { return api.put(`/conditions-financieres/${id}`, data); },
};

import { api } from './client';
export const crmApi = {
  async listAll() { const [societes, contacts, demandes, lots] = await Promise.all([api.get('/societes'), api.get('/contacts'), api.get('/demandes'), api.get('/lots')]); return { societes: societes.data, contacts: contacts.data, demandes: demandes.data, lots: lots.data }; },
  create(resource, data) { return api.post(`/${resource}`, data); },
  update(resource, id, data) { return api.put(`/${resource}/${id}`, data); },
  matching(demandeId) { return api.get(`/matching?demande_id=${encodeURIComponent(demandeId)}`); },
};

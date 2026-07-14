import { api } from './client';

const resources = ['sites', 'batiments', 'cellules', 'lots'];

export const patrimoineApi = {
  async listAll() {
    const payloads = await Promise.all(resources.map((resource) => api.get(`/${resource}`)));
    return Object.fromEntries(resources.map((resource, index) => [resource, payloads[index].data]));
  },
  create(resource, data) { return api.post(`/${resource}`, data); },
  update(resource, id, data) { return api.put(`/${resource}/${id}`, data); },
};

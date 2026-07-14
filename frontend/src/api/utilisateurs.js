import { apiRequest } from './client';

export const utilisateursApi = {
  list: () => apiRequest('/utilisateurs'),
  update: (id, data) => apiRequest(`/utilisateurs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

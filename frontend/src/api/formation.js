import { api } from './client';

export const formationApi = {
  get: () => api.get('/formation/progression'),
  update: (progression) => api.put('/formation/progression', progression),
};

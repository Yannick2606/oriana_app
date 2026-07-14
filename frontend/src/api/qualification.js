import { api } from './client';

export const qualificationApi = {
  dictionary(famille, niveau) {
    return api.get(`/caracteristiques/dictionnaire?famille=${encodeURIComponent(famille)}&niveau=${encodeURIComponent(niveau)}`);
  },
  values(niveau, id) {
    return api.get(`/caracteristiques-bien?niveau=${encodeURIComponent(niveau)}&id=${encodeURIComponent(id)}`);
  },
  save(data) { return api.post('/caracteristiques-bien', data); },
};

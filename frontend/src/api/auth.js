import { api } from './client';

export const authApi = {
  me: () => api.get('/auth/me'),
  login: ({ email, motDePasse, roleActif }) => api.post('/auth/login', {
    email,
    mot_de_passe: motDePasse,
    ...(roleActif ? { role_actif: roleActif } : {}),
  }),
  changeRole: (roleActif) => api.post('/auth/role', { role_actif: roleActif }),
  logout: () => api.post('/auth/logout', {}),
};

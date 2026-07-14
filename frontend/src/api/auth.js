import { api } from './client';

export const authApi = {
  me: () => api.get('/auth/me'),
  login: ({ email, motDePasse, roleActif }) => api.post('/auth/login', {
    email,
    mot_de_passe: motDePasse,
    ...(roleActif ? { role_actif: roleActif } : {}),
  }),
  changeRole: (roleActif) => api.post('/auth/role', { role_actif: roleActif }),
  changeInitialPassword: (newPassword) => api.post('/auth/mot-de-passe/premiere-connexion', {
    nouveau_mot_de_passe: newPassword,
  }),
  requestPasswordReset: (email) => api.post('/auth/mot-de-passe/demande', { email }),
  resetPassword: ({ token, newPassword }) => api.post('/auth/mot-de-passe/reinitialisation', {
    token,
    nouveau_mot_de_passe: newPassword,
  }),
  logout: () => api.post('/auth/logout', {}),
};

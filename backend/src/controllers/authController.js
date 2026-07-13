import { AuthError } from '../services/authService.js';

function saveSession(request) {
  return new Promise((resolve, reject) => {
    request.session.save((error) => (error ? reject(error) : resolve()));
  });
}

function destroySession(request) {
  return new Promise((resolve, reject) => {
    request.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

function responseUser(sessionUser) {
  return {
    id: sessionUser.id,
    nom: sessionUser.nom,
    prenom: sessionUser.prenom,
    roles: sessionUser.roles,
    role_actif: sessionUser.role_actif,
  };
}

export function createAuthController(authService) {
  return {
    async login(request, response, next) {
      try {
        const result = await authService.login({
          email: request.body?.email,
          motDePasse: request.body?.mot_de_passe,
          roleActif: request.body?.role_actif,
        });

        if (result.selectionRequise) {
          return response.status(200).json({ selection_role_requise: true, roles: result.roles });
        }

        request.session.user = result.user;
        await saveSession(request);
        return response.status(200).json({ user: responseUser(result.user) });
      } catch (error) {
        if (error instanceof AuthError) {
          return response.status(error.status).json({ error: error.code });
        }
        return next(error);
      }
    },

    async logout(request, response, next) {
      try {
        await destroySession(request);
        response.clearCookie('oriana.sid');
        return response.status(200).json({ status: 'ok' });
      } catch (error) {
        return next(error);
      }
    },

    me(request, response) {
      if (!request.session.user) {
        return response.status(401).json({ error: 'UNAUTHENTICATED' });
      }

      return response.status(200).json({ user: responseUser(request.session.user) });
    },
  };
}

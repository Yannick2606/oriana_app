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
    doit_changer_mot_de_passe: sessionUser.doit_changer_mot_de_passe === true,
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

    async changeRole(request, response, next) {
      try {
        const user = await authService.changeRole({
          userId: request.session.user.id,
          roleActif: request.body?.role_actif,
        });
        request.session.user = user;
        await saveSession(request);
        return response.status(200).json({ user: responseUser(user) });
      } catch (error) {
        if (error instanceof AuthError) {
          return response.status(error.status).json({ error: error.code });
        }
        return next(error);
      }
    },

    async changeInitialPassword(request, response, next) {
      try {
        const user = await authService.changeInitialPassword({
          userId: request.session.user.id,
          roleActif: request.session.user.role_actif,
          newPassword: request.body?.nouveau_mot_de_passe,
        });
        request.session.user = user;
        await saveSession(request);
        return response.status(200).json({ user: responseUser(user) });
      } catch (error) {
        if (error instanceof AuthError) return response.status(error.status).json({ error: error.code });
        return next(error);
      }
    },

    async requestPasswordReset(request, response, next) {
      try {
        await authService.requestPasswordReset({ email: request.body?.email });
        return response.status(202).json({ status: 'accepted' });
      } catch (error) {
        if (error instanceof AuthError) return response.status(error.status).json({ error: error.code });
        return next(error);
      }
    },

    async resetPassword(request, response, next) {
      try {
        await authService.resetPassword({
          token: request.body?.token,
          newPassword: request.body?.nouveau_mot_de_passe,
        });
        return response.status(200).json({ status: 'ok' });
      } catch (error) {
        if (error instanceof AuthError) return response.status(error.status).json({ error: error.code });
        return next(error);
      }
    },
  };
}

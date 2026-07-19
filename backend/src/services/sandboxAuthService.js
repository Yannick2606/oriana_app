import bcrypt from 'bcrypt';

import { AuthError } from './authService.js';
import { normalizeRoleNames, ROLES } from './roleModel.js';

const previewRoles = ROLES.filter((role) => role !== 'client');

function previewUser(roleActif) {
  return {
    id: 1001,
    nom: 'Démonstration',
    prenom: 'orIAna',
    roles: previewRoles,
    role_actif: roleActif,
    agence_id: 1,
    master_consultant_id: null,
    doit_changer_mot_de_passe: false,
  };
}

async function readOnly() {
  throw new AuthError(
    'Action indisponible dans la prévisualisation',
    403,
    'SANDBOX_READ_ONLY',
  );
}

export function createSandboxAuthService({
  email,
  passwordHash,
  passwordComparer = bcrypt.compare,
} = {}) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !/^\$2[aby]\$\d{2}\$.{53}$/.test(passwordHash ?? '')) {
    throw new Error('Configuration d’authentification du bac à sable incomplète');
  }

  return {
    async login({ email: candidateEmail, motDePasse, roleActif }) {
      const candidate = typeof candidateEmail === 'string'
        ? candidateEmail.trim().toLowerCase()
        : '';
      if (!candidate || typeof motDePasse !== 'string' || !motDePasse) {
        throw new AuthError('Identifiants requis', 400, 'INVALID_REQUEST');
      }

      const matches = candidate === normalizedEmail
        ? await passwordComparer(motDePasse, passwordHash)
        : false;
      if (!matches) {
        throw new AuthError('Identifiants invalides', 401, 'INVALID_CREDENTIALS');
      }
      if (!roleActif) {
        return { selectionRequise: true, roles: previewRoles };
      }

      const selectedRole = normalizeRoleNames(roleActif)[0];
      if (!previewRoles.includes(selectedRole)) {
        throw new AuthError('Rôle non autorisé', 403, 'INVALID_ROLE');
      }
      return { selectionRequise: false, user: previewUser(selectedRole) };
    },

    async changeRole({ userId, roleActif }) {
      const selectedRole = normalizeRoleNames(roleActif)[0];
      if (Number(userId) !== 1001 || !previewRoles.includes(selectedRole)) {
        throw new AuthError('Rôle non autorisé', 403, 'INVALID_ROLE');
      }
      return previewUser(selectedRole);
    },

    changeInitialPassword: readOnly,
    requestPasswordReset: readOnly,
    resetPassword: readOnly,
  };
}

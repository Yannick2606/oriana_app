import bcrypt from 'bcrypt';

import { gristClient } from './gristClient.js';
import { normalizeRoleNames } from './roleModel.js';

export class AuthError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function normalizeRoles(value) {
  return normalizeRoleNames(value);
}

function publicUser(record, roles, roleActif) {
  const fields = record.fields;

  return {
    id: record.id,
    nom: fields.nom,
    prenom: fields.prenom,
    roles,
    role_actif: roleActif,
    agence_id: fields.agence_id,
    master_consultant_id: fields.master_consultant_id || null,
    doit_changer_mot_de_passe: fields.doit_changer_mot_de_passe === true,
  };
}

export function createAuthService({ usersClient = gristClient, passwordComparer = bcrypt.compare, passwordHasher = (password) => bcrypt.hash(password, 12) } = {}) {
  return {
    async login({ email, motDePasse, roleActif }) {
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

      if (!normalizedEmail || typeof motDePasse !== 'string' || !motDePasse) {
        throw new AuthError('Identifiants requis', 400, 'INVALID_REQUEST');
      }

      const records = await usersClient.list('Utilisateurs', { email: [normalizedEmail] });
      const userRecord = records[0];
      const passwordHash = userRecord?.fields?.mot_de_passe_hash;
      const passwordMatches = passwordHash
        ? await passwordComparer(motDePasse, passwordHash)
        : false;

      if (!userRecord || !passwordMatches || userRecord.fields.actif !== true) {
        throw new AuthError('Identifiants invalides', 401, 'INVALID_CREDENTIALS');
      }

      const roles = normalizeRoles(userRecord.fields.roles ?? userRecord.fields.role);

      if (roles.length === 0) {
        throw new AuthError('Aucun rôle attribué', 403, 'NO_ROLE');
      }

      if (!roleActif && roles.length > 1) {
        return { selectionRequise: true, roles };
      }

      const selectedRole = roleActif ? normalizeRoleNames(roleActif)[0] : roles[0];
      if (!roles.includes(selectedRole)) {
        throw new AuthError('Rôle non autorisé', 403, 'INVALID_ROLE');
      }

      return {
        selectionRequise: false,
        user: publicUser(userRecord, roles, selectedRole),
      };
    },

    async changeRole({ userId, roleActif }) {
      if (!roleActif || typeof roleActif !== 'string') {
        throw new AuthError('Rôle requis', 400, 'INVALID_REQUEST');
      }

      const userRecord = await usersClient.getById('Utilisateurs', userId);
      if (!userRecord || userRecord.fields.actif !== true) {
        throw new AuthError('Session invalide', 401, 'UNAUTHENTICATED');
      }

      const roles = normalizeRoles(userRecord.fields.roles ?? userRecord.fields.role);
      const selectedRole = normalizeRoleNames(roleActif)[0];
      if (!roles.includes(selectedRole)) {
        throw new AuthError('Rôle non autorisé', 403, 'INVALID_ROLE');
      }

      return publicUser(userRecord, roles, selectedRole);
    },

    async changeInitialPassword({ userId, newPassword, roleActif }) {
      if (typeof newPassword !== 'string' || newPassword.length < 12) {
        throw new AuthError('Mot de passe trop court', 400, 'WEAK_PASSWORD');
      }
      const current = await usersClient.getById('Utilisateurs', userId);
      if (!current || current.fields.actif !== true) {
        throw new AuthError('Session invalide', 401, 'UNAUTHENTICATED');
      }
      if (current.fields.doit_changer_mot_de_passe !== true) {
        throw new AuthError('Changement non requis', 409, 'PASSWORD_CHANGE_NOT_REQUIRED');
      }
      if (await passwordComparer(newPassword, current.fields.mot_de_passe_hash)) {
        throw new AuthError('Nouveau mot de passe identique', 400, 'PASSWORD_UNCHANGED');
      }
      const passwordHash = await passwordHasher(newPassword);
      const updated = await usersClient.update('Utilisateurs', userId, {
        mot_de_passe_hash: passwordHash,
        doit_changer_mot_de_passe: false,
      });
      const roles = normalizeRoles(updated.fields.roles ?? updated.fields.role);
      return publicUser(updated, roles, roleActif);
    },
  };
}

export const authService = createAuthService();

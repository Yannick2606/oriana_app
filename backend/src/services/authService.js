import bcrypt from 'bcrypt';

import { gristClient } from './gristClient.js';

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
  if (Array.isArray(value)) {
    return value.filter((role) => role !== 'L' && typeof role === 'string');
  }

  return typeof value === 'string' && value ? [value] : [];
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
  };
}

export function createAuthService({ usersClient = gristClient, passwordComparer = bcrypt.compare } = {}) {
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

      const selectedRole = roleActif ?? roles[0];
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
      if (!roles.includes(roleActif)) {
        throw new AuthError('Rôle non autorisé', 403, 'INVALID_ROLE');
      }

      return publicUser(userRecord, roles, roleActif);
    },
  };
}

export const authService = createAuthService();

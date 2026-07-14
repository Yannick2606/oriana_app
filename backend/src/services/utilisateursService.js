import bcrypt from 'bcrypt';
import { normalizeRoleNames, ROLES } from './roleModel.js';

const rolesAutorises = new Set(ROLES);
const champsModification = ['nom', 'prenom', 'email', 'roles', 'agence_id', 'master_consultant_id', 'actif'];

export class UtilisateursError extends Error {
  constructor(message, status, code) {
    super(message); this.name = 'UtilisateursError'; this.status = status; this.code = code;
  }
}

function positiveId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) throw new UtilisateursError('Identifiant invalide', 400, 'INVALID_ID');
  return id;
}

function normalizeRoles(value) {
  if (!Array.isArray(value)) throw new UtilisateursError('Rôles invalides', 400, 'INVALID_ROLES');
  const roles = normalizeRoleNames(value);
  if (roles.length === 0 || roles.some((role) => !rolesAutorises.has(role))) {
    throw new UtilisateursError('Rôles invalides', 400, 'INVALID_ROLES');
  }
  return ['L', ...roles];
}

function publicRecord(record) {
  const {
    mot_de_passe_hash: omitted, role, roles: legacyRoles, ...fields
  } = record.fields;
  void omitted;
  const storedRoles = role ?? legacyRoles;
  const roles = normalizeRoleNames(storedRoles);
  return { id: record.id, ...fields, roles };
}

function toGrist(data) {
  if (!('roles' in data)) return data;
  const { roles, ...fields } = data;
  return { ...fields, role: roles };
}

function sanitize(input, create) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new UtilisateursError('Corps invalide', 400, 'INVALID_REQUEST');
  }
  if ('mot_de_passe_hash' in input || (!create && 'mot_de_passe' in input)) {
    throw new UtilisateursError('Champ interdit', 400, 'FORBIDDEN_FIELD');
  }
  const allowed = create ? [...champsModification, 'mot_de_passe'] : champsModification;
  if (Object.keys(input).some((field) => !allowed.includes(field))) {
    throw new UtilisateursError('Champ inconnu', 400, 'UNKNOWN_FIELD');
  }
  const data = Object.fromEntries(champsModification.filter((field) => field in input).map((field) => [field, input[field]]));
  if ('email' in data) {
    data.email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new UtilisateursError('Email invalide', 400, 'INVALID_EMAIL');
  }
  if ('roles' in data) data.roles = normalizeRoles(data.roles);
  if ('actif' in data && typeof data.actif !== 'boolean') throw new UtilisateursError('État invalide', 400, 'INVALID_ACTIVE');
  if (create) {
    for (const field of ['nom', 'prenom', 'email', 'roles', 'agence_id', 'mot_de_passe']) {
      if (input[field] === undefined || input[field] === null || input[field] === '') throw new UtilisateursError('Champ requis', 400, 'REQUIRED_FIELD');
    }
    if (typeof input.mot_de_passe !== 'string' || input.mot_de_passe.length < 12) {
      throw new UtilisateursError('Mot de passe trop court', 400, 'WEAK_PASSWORD');
    }
  }
  return data;
}

function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 12) {
    throw new UtilisateursError('Mot de passe trop court', 400, 'WEAK_PASSWORD');
  }
  return value;
}

export function createUtilisateursService(client, passwordHasher = (password) => bcrypt.hash(password, 12)) {
  async function validateAgency(agencyId) {
    const agency = await client.getById('Agences', positiveId(agencyId));
    if (!agency) throw new UtilisateursError('Agence introuvable', 400, 'INVALID_AGENCY');
    return agency.id;
  }

  async function ensureUniqueEmail(email, currentId) {
    if (!email) return;
    const records = await client.list('Utilisateurs', { email: [email] });
    if (records.some((record) => record.id !== currentId)) {
      throw new UtilisateursError('Email déjà utilisé', 409, 'EMAIL_ALREADY_USED');
    }
  }

  async function validateMaster(data, current) {
    const merged = { ...current?.fields, ...data };
    if (!merged.master_consultant_id) { if ('master_consultant_id' in data) data.master_consultant_id = null; return; }
    const roles = normalizeRoleNames(merged.roles ?? merged.role);
    if (!roles.includes('consultant')) throw new UtilisateursError('Rattachement réservé aux consultants', 400, 'INVALID_MASTER_RELATION');
    const master = await client.getById('Utilisateurs', positiveId(merged.master_consultant_id));
    const masterRoles = normalizeRoleNames(master?.fields?.roles ?? master?.fields?.role);
    if (!master || !masterRoles.includes('master_consultant') || String(master.fields.agence_id) !== String(merged.agence_id)) throw new UtilisateursError('Master consultant invalide', 400, 'INVALID_MASTER_RELATION');
    data.master_consultant_id = master.id;
  }

  return {
    async list() { return (await client.list('Utilisateurs')).map(publicRecord); },
    async create(input) {
      const data = sanitize(input, true);
      data.agence_id = await validateAgency(data.agence_id);
      await validateMaster(data);
      await ensureUniqueEmail(data.email);
      const passwordHash = await passwordHasher(validatePassword(input.mot_de_passe));
      let record = await client.create('Utilisateurs', {
        ...toGrist(data), actif: data.actif ?? true, mot_de_passe_hash: passwordHash,
        doit_changer_mot_de_passe: true,
      });
      if (!record?.fields) {
        [record] = await client.list('Utilisateurs', { email: [data.email] });
      }
      if (!record) throw new UtilisateursError('Utilisateur créé mais non relu', 502, 'GRIST_READBACK_FAILED');
      return publicRecord(record);
    },
    async update(recordId, input) {
      const id = positiveId(recordId); const current = await client.getById('Utilisateurs', id);
      if (!current) throw new UtilisateursError('Utilisateur introuvable', 404, 'NOT_FOUND');
      const data = sanitize(input, false);
      if ('agence_id' in data) data.agence_id = await validateAgency(data.agence_id);
      await validateMaster(data, current);
      await ensureUniqueEmail(data.email, current.id);
      return publicRecord(await client.update('Utilisateurs', current.id, toGrist(data)));
    },
    async resetPassword(recordId, password) {
      const id = positiveId(recordId);
      const current = await client.getById('Utilisateurs', id);
      if (!current) throw new UtilisateursError('Utilisateur introuvable', 404, 'NOT_FOUND');
      const passwordHash = await passwordHasher(validatePassword(password));
      return publicRecord(await client.update('Utilisateurs', id, {
        mot_de_passe_hash: passwordHash,
        doit_changer_mot_de_passe: true,
      }));
    },
  };
}

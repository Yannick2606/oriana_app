import { normalizeRoleNames, ROLES } from './roleModel.js';

export class FormationError extends Error {
  constructor(message, status, code) { super(message); this.name = 'FormationError'; this.status = status; this.code = code; }
}

function parseProgress(value) {
  if (!value) return {};
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; }
}

function activeRole(user) {
  const role = normalizeRoleNames(user?.role_actif)[0];
  if (!ROLES.includes(role)) throw new FormationError('Rôle invalide', 403, 'FORBIDDEN');
  return role;
}

export function createFormationService(client) {
  async function current(user) {
    const record = await client.getById('Utilisateurs', user.id);
    if (!record) throw new FormationError('Utilisateur introuvable', 404, 'NOT_FOUND');
    return record;
  }
  return {
    async get(user) {
      const role = activeRole(user); const record = await current(user);
      return { role, progression: parseProgress(record.fields.progression_formation)[role] ?? { etape: 0, statut: 'a_faire' } };
    },
    async update(user, input) {
      const role = activeRole(user); const record = await current(user);
      if (!input || !['en_cours', 'termine', 'passe', 'a_faire'].includes(input.statut) || !Number.isInteger(input.etape) || input.etape < 0) {
        throw new FormationError('Progression invalide', 400, 'INVALID_PROGRESS');
      }
      const all = parseProgress(record.fields.progression_formation);
      all[role] = { etape: input.etape, statut: input.statut };
      await client.update('Utilisateurs', record.id, { progression_formation: JSON.stringify(all) });
      return { role, progression: all[role] };
    },
  };
}

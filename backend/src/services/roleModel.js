export const ROLE_ALIASES = { manager: 'master_consultant', admin: 'admin_agence' };
export const ROLES = ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence', 'super_admin', 'client'];

export function normalizeRoleNames(value) {
  const values = Array.isArray(value) ? value.filter((item) => item !== 'L') : typeof value === 'string' ? [value] : [];
  return [...new Set(values.filter((role) => typeof role === 'string').map((role) => ROLE_ALIASES[role] || role))];
}

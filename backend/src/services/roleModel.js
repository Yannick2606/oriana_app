export const ROLE_ALIASES = { manager: 'master_consultant', admin: 'admin_agence' };
export const ROLES = ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence', 'super_admin', 'client'];

const AGENCY_MANAGEMENT_ROLES = new Set(['directeur_agence', 'admin_agence']);
const USER_ADMINISTRATION_ROLES = new Set([...AGENCY_MANAGEMENT_ROLES, 'super_admin']);

export function normalizeRoleNames(value) {
  const values = Array.isArray(value) ? value.filter((item) => item !== 'L') : typeof value === 'string' ? [value] : [];
  return [...new Set(values.filter((role) => typeof role === 'string').map((role) => ROLE_ALIASES[role] || role))];
}

export function activeRoleName(value) {
  return normalizeRoleNames(value)[0] ?? null;
}

export function canManageAgencyData(value) {
  return AGENCY_MANAGEMENT_ROLES.has(activeRoleName(value));
}

export function canAdministerUsers(value) {
  return USER_ADMINISTRATION_ROLES.has(activeRoleName(value));
}

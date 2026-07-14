import { normalizeRoleNames } from '../services/roleModel.js';

export function requireAdmin(request, response, next) {
  const role = normalizeRoleNames(request.session?.user?.role_actif)[0];
  if (!['directeur_agence', 'admin_agence', 'super_admin'].includes(role)) {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }
  return next();
}

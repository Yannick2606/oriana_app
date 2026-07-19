import { canManageAgencyData } from '../services/roleModel.js';

export function requireManager(request, response, next) {
  if (!canManageAgencyData(request.session?.user?.role_actif)) {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }
  return next();
}

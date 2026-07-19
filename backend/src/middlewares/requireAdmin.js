import { canAdministerUsers } from '../services/roleModel.js';

export function requireAdmin(request, response, next) {
  if (!canAdministerUsers(request.session?.user?.role_actif)) {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }
  return next();
}

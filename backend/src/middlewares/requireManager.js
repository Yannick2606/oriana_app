export function requireManager(request, response, next) {
  const role = request.session?.user?.role_actif;
  if (!['manager', 'admin', 'directeur_agence', 'admin_agence'].includes(role)) {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }
  return next();
}

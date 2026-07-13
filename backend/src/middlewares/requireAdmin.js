export function requireAdmin(request, response, next) {
  if (request.session?.user?.role_actif !== 'admin') {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }
  return next();
}

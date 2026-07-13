export function requireManager(request, response, next) {
  const role = request.session?.user?.role_actif;
  if (role !== 'manager' && role !== 'admin') {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }
  return next();
}

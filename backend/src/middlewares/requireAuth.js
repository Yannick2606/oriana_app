export function requireAuth(request, response, next) {
  if (!request.session?.user) {
    return response.status(401).json({ error: 'UNAUTHENTICATED' });
  }

  return next();
}

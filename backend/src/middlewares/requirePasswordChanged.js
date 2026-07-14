export function requirePasswordChanged(request, response, next) {
  if (request.session?.user?.doit_changer_mot_de_passe === true) {
    return response.status(403).json({ error: 'PASSWORD_CHANGE_REQUIRED' });
  }
  return next();
}

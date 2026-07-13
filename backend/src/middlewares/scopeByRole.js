function sameReference(left, right) {
  return left !== undefined && left !== null && String(left) === String(right);
}

export function buildAccessScope(user) {
  if (!user?.agence_id || !user?.role_actif) {
    return null;
  }

  if (user.role_actif === 'consultant') {
    return { agence_id: user.agence_id, gestionnaire: user.id };
  }

  if (user.role_actif === 'manager' || user.role_actif === 'admin') {
    return { agence_id: user.agence_id };
  }

  return null;
}

export function scopeByRole(request, response, next) {
  const accessScope = buildAccessScope(request.session?.user);

  if (!accessScope) {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }

  request.accessScope = accessScope;
  return next();
}

export function resourceMatchesScope(resource, accessScope) {
  const fields = resource?.fields ?? resource;
  if (!fields || !accessScope) {
    return false;
  }

  return Object.entries(accessScope)
    .every(([field, expected]) => sameReference(fields[field], expected));
}

export function requireResourceAccess(loadResource) {
  return async function resourceAccessMiddleware(request, response, next) {
    try {
      const resource = await loadResource(request.params.id);

      if (!resource) {
        return response.status(404).json({ error: 'NOT_FOUND' });
      }

      if (!resourceMatchesScope(resource, request.accessScope)) {
        return response.status(403).json({ error: 'FORBIDDEN' });
      }

      request.resource = resource;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

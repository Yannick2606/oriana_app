import { normalizeRoleNames } from '../services/roleModel.js';

function sameReference(left, right) {
  return left !== undefined && left !== null && (Array.isArray(right)
    ? right.some((value) => String(left) === String(value)) : String(left) === String(right));
}

export function buildAccessScope(user, teamIds = []) {
  if (!user?.agence_id || !user?.role_actif) {
    return null;
  }

  const role = normalizeRoleNames(user.role_actif)[0];
  if (role === 'consultant') {
    return { agence_id: user.agence_id, gestionnaire: user.id };
  }
  if (role === 'master_consultant') {
    return { agence_id: user.agence_id, gestionnaire: [user.id, ...teamIds] };
  }
  if (role === 'directeur_agence' || role === 'admin_agence') {
    return { agence_id: user.agence_id };
  }

  return null;
}

export function buildWriteScope(user) {
  const role = normalizeRoleNames(user?.role_actif)[0];
  if (role === 'consultant' || role === 'master_consultant') return { agence_id: user.agence_id, gestionnaire: user.id };
  if (role === 'directeur_agence' || role === 'admin_agence') return { agence_id: user.agence_id };
  return null;
}

export async function scopeByRole(request, response, next) {
  const user = request.session?.user;
  const role = normalizeRoleNames(user?.role_actif)[0];
  let teamIds = [];
  try {
    if (role === 'master_consultant') {
      const identityRepository = request.app.locals.identityRepository;
      if (!identityRepository?.list) {
        throw new Error('Référentiel d’identité non configuré');
      }
      const members = await identityRepository.list('Utilisateurs', { agence_id: [user.agence_id], master_consultant_id: [user.id], actif: [true] });
      teamIds = members.map((member) => member.id);
    }
  } catch (error) { return next(error); }
  const accessScope = buildAccessScope(user, teamIds);

  if (!accessScope) {
    return response.status(403).json({ error: 'FORBIDDEN' });
  }

  request.accessScope = accessScope;
  request.writeScope = buildWriteScope(user);
  user.equipe_ids = teamIds;
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

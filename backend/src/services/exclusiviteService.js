import { activeRoleName, canManageAgencyData } from './roleModel.js';

export function estManager(user) {
  return canManageAgencyData(user?.role_actif);
}

function memeReference(left, right) {
  return left !== undefined && left !== null && String(left) === String(right);
}

export function memeAgence(record, user) {
  return memeReference(record?.fields?.agence_id, user?.agence_id);
}

export function estGestionnaire(record, user) {
  return memeReference(record?.fields?.gestionnaire, user?.id);
}

function estDansEquipe(record, user) {
  return activeRoleName(user?.role_actif) === 'master_consultant'
    && user.equipe_ids?.some((id) => memeReference(record?.fields?.gestionnaire, id));
}

export function peutLire(record, user) {
  return memeAgence(record, user)
    && (estManager(user) || estGestionnaire(record, user) || estDansEquipe(record, user) || record.fields.donnee_exclusive === false);
}

export function peutEcrire(record, user) {
  return memeAgence(record, user) && (estManager(user) || estGestionnaire(record, user));
}

export function validerTransitionExclusivite(record, requested, user, ErrorType) {
  if (requested === undefined || requested === record.fields.donnee_exclusive) return;
  if (typeof requested !== 'boolean') {
    throw new ErrorType('Exclusivité invalide', 400, 'INVALID_EXCLUSIVITY');
  }
  if (estManager(user)) return;
  if (estGestionnaire(record, user) && record.fields.donnee_exclusive === true && requested === false) return;
  throw new ErrorType('Transition d’exclusivité interdite', 403, 'EXCLUSIVITY_FORBIDDEN');
}

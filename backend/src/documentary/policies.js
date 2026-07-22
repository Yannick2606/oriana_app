import {
  AUDIO_FORMATS,
  AUDIO_PROFILE,
  CAPTURE_QUOTAS,
  DOCUMENT_FORMATS,
  RETENTION_POLICIES,
  VALID_ATTACHMENT_TARGETS,
} from './catalogs.js';
import { DOCUMENTARY_ERROR_CODES, DocumentaryError } from './errors.js';

const CAPTURE_TRANSITIONS = Object.freeze({
  brouillon_prive: ['transfert'],
  transfert: ['traitement', 'erreur'],
  traitement: ['a_valider', 'erreur'],
  a_valider: ['validee', 'rejetee', 'erreur'],
  validee: ['archivee'],
  rejetee: ['archivee', 'purge'],
  erreur: ['archivee', 'purge'],
  archivee: ['purge'],
  purge: [],
});

const FILE_TRANSITIONS = Object.freeze({
  initie: ['transfert'],
  transfert: ['quarantaine'],
  quarantaine: ['disponible', 'refuse'],
  disponible: ['archive'],
  refuse: ['purge'],
  archive: ['purge'],
  purge: [],
});

const AGENCY_MANAGEMENT_ROLES = new Set(['directeur_agence']);

function documentaryError(message, code) {
  return new DocumentaryError(message, DOCUMENTARY_ERROR_CODES[code]);
}

function normalizedExtension(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const extension = value.trim().toLowerCase();
  return extension.startsWith('.') ? extension : `.${extension}`;
}

function normalizedMimeType(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  return value.split(';', 1)[0].trim().toLowerCase();
}

function matchingFormat(formats, extension, declaredMimeType, detectedMimeType) {
  return formats.find((format) => format.extensions.includes(extension)
    && format.mimeTypes.includes(declaredMimeType)
    && format.mimeTypes.includes(detectedMimeType));
}

export function validateFileDescriptor({
  kind = 'document',
  extension,
  declaredMimeType,
  detectedMimeType,
  sizeBytes,
  durationSeconds,
} = {}) {
  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > CAPTURE_QUOTAS.file.maxBytes) {
    throw documentaryError('Taille de fichier invalide', 'INVALID_DOCUMENT_SIZE');
  }

  const normalized = {
    extension: normalizedExtension(extension),
    declaredMimeType: normalizedMimeType(declaredMimeType),
    detectedMimeType: normalizedMimeType(detectedMimeType),
  };
  const formats = kind === 'audio' ? AUDIO_FORMATS : kind === 'document' ? DOCUMENT_FORMATS : null;
  const format = formats && matchingFormat(
    formats,
    normalized.extension,
    normalized.declaredMimeType,
    normalized.detectedMimeType,
  );

  if (!format) {
    throw documentaryError('Type de fichier invalide', 'INVALID_DOCUMENT_TYPE');
  }

  if (kind === 'audio'
    && (!Number.isFinite(durationSeconds)
      || durationSeconds <= 0
      || durationSeconds > AUDIO_PROFILE.maxDurationSeconds)) {
    throw documentaryError('Durée audio invalide', 'INVALID_DOCUMENT_SIZE');
  }

  return Object.freeze({
    kind,
    format: format.code,
    ...normalized,
    sizeBytes,
    ...(kind === 'audio' ? { durationSeconds } : {}),
  });
}

export function validateAttachmentTarget(target) {
  if (!VALID_ATTACHMENT_TARGETS.includes(target)) {
    throw documentaryError('Cible de rattachement invalide', 'INVALID_ATTACHMENT_TARGET');
  }
  return target;
}

function assertTransition(transitions, from, to) {
  if (!transitions[from]?.includes(to)) {
    throw documentaryError('Transition documentaire invalide', 'INVALID_DOCUMENT_TRANSITION');
  }
  return to;
}

export function assertCaptureTransition(from, to) {
  return assertTransition(CAPTURE_TRANSITIONS, from, to);
}

export function assertFileTransition(from, to) {
  return assertTransition(FILE_TRANSITIONS, from, to);
}

export function malwareVerdictAllowsProcessing(verdict) {
  return verdict === 'sain';
}

export function retentionDeadline({ retentionClass, from, legalHold = false } = {}) {
  const policy = RETENTION_POLICIES[retentionClass];
  if (!policy) throw new TypeError('Politique de conservation inconnue');
  if (legalHold || policy.mode === 'parent_lifetime') return null;

  const origin = from instanceof Date ? new Date(from.getTime()) : new Date(from);
  if (Number.isNaN(origin.getTime())) throw new TypeError('Date de conservation invalide');
  return new Date(origin.getTime() + policy.durationHours * 60 * 60 * 1000);
}

function sameIdentifier(left, right) {
  return left !== undefined && left !== null && right !== undefined && right !== null
    && String(left) === String(right);
}

export function canAccessCapture({ actor, capture, teamIds = [], action = 'read' } = {}) {
  if (!actor || !capture || ['admin_agence', 'super_admin'].includes(actor.role_actif)) return false;
  if (!sameIdentifier(actor.agence_id, capture.agence_id)) return false;
  if (capture.etat === 'purge') return false;

  const ownsCapture = sameIdentifier(actor.id, capture.auteur_id);
  if (capture.etat === 'brouillon_prive') {
    return ['read', 'write'].includes(action) && ownsCapture;
  }
  if (action === 'write') return false;

  if (action === 'validate') {
    return capture.etat === 'a_valider' && AGENCY_MANAGEMENT_ROLES.has(actor.role_actif);
  }
  if (action !== 'read') return false;

  if (actor.role_actif === 'consultant') return ownsCapture;
  if (actor.role_actif === 'master_consultant') {
    return ownsCapture || teamIds.some((id) => sameIdentifier(id, capture.auteur_id));
  }
  return AGENCY_MANAGEMENT_ROLES.has(actor.role_actif);
}

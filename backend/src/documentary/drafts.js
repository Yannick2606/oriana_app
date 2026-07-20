import { CAPTURE_TYPES, VALID_ATTACHMENT_TARGETS } from './catalogs.js';

export const DRAFT_INITIAL_VERSION = 1;
export const DRAFT_COMMENT_MAX_LENGTH = 2_000;
export const DRAFT_LIST_LIMITS = Object.freeze({ default: 20, max: 50 });
export const DRAFT_MUTABLE_FIELDS = Object.freeze([
  'type',
  'commentaire',
  'rattachement_propose',
]);

const CREATE_FIELDS = new Set(DRAFT_MUTABLE_FIELDS);
const UPDATE_FIELDS = new Set(['version_attendue', ...DRAFT_MUTABLE_FIELDS]);

export class DraftCommandValidationError extends TypeError {
  constructor(message, field = null) {
    super(message);
    this.name = 'DraftCommandValidationError';
    this.field = field;
  }
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertCommand(command) {
  if (!isPlainObject(command)) {
    throw new DraftCommandValidationError('Commande de brouillon invalide');
  }
}

function assertAllowedFields(command, allowedFields) {
  const unknownField = Object.keys(command).find((field) => !allowedFields.has(field));
  if (unknownField) {
    throw new DraftCommandValidationError('Champ de brouillon non modifiable', unknownField);
  }
}

function validateType(value) {
  if (!CAPTURE_TYPES.includes(value)) {
    throw new DraftCommandValidationError('Type de capture invalide', 'type');
  }
  return value;
}

function exceedsCharacterLimit(value, limit) {
  const iterator = value[Symbol.iterator]();
  for (let count = 0; count <= limit; count += 1) {
    if (iterator.next().done) return false;
  }
  return true;
}

function validateComment(value) {
  if (value === null) return null;
  if (typeof value !== 'string'
    || exceedsCharacterLimit(value, DRAFT_COMMENT_MAX_LENGTH)) {
    throw new DraftCommandValidationError('Commentaire de capture invalide', 'commentaire');
  }
  return value;
}

function validIdentifier(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return Number.isSafeInteger(value) && value > 0;
}

function validateAttachment(value) {
  if (value === null) return null;
  if (!isPlainObject(value)) {
    throw new DraftCommandValidationError('Rattachement proposé invalide', 'rattachement_propose');
  }

  const fields = Object.keys(value);
  if (fields.length !== 2 || !fields.includes('type') || !fields.includes('id')) {
    throw new DraftCommandValidationError('Rattachement proposé invalide', 'rattachement_propose');
  }
  if (!VALID_ATTACHMENT_TARGETS.includes(value.type) || !validIdentifier(value.id)) {
    throw new DraftCommandValidationError('Rattachement proposé invalide', 'rattachement_propose');
  }
  return Object.freeze({ type: value.type, id: value.id });
}

function validatedMutableFields(command) {
  const result = {};
  if (Object.hasOwn(command, 'type')) result.type = validateType(command.type);
  if (Object.hasOwn(command, 'commentaire')) {
    result.commentaire = validateComment(command.commentaire);
  }
  if (Object.hasOwn(command, 'rattachement_propose')) {
    result.rattachement_propose = validateAttachment(command.rattachement_propose);
  }
  return result;
}

export function validateExpectedVersion(value) {
  if (!Number.isSafeInteger(value) || value < DRAFT_INITIAL_VERSION) {
    throw new DraftCommandValidationError('Version attendue invalide', 'version_attendue');
  }
  return value;
}

export function nextDraftVersion(value) {
  const version = validateExpectedVersion(value);
  if (version === Number.MAX_SAFE_INTEGER) {
    throw new DraftCommandValidationError('Version de brouillon hors limite', 'version_attendue');
  }
  return version + 1;
}

export function validateCreateDraftCommand(command) {
  assertCommand(command);
  assertAllowedFields(command, CREATE_FIELDS);
  if (!Object.hasOwn(command, 'type')) {
    throw new DraftCommandValidationError('Type de capture requis', 'type');
  }
  return Object.freeze(validatedMutableFields(command));
}

export function validateUpdateDraftCommand(command) {
  assertCommand(command);
  assertAllowedFields(command, UPDATE_FIELDS);
  const versionAttendue = validateExpectedVersion(command.version_attendue);
  const mutableFields = validatedMutableFields(command);
  if (Object.keys(mutableFields).length === 0) {
    throw new DraftCommandValidationError('Aucune modification de brouillon', null);
  }
  return Object.freeze({ version_attendue: versionAttendue, ...mutableFields });
}

export function normalizeDraftListOptions({ cursor, limit = DRAFT_LIST_LIMITS.default } = {}) {
  if (cursor !== undefined && cursor !== null
    && (typeof cursor !== 'string' || cursor.length === 0)) {
    throw new DraftCommandValidationError('Curseur de brouillon invalide', 'cursor');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > DRAFT_LIST_LIMITS.max) {
    throw new DraftCommandValidationError('Limite de liste invalide', 'limit');
  }
  return Object.freeze({ ...(cursor ? { cursor } : {}), limit });
}

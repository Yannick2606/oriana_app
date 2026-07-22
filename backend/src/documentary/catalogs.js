function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nestedValue of Object.values(value)) deepFreeze(nestedValue);
  }
  return value;
}

const MEGABYTE = 1_000_000;
const GIGABYTE = 1_000_000_000;

export const CAPTURE_TYPES = deepFreeze([
  'signal_terrain',
  'article_document',
  'carte_visite',
]);

export const VALID_ATTACHMENT_TARGETS = deepFreeze([
  'societe',
  'contact',
  'demande',
  'offre',
  'mandat',
]);

export const FILE_CATEGORIES = deepFreeze([
  'original_document',
  'photo_originale',
  'apercu',
]);

export const CAPTURE_STATES = deepFreeze([
  'brouillon_prive',
  'transfert',
  'traitement',
  'a_valider',
  'validee',
  'rejetee',
  'erreur',
  'archivee',
  'purge',
]);

export const FILE_STATES = deepFreeze([
  'initie',
  'transfert',
  'quarantaine',
  'disponible',
  'refuse',
  'archive',
  'purge',
]);

export const MALWARE_VERDICTS = deepFreeze([
  'sain',
  'infecte',
  'non_analysable',
  'erreur',
  'indisponible',
]);

export const DOCUMENT_FORMATS = deepFreeze([
  { code: 'pdf', extensions: ['.pdf'], mimeTypes: ['application/pdf'] },
  { code: 'xls', extensions: ['.xls'], mimeTypes: ['application/vnd.ms-excel'] },
  {
    code: 'xlsx',
    extensions: ['.xlsx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  { code: 'jpeg', extensions: ['.jpg', '.jpeg'], mimeTypes: ['image/jpeg'] },
  { code: 'png', extensions: ['.png'], mimeTypes: ['image/png'] },
  { code: 'webp', extensions: ['.webp'], mimeTypes: ['image/webp'] },
  { code: 'heic', extensions: ['.heic'], mimeTypes: ['image/heic'] },
]);

export const AUDIO_FORMATS = deepFreeze([
  { code: 'webm', extensions: ['.webm'], mimeTypes: ['audio/webm'] },
  { code: 'mp4', extensions: ['.mp4'], mimeTypes: ['audio/mp4'] },
]);

export const AUDIO_PROFILE = deepFreeze({
  maxBytes: 20 * MEGABYTE,
  maxDurationSeconds: 5 * 60,
});

export const CAPTURE_QUOTAS = deepFreeze({
  file: { maxBytes: 20 * MEGABYTE },
  capture: { maxFiles: 10, maxBytes: 100 * MEGABYTE },
  userPerDay: { maxFiles: 100, maxBytes: 2 * GIGABYTE },
  agencyPerDay: { maxFiles: 500, maxBytes: 10 * GIGABYTE },
  alertRatio: 0.8,
});

export const RETENTION_POLICIES = deepFreeze({
  transfert_incomplet: { mode: 'fixed', durationHours: 24 },
  quarantaine: { mode: 'fixed', durationHours: 7 * 24 },
  brouillon_prive: { mode: 'fixed', durationHours: 90 * 24 },
  capture_rejetee: { mode: 'fixed', durationHours: 30 * 24 },
  original_valide: { mode: 'parent_lifetime' },
  apercu_regenerable: { mode: 'fixed', durationHours: 30 * 24 },
});

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AUDIO_FORMATS,
  AUDIO_PROFILE,
  CAPTURE_QUOTAS,
  CAPTURE_STATES,
  CAPTURE_TYPES,
  DOCUMENT_FORMATS,
  FILE_CATEGORIES,
  FILE_STATES,
  MALWARE_VERDICTS,
  RETENTION_POLICIES,
  VALID_ATTACHMENT_TARGETS,
} from '../src/documentary/catalogs.js';

test('expose les catalogues fermés validés pour T-34A', () => {
  assert.deepEqual(CAPTURE_TYPES, ['signal_terrain', 'article_document', 'carte_visite']);
  assert.deepEqual(VALID_ATTACHMENT_TARGETS, [
    'societe', 'contact', 'demande', 'offre', 'mandat',
  ]);
  assert.deepEqual(FILE_CATEGORIES, ['original_document', 'photo_originale', 'apercu']);
  assert.deepEqual(MALWARE_VERDICTS, ['sain', 'infecte', 'non_analysable', 'erreur', 'indisponible']);

  for (const unimplementedTarget of ['territoire', 'opportunite', 'tache', 'idee_editoriale']) {
    assert.equal(VALID_ATTACHMENT_TARGETS.includes(unimplementedTarget), false);
  }
});

test('reprend les formats documentaires et audio validés sans élargissement implicite', () => {
  assert.deepEqual(DOCUMENT_FORMATS.map(({ code }) => code), [
    'pdf', 'xls', 'xlsx', 'jpeg', 'png', 'webp', 'heic',
  ]);
  assert.deepEqual(AUDIO_FORMATS.map(({ code }) => code), ['webm', 'mp4']);
  assert.equal(DOCUMENT_FORMATS.some(({ code }) => code === 'heif'), false);
  assert.equal(AUDIO_FORMATS.some(({ code }) => code === 'wav'), false);
});

test('reprend les limites DEC-018 et DEC-019 en octets', () => {
  assert.deepEqual(AUDIO_PROFILE, {
    maxBytes: 20_000_000,
    maxDurationSeconds: 300,
  });
  assert.deepEqual(CAPTURE_QUOTAS, {
    file: { maxBytes: 20_000_000 },
    capture: { maxFiles: 10, maxBytes: 100_000_000 },
    userPerDay: { maxFiles: 100, maxBytes: 2_000_000_000 },
    agencyPerDay: { maxFiles: 500, maxBytes: 10_000_000_000 },
    alertRatio: 0.8,
  });
});

test('reprend les cycles de vie et la conservation DEC-020', () => {
  assert.deepEqual(CAPTURE_STATES, [
    'brouillon_prive', 'transfert', 'traitement', 'a_valider', 'validee', 'rejetee',
    'erreur', 'archivee', 'purge',
  ]);
  assert.deepEqual(FILE_STATES, [
    'initie', 'transfert', 'quarantaine', 'disponible', 'refuse', 'archive', 'purge',
  ]);
  assert.equal(RETENTION_POLICIES.transfert_incomplet.durationHours, 24);
  assert.equal(RETENTION_POLICIES.quarantaine.durationHours, 7 * 24);
  assert.equal(RETENTION_POLICIES.brouillon_prive.durationHours, 90 * 24);
  assert.equal(RETENTION_POLICIES.capture_rejetee.durationHours, 30 * 24);
  assert.deepEqual(RETENTION_POLICIES.original_valide, { mode: 'parent_lifetime' });
  assert.equal(RETENTION_POLICIES.apercu_regenerable.durationHours, 30 * 24);
});

test('fige récursivement les catalogues et leurs valeurs imbriquées', () => {
  for (const catalog of [
    CAPTURE_TYPES,
    VALID_ATTACHMENT_TARGETS,
    FILE_CATEGORIES,
    CAPTURE_STATES,
    FILE_STATES,
    MALWARE_VERDICTS,
    DOCUMENT_FORMATS,
    AUDIO_FORMATS,
    AUDIO_PROFILE,
    CAPTURE_QUOTAS,
    RETENTION_POLICIES,
  ]) {
    assert.equal(Object.isFrozen(catalog), true);
  }

  assert.equal(Object.isFrozen(DOCUMENT_FORMATS[0]), true);
  assert.equal(Object.isFrozen(DOCUMENT_FORMATS[0].extensions), true);
  assert.equal(Object.isFrozen(CAPTURE_QUOTAS.capture), true);
  assert.equal(Object.isFrozen(RETENTION_POLICIES.quarantaine), true);
  assert.throws(() => DOCUMENT_FORMATS[0].extensions.push('.exe'), TypeError);
});

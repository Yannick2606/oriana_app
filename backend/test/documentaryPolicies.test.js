import assert from 'node:assert/strict';
import test from 'node:test';

import { DocumentaryError } from '../src/documentary/errors.js';
import {
  assertCaptureTransition,
  assertFileTransition,
  canAccessCapture,
  malwareVerdictAllowsProcessing,
  retentionDeadline,
  validateAttachmentTarget,
  validateFileDescriptor,
} from '../src/documentary/policies.js';

const MEGABYTE = 1_000_000;

test('valide conjointement extension, types MIME et taille des documents', () => {
  assert.deepEqual(validateFileDescriptor({
    extension: 'PDF',
    declaredMimeType: 'application/pdf; charset=binary',
    detectedMimeType: 'application/pdf',
    sizeBytes: 20 * MEGABYTE,
  }), {
    kind: 'document',
    format: 'pdf',
    extension: '.pdf',
    declaredMimeType: 'application/pdf',
    detectedMimeType: 'application/pdf',
    sizeBytes: 20 * MEGABYTE,
  });

  for (const descriptor of [
    { extension: '.pdf', declaredMimeType: 'application/pdf', detectedMimeType: 'image/png', sizeBytes: 1 },
    { extension: '.exe', declaredMimeType: 'application/pdf', detectedMimeType: 'application/pdf', sizeBytes: 1 },
    { extension: '.heif', declaredMimeType: 'image/heif', detectedMimeType: 'image/heif', sizeBytes: 1 },
  ]) {
    assert.throws(
      () => validateFileDescriptor(descriptor),
      (error) => error instanceof DocumentaryError && error.code === 'INVALID_DOCUMENT_TYPE',
    );
  }
});

test('refuse les tailles nulles, non entières ou supérieures à 20 Mo', () => {
  for (const sizeBytes of [0, 1.5, 20 * MEGABYTE + 1]) {
    assert.throws(
      () => validateFileDescriptor({
        extension: '.png',
        declaredMimeType: 'image/png',
        detectedMimeType: 'image/png',
        sizeBytes,
      }),
      (error) => error.code === 'INVALID_DOCUMENT_SIZE',
    );
  }
});

test('applique le profil audio DEC-018 sans accepter WAV', () => {
  const audio = validateFileDescriptor({
    kind: 'audio',
    extension: 'webm',
    declaredMimeType: 'audio/webm',
    detectedMimeType: 'audio/webm',
    sizeBytes: MEGABYTE,
    durationSeconds: 300,
  });
  assert.equal(audio.format, 'webm');

  assert.throws(() => validateFileDescriptor({
    kind: 'audio',
    extension: '.mp4',
    declaredMimeType: 'audio/mp4',
    detectedMimeType: 'audio/mp4',
    sizeBytes: MEGABYTE,
    durationSeconds: 301,
  }), (error) => error.code === 'INVALID_DOCUMENT_SIZE');

  assert.throws(() => validateFileDescriptor({
    kind: 'audio',
    extension: '.wav',
    declaredMimeType: 'audio/wav',
    detectedMimeType: 'audio/wav',
    sizeBytes: MEGABYTE,
    durationSeconds: 10,
  }), (error) => error.code === 'INVALID_DOCUMENT_TYPE');
});

test('autorise uniquement les cinq cibles DEC-021 et DEC-040', () => {
  for (const target of ['societe', 'contact', 'demande', 'offre', 'mandat']) {
    assert.equal(validateAttachmentTarget(target), target);
  }
  for (const target of ['client', 'opportunite', 'territoire', 'tache']) {
    assert.throws(
      () => validateAttachmentTarget(target),
      (error) => error.code === 'INVALID_ATTACHMENT_TARGET',
    );
  }
});

test('contrôle les transitions de Capture et Fichier', () => {
  assert.equal(assertCaptureTransition('brouillon_prive', 'transfert'), 'transfert');
  assert.equal(assertCaptureTransition('a_valider', 'validee'), 'validee');
  assert.equal(assertFileTransition('transfert', 'quarantaine'), 'quarantaine');
  assert.equal(assertFileTransition('quarantaine', 'disponible'), 'disponible');

  for (const transition of [
    () => assertCaptureTransition('brouillon_prive', 'validee'),
    () => assertCaptureTransition('purge', 'brouillon_prive'),
    () => assertFileTransition('initie', 'disponible'),
    () => assertFileTransition('purge', 'initie'),
  ]) {
    assert.throws(transition, (error) => error.code === 'INVALID_DOCUMENT_TRANSITION');
  }
});

test('seul le verdict sain ouvre le traitement suivant', () => {
  assert.equal(malwareVerdictAllowsProcessing('sain'), true);
  for (const verdict of ['infecte', 'non_analysable', 'erreur', 'indisponible', 'inconnu', null]) {
    assert.equal(malwareVerdictAllowsProcessing(verdict), false);
  }
});

test('calcule les échéances fixes et suspend la purge sous gel juridique', () => {
  const origin = new Date('2026-07-20T10:00:00.000Z');
  assert.equal(
    retentionDeadline({ retentionClass: 'transfert_incomplet', from: origin }).toISOString(),
    '2026-07-21T10:00:00.000Z',
  );
  assert.equal(
    retentionDeadline({ retentionClass: 'quarantaine', from: origin }).toISOString(),
    '2026-07-27T10:00:00.000Z',
  );
  assert.equal(retentionDeadline({ retentionClass: 'original_valide', from: origin }), null);
  assert.equal(retentionDeadline({
    retentionClass: 'quarantaine',
    from: origin,
    legalHold: true,
  }), null);
  assert.throws(
    () => retentionDeadline({ retentionClass: 'inconnue', from: origin }),
    /Politique de conservation inconnue/,
  );
});

test('réserve le brouillon privé à son auteur dans son agence', () => {
  const capture = { auteur_id: 7, agence_id: 3, etat: 'brouillon_prive' };
  assert.equal(canAccessCapture({
    actor: { id: 7, agence_id: 3, role_actif: 'consultant' }, capture, action: 'write',
  }), true);
  assert.equal(canAccessCapture({
    actor: { id: 7, agence_id: 3, role_actif: 'consultant' }, capture, action: 'delete',
  }), false);
  assert.equal(canAccessCapture({
    actor: { id: 8, agence_id: 3, role_actif: 'master_consultant' },
    capture,
    teamIds: [7],
  }), false);
  assert.equal(canAccessCapture({
    actor: { id: 9, agence_id: 3, role_actif: 'admin_agence' }, capture,
  }), false);
});

test('applique le périmètre soumis sans accès métier implicite du super admin', () => {
  const capture = { auteur_id: 7, agence_id: 3, etat: 'a_valider' };
  assert.equal(canAccessCapture({
    actor: { id: 7, agence_id: 3, role_actif: 'consultant' }, capture,
  }), true);
  assert.equal(canAccessCapture({
    actor: { id: 2, agence_id: 3, role_actif: 'master_consultant' }, capture, teamIds: [7],
  }), true);
  assert.equal(canAccessCapture({
    actor: { id: 2, agence_id: 3, role_actif: 'master_consultant' }, capture, action: 'validate', teamIds: [7],
  }), false);
  assert.equal(canAccessCapture({
    actor: { id: 9, agence_id: 3, role_actif: 'directeur_agence' }, capture, action: 'validate',
  }), true);
  assert.equal(canAccessCapture({
    actor: { id: 1, agence_id: 3, role_actif: 'super_admin' }, capture,
  }), false);
  assert.equal(canAccessCapture({
    actor: { id: 9, agence_id: 4, role_actif: 'admin_agence' }, capture,
  }), false);
});

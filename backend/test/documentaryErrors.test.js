import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DOCUMENTARY_ERROR_CODES,
  DocumentaryError,
} from '../src/documentary/errors.js';

test('expose uniquement les premiers codes documentaires stables', () => {
  assert.deepEqual(DOCUMENTARY_ERROR_CODES, {
    INVALID_DOCUMENT_TYPE: 'INVALID_DOCUMENT_TYPE',
    INVALID_DOCUMENT_SIZE: 'INVALID_DOCUMENT_SIZE',
    INVALID_ATTACHMENT_TARGET: 'INVALID_ATTACHMENT_TARGET',
    INVALID_DOCUMENT_TRANSITION: 'INVALID_DOCUMENT_TRANSITION',
    DOCUMENT_SCOPE_FORBIDDEN: 'DOCUMENT_SCOPE_FORBIDDEN',
    MALWARE_SCAN_REQUIRED: 'MALWARE_SCAN_REQUIRED',
    CAPTURE_VERSION_CONFLICT: 'CAPTURE_VERSION_CONFLICT',
  });
  assert.equal(Object.isFrozen(DOCUMENTARY_ERROR_CODES), true);
});
test('construit une erreur de domaine sans statut HTTP ni détail fournisseur', () => {
  const error = new DocumentaryError(
    'Analyse antivirus requise',
    DOCUMENTARY_ERROR_CODES.MALWARE_SCAN_REQUIRED,
  );

  assert.equal(error.name, 'DocumentaryError');
  assert.equal(error.message, 'Analyse antivirus requise');
  assert.equal(error.code, 'MALWARE_SCAN_REQUIRED');
  assert.equal('status' in error, false);
  assert.equal('details' in error, false);
});

test('refuse un code documentaire non catalogué', () => {
  assert.throws(
    () => new DocumentaryError('Erreur', 'PROVIDER_RAW_ERROR'),
    /Code d’erreur documentaire invalide/,
  );
});

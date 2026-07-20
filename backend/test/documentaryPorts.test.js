import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DOCUMENTARY_PORT_OPERATIONS,
  DocumentaryPortConfigurationError,
  assertDocumentaryPort,
  assertDocumentaryPorts,
} from '../src/documentary/ports.js';

function portDouble(port, omittedOperation) {
  return Object.fromEntries(
    DOCUMENTARY_PORT_OPERATIONS[port]
      .filter((operation) => operation !== omittedOperation)
      .map((operation) => [operation, async () => undefined]),
  );
}

test('décrit les six contrats de ports sans adaptateur', () => {
  assert.deepEqual(DOCUMENTARY_PORT_OPERATIONS, {
    captureRepository: [
      'createDraft', 'getById', 'updateWithExpectedVersion', 'transition', 'listExpired',
    ],
    fileRepository: [
      'createVersion', 'getById', 'listByCapture', 'recordMalwareVerdict', 'listExpired',
    ],
    objectStorage: ['putPrivate', 'openReadStream', 'deleteObject', 'listVersions'],
    malwareScanner: ['scanStream'],
    previewGenerator: ['generatePreview'],
    retentionExecutor: ['purge'],
  });
  assert.equal(Object.isFrozen(DOCUMENTARY_PORT_OPERATIONS), true);
  for (const methods of Object.values(DOCUMENTARY_PORT_OPERATIONS)) {
    assert.equal(Object.isFrozen(methods), true);
  }
});
test('accepte un double complet pour chaque port', () => {
  for (const port of Object.keys(DOCUMENTARY_PORT_OPERATIONS)) {
    const implementation = portDouble(port);
    assert.equal(assertDocumentaryPort(port, implementation), implementation);
  }
});

test('refuse chaque opération manquante avec une erreur de composition locale', () => {
  for (const [port, requiredOperations] of Object.entries(DOCUMENTARY_PORT_OPERATIONS)) {
    for (const omittedOperation of requiredOperations) {
      assert.throws(
        () => assertDocumentaryPort(port, portDouble(port, omittedOperation)),
        (error) => error instanceof DocumentaryPortConfigurationError
          && error.port === port
          && error.missingOperations.length === 1
          && error.missingOperations[0] === omittedOperation,
      );
    }
  }
});

test('refuse un port absent ou inconnu', () => {
  assert.throws(
    () => assertDocumentaryPort('objectStorage'),
    (error) => error instanceof DocumentaryPortConfigurationError
      && error.port === 'objectStorage'
      && error.missingOperations.length === 4,
  );
  assert.throws(
    () => assertDocumentaryPort('unknownProvider', {}),
    /Port documentaire inconnu/,
  );
});

test('valide une composition complète sans geler les adaptateurs injectés', () => {
  const implementations = Object.fromEntries(
    Object.keys(DOCUMENTARY_PORT_OPERATIONS).map((port) => [port, portDouble(port)]),
  );
  const validated = assertDocumentaryPorts(implementations);

  assert.equal(Object.isFrozen(validated), true);
  for (const port of Object.keys(DOCUMENTARY_PORT_OPERATIONS)) {
    assert.equal(validated[port], implementations[port]);
    assert.equal(Object.isFrozen(validated[port]), false);
  }
});

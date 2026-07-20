const operations = {
  captureRepository: [
    'createDraft',
    'getById',
    'updateWithExpectedVersion',
    'transition',
    'listExpired',
  ],
  fileRepository: [
    'createVersion',
    'getById',
    'listByCapture',
    'recordMalwareVerdict',
    'listExpired',
  ],
  objectStorage: [
    'putPrivate',
    'openReadStream',
    'deleteObject',
    'listVersions',
  ],
  malwareScanner: ['scanStream'],
  previewGenerator: ['generatePreview'],
  retentionExecutor: ['purge'],
};

for (const methods of Object.values(operations)) Object.freeze(methods);
export const DOCUMENTARY_PORT_OPERATIONS = Object.freeze(operations);

export class DocumentaryPortConfigurationError extends Error {
  constructor(port, missingOperations) {
    super(`Port documentaire incomplet : ${port}`);
    this.name = 'DocumentaryPortConfigurationError';
    this.port = port;
    this.missingOperations = Object.freeze([...missingOperations]);
  }
}
export function assertDocumentaryPort(port, implementation) {
  const requiredOperations = DOCUMENTARY_PORT_OPERATIONS[port];
  if (!requiredOperations) throw new TypeError(`Port documentaire inconnu : ${port}`);

  const missingOperations = requiredOperations.filter(
    (operation) => typeof implementation?.[operation] !== 'function',
  );
  if (missingOperations.length > 0) {
    throw new DocumentaryPortConfigurationError(port, missingOperations);
  }
  return implementation;
}

export function assertDocumentaryPorts(implementations = {}) {
  const validated = {};
  for (const port of Object.keys(DOCUMENTARY_PORT_OPERATIONS)) {
    validated[port] = assertDocumentaryPort(port, implementations[port]);
  }
  return Object.freeze(validated);
}

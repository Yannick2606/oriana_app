export const DOCUMENTARY_ERROR_CODES = Object.freeze({
  INVALID_DOCUMENT_TYPE: 'INVALID_DOCUMENT_TYPE',
  INVALID_DOCUMENT_SIZE: 'INVALID_DOCUMENT_SIZE',
  INVALID_ATTACHMENT_TARGET: 'INVALID_ATTACHMENT_TARGET',
  INVALID_DOCUMENT_TRANSITION: 'INVALID_DOCUMENT_TRANSITION',
  DOCUMENT_SCOPE_FORBIDDEN: 'DOCUMENT_SCOPE_FORBIDDEN',
  MALWARE_SCAN_REQUIRED: 'MALWARE_SCAN_REQUIRED',
  CAPTURE_VERSION_CONFLICT: 'CAPTURE_VERSION_CONFLICT',
});

const acceptedCodes = new Set(Object.values(DOCUMENTARY_ERROR_CODES));

export class DocumentaryError extends Error {
  constructor(message, code) {
    if (!acceptedCodes.has(code)) throw new TypeError('Code d’erreur documentaire invalide');
    super(message);
    this.name = 'DocumentaryError';
    this.code = code;
  }
}

export class N8nConnectorError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'N8nConnectorError';
    this.code = code;
  }
}

export function createN8nConnector({
  webhookBaseUrl,
  sharedSecret,
  backendPublicUrl,
  fetchImplementation = fetch,
  timeoutMs = 5_000,
} = {}) {
  function ensureConfigured() {
    if (!webhookBaseUrl || !sharedSecret || !backendPublicUrl) {
      throw new N8nConnectorError('Configuration n8n incomplète', 'ORCHESTRATION_NOT_CONFIGURED');
    }
  }

  return {
    ensureConfigured,
    async trigger({ agent, trackingId, objectType, objectId, agencyId, userId }) {
      ensureConfigured();
      const url = `${webhookBaseUrl.replace(/\/$/, '')}/webhook/oriana-${agent}`;
      let response;
      try {
        response = await fetchImplementation(url, {
          method: 'POST',
          signal: globalThis.AbortSignal.timeout(timeoutMs),
          headers: { 'Content-Type': 'application/json', 'X-Oriana-Secret': sharedSecret },
          body: JSON.stringify({
            suivi_id: trackingId,
            objet_type: objectType,
            objet_id: objectId,
            agence_id: agencyId,
            user_id: userId,
            callback_url: `${backendPublicUrl.replace(/\/$/, '')}/agents/callback`,
          }),
        });
      } catch {
        throw new N8nConnectorError('Webhook indisponible', 'ORCHESTRATION_UNAVAILABLE');
      }
      if (!response.ok) {
        throw new N8nConnectorError('Webhook refusé', 'ORCHESTRATION_REJECTED');
      }
    },
  };
}

import { randomUUID } from 'node:crypto';
import { peutLire } from './exclusiviteService.js';
import { canManageAgencyData } from './roleModel.js';

const allowedStatuses = new Set(['en_cours', 'termine', 'erreur']);
export class AgentsError extends Error {
  constructor(message, status, code) { super(message); this.name = 'AgentsError'; this.status = status; this.code = code; }
}
const positiveId = (value) => {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0 || String(id) !== String(value)) throw new AgentsError('Objet invalide', 400, 'INVALID_OBJECT');
  return id;
};
const serializeResult = (value) => (typeof value === 'string' ? value : JSON.stringify(value ?? null));

export function createAgentsService(client, orchestrator) {
  async function readableDemand(id, user) {
    const demand = await client.getById('Demandes', id);
    if (!demand) throw new AgentsError('Demande introuvable', 404, 'NOT_FOUND');
    if (!peutLire(demand, user)) throw new AgentsError('Demande hors périmètre', 403, 'FORBIDDEN');
    return demand;
  }
  async function reread(created, trackingId) {
    if (created?.fields) return created;
    const [record] = await client.list('Traitements_Agents', { suivi_id: [trackingId] });
    if (!record) throw new AgentsError('Suivi non relu', 502, 'GRIST_READBACK_FAILED');
    return record;
  }
  return {
    async trigger(agent, input, user) {
      if (agent !== 'demonstration') throw new AgentsError('Agent inconnu', 404, 'UNKNOWN_AGENT');
      if (!input || input.objet_type !== 'demande') throw new AgentsError('Type objet invalide', 400, 'INVALID_OBJECT');
      const objectId = positiveId(input.objet_id); await readableDemand(objectId, user);
      try {
        orchestrator?.ensureConfigured();
      } catch {
        throw new AgentsError('Configuration n8n incomplète', 503, 'N8N_NOT_CONFIGURED');
      }
      if (!orchestrator?.trigger) throw new AgentsError('Configuration n8n incomplète', 503, 'N8N_NOT_CONFIGURED');
      const trackingId = randomUUID(); const now = Date.now() / 1000;
      await reread(await client.create('Traitements_Agents', {
        suivi_id: trackingId, agent, objet_type: 'demande', objet_id: objectId,
        statut_traitement: 'en_attente', agence_id: user.agence_id, user_id: user.id,
        date_creation: now, date_mise_a_jour: now,
      }), trackingId);
      try {
        await orchestrator.trigger({
          agent,
          trackingId,
          objectType: 'demande',
          objectId,
          agencyId: user.agence_id,
          userId: user.id,
        });
      } catch (error) {
        const rejected = error?.code === 'ORCHESTRATION_REJECTED';
        await this.callback({
          suivi_id: trackingId,
          statut: 'erreur',
          message_erreur: rejected ? 'WEBHOOK_REJECTED' : 'WEBHOOK_UNAVAILABLE',
        });
        throw new AgentsError(
          rejected ? 'Webhook refusé' : 'Webhook indisponible',
          502,
          rejected ? 'N8N_REJECTED' : 'N8N_UNAVAILABLE',
        );
      }
      return { suivi_id: trackingId, statut_traitement: 'en_attente' };
    },
    async status(input, user) {
      if (input.objet_type !== 'demande') throw new AgentsError('Type objet invalide', 400, 'INVALID_OBJECT');
      const objectId = positiveId(input.objet_id); await readableDemand(objectId, user);
      const rows = await client.list('Traitements_Agents', { objet_type: ['demande'], objet_id: [objectId], agence_id: [user.agence_id] });
      const visible = rows.filter((row) => canManageAgencyData(user.role_actif)
        || String(row.fields.user_id) === String(user.id)
        || user.equipe_ids?.some((id) => String(row.fields.user_id) === String(id)));
      visible.sort((a, b) => (b.fields.date_creation ?? 0) - (a.fields.date_creation ?? 0));
      if (!visible[0]) throw new AgentsError('Suivi introuvable', 404, 'NOT_FOUND');
      return visible[0];
    },
    async callback(input) {
      if (!input || typeof input.suivi_id !== 'string' || !allowedStatuses.has(input.statut)) throw new AgentsError('Callback invalide', 400, 'INVALID_CALLBACK');
      const [record] = await client.list('Traitements_Agents', { suivi_id: [input.suivi_id] });
      if (!record) throw new AgentsError('Suivi introuvable', 404, 'NOT_FOUND');
      const data = { statut_traitement: input.statut, date_mise_a_jour: Date.now() / 1000 };
      if (input.statut === 'termine') data.resultat = serializeResult(input.resultat);
      if (input.statut === 'erreur') data.message_erreur = String(input.message_erreur ?? 'ERREUR_AGENT');
      return client.update('Traitements_Agents', record.id, data);
    },
  };
}

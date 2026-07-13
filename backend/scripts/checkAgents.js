import { randomBytes } from 'node:crypto';
import { gristClient } from '../src/services/gristClient.js';
import { createAgentsService } from '../src/services/agentsService.js';

let trackingId;
try {
  const [demandes, utilisateurs] = await Promise.all([
    gristClient.list('Demandes'), gristClient.list('Utilisateurs', { actif: [true] }),
  ]);
  const demande = demandes.find((item) => utilisateurs.some(
    (user) => String(user.fields.agence_id) === String(item.fields.agence_id),
  ));
  const utilisateur = utilisateurs.find(
    (user) => String(user.fields.agence_id) === String(demande?.fields.agence_id),
  );
  if (!demande || !utilisateur) throw new Error('Une demande et un utilisateur actif de la même agence sont requis.');
  const user = { id: utilisateur.id, agence_id: demande.fields.agence_id, role_actif: 'manager' };
  let webhookCalled = false;
  const service = createAgentsService(gristClient, {
    webhookBaseUrl: 'https://n8n.example.invalid', sharedSecret: randomBytes(24).toString('hex'),
    backendPublicUrl: 'https://api.example.invalid',
    fetchImplementation: async () => { webhookCalled = true; return { ok: true }; },
  });
  const triggered = await service.trigger('demonstration', { objet_type: 'demande', objet_id: demande.id }, user);
  trackingId = triggered.suivi_id;
  if (!webhookCalled || triggered.statut_traitement !== 'en_attente') throw new Error('Déclenchement asynchrone invalide.');
  await service.callback({ suivi_id: trackingId, statut: 'termine', resultat: { demonstration: 'ok' } });
  const status = await service.status({ objet_type: 'demande', objet_id: String(demande.id) }, user);
  if (status.fields.statut_traitement !== 'termine' || !status.fields.resultat?.includes('demonstration')) {
    throw new Error('Résultat agent non relu.');
  }
  console.log('Cycle agent réel en Grist validé : en_attente → termine → résultat.');
} finally {
  if (trackingId) {
    const rows = await gristClient.list('Traitements_Agents', { suivi_id: [trackingId] });
    for (const row of rows) await gristClient.delete('Traitements_Agents', row.id);
  }
}

import { gristClient } from '../src/services/gristClient.js';
import { createAgentsService } from '../src/services/agentsService.js';

const sleep = (milliseconds) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));

function normalizeRoles(value) {
  if (Array.isArray(value)) return value.filter((role) => role !== 'L' && typeof role === 'string');
  return typeof value === 'string' && value ? [value] : [];
}

function findScenario(demandes, utilisateurs) {
  const preferredRoles = ['manager', 'admin', 'consultant'];

  for (const role of preferredRoles) {
    for (const utilisateur of utilisateurs) {
      const roles = normalizeRoles(utilisateur.fields.roles ?? utilisateur.fields.role);
      if (!roles.includes(role)) continue;

      const demande = demandes.find((item) => (
        String(item.fields.agence_id) === String(utilisateur.fields.agence_id)
        && (role !== 'consultant'
          || String(item.fields.gestionnaire ?? item.fields.consultant_responsable_id)
            === String(utilisateur.id))
      ));

      if (demande) {
        return {
          demande,
          user: {
            id: utilisateur.id,
            agence_id: utilisateur.fields.agence_id,
            role_actif: role,
          },
        };
      }
    }
  }

  throw new Error('Aucune demande lisible et aucun utilisateur actif compatible pour le contrôle n8n.');
}

let trackingId;
try {
  const [demandes, utilisateurs] = await Promise.all([
    gristClient.list('Demandes'),
    gristClient.list('Utilisateurs', { actif: [true] }),
  ]);
  const { demande, user } = findScenario(demandes, utilisateurs);
  const service = createAgentsService(gristClient);
  const triggered = await service.trigger(
    'demonstration',
    { objet_type: 'demande', objet_id: demande.id },
    user,
  );
  trackingId = triggered.suivi_id;

  let treatment;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const rows = await gristClient.list('Traitements_Agents', { suivi_id: [trackingId] });
    [treatment] = rows;
    if (['termine', 'erreur'].includes(treatment?.fields?.statut_traitement)) break;
    await sleep(500);
  }

  if (treatment?.fields?.statut_traitement !== 'termine') {
    throw new Error(`Le callback n8n n'a pas terminé le traitement (${treatment?.fields?.statut_traitement ?? 'absent'}).`);
  }
  if (!treatment.fields.resultat?.includes('Agent de démonstration exécuté')) {
    throw new Error('Le résultat attendu du workflow n8n est absent.');
  }

  console.log('Cycle n8n réel validé : en_attente → termine → résultat.');
} finally {
  if (trackingId) {
    const rows = await gristClient.list('Traitements_Agents', { suivi_id: [trackingId] });
    for (const row of rows) await gristClient.delete('Traitements_Agents', row.id);
  }
}

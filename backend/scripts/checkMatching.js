import { gristClient } from '../src/services/gristClient.js';
import { createMatchingService } from '../src/services/matchingService.js';

const [demandes, utilisateurs] = await Promise.all([
  gristClient.list('Demandes'), gristClient.list('Utilisateurs', { actif: [true] }),
]);
const demande = demandes.find((item) => utilisateurs.some(
  (user) => String(user.fields.agence_id) === String(item.fields.agence_id),
));
if (!demande) throw new Error('Une demande rattachée à une agence active est requise.');
const utilisateur = utilisateurs.find(
  (user) => String(user.fields.agence_id) === String(demande.fields.agence_id),
);
const user = { id: utilisateur.id, agence_id: demande.fields.agence_id, role_actif: 'manager' };
const service = createMatchingService(gristClient);
const matches = await service.list(demande.id, user, { agence_id: user.agence_id });
for (let index = 1; index < matches.length; index += 1) {
  const previous = matches[index - 1].fields.score_global;
  const current = matches[index].fields.score_global;
  if (Number.isFinite(previous) && Number.isFinite(current) && previous < current) {
    throw new Error('Les scores ne sont pas triés par ordre décroissant.');
  }
}
console.log(`Matching réel lu et trié : ${matches.length} résultat(s).`);

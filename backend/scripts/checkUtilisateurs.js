import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { gristClient } from '../src/services/gristClient.js';
import { createUtilisateursService } from '../src/services/utilisateursService.js';

let created;
let temporaryEmail;
try {
  const staleTests = await gristClient.list('Utilisateurs', { nom: ['TEST-T11'] });
  for (const record of staleTests) await gristClient.delete('Utilisateurs', record.id);
  const [agency] = await gristClient.list('Agences');
  if (!agency) throw new Error('Une agence est requise.');
  const suffix = Date.now().toString(36); const password = randomBytes(18).toString('hex');
  const service = createUtilisateursService(gristClient);
  const adminAgence = { id: 0, role_actif: 'admin_agence', agence_id: agency.id };
  temporaryEmail = `test-t11-${suffix}@example.invalid`;
  const publicUser = await service.create({
    nom: 'TEST-T11', prenom: suffix, email: temporaryEmail,
    roles: ['consultant', 'manager'], agence_id: agency.id, actif: true, mot_de_passe: password,
  }, adminAgence);
  created = publicUser.id;
  const stored = await gristClient.getById('Utilisateurs', created);
  if (!stored?.fields.mot_de_passe_hash || !(await bcrypt.compare(password, stored.fields.mot_de_passe_hash))) {
    throw new Error('Le mot de passe bcrypt n’est pas vérifiable.');
  }
  if (stored.fields.doit_changer_mot_de_passe !== true) {
    throw new Error('Le changement de mot de passe initial doit être obligatoire.');
  }
  const resetPassword = randomBytes(18).toString('hex');
  await service.resetPassword(created, resetPassword, adminAgence);
  const resetStored = await gristClient.getById('Utilisateurs', created);
  if (resetStored.fields.doit_changer_mot_de_passe !== true
    || !(await bcrypt.compare(resetPassword, resetStored.fields.mot_de_passe_hash))) {
    throw new Error('La réinitialisation administrateur est invalide.');
  }
  if ('mot_de_passe_hash' in publicUser) throw new Error('Le hash a été exposé.');
  const disabled = await service.update(created, { actif: false }, adminAgence);
  if (disabled.actif !== false || 'mot_de_passe_hash' in disabled) throw new Error('Désactivation ou réponse invalide.');
  console.log('Utilisateur réel créé avec hash bcrypt, désactivé et relu sans exposition du hash.');
} finally {
  if (created) {
    await gristClient.delete('Utilisateurs', created);
  } else if (temporaryEmail) {
    const leftovers = await gristClient.list('Utilisateurs', { email: [temporaryEmail] });
    for (const record of leftovers) await gristClient.delete('Utilisateurs', record.id);
  }
}

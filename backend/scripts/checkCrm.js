import { gristClient } from '../src/services/gristClient.js';
import { createCrmService } from '../src/services/crmService.js';

const created = [];
try {
  const [agency] = await gristClient.list('Agences');
  const users = await gristClient.list('Utilisateurs', { actif: [true] });
  const userRecord = users.find((item) => String(item.fields.agence_id) === String(agency?.id));
  if (!agency || !userRecord) throw new Error('Agence avec utilisateur actif requise.');
  const user = { id: userRecord.id, agence_id: agency.id, role_actif: 'consultant' };
  const service = createCrmService(gristClient); const suffix = Date.now().toString(36);
  const company = await service.create('societes', { raison_sociale: `TEST-T09-${suffix}`, type_relation: 'prospect' }, user);
  created.push({ table: 'Societes', id: company.id });
  const contact = await service.create('contacts', { nom: `TEST-T09-${suffix}`, societe_id: company.id }, user);
  created.push({ table: 'Contacts', id: contact.id });
  await service.update('societes', company.id, { contact_principal: contact.id }, user);
  const request = await service.create('demandes', {
    societe_id: company.id, contact_id: contact.id, nature_transaction: 'location',
    surface_min: 500, surface_max: 2_000, budget_max: 100_000_000,
  }, user);
  created.push({ table: 'Demandes', id: request.id });
  await service.update('societes', company.id, { donnee_exclusive: false }, user);
  const reread = await service.get('demandes', request.id, user);
  if (reread.fields.contact_id !== contact.id || reread.fields.donnee_exclusive !== true) throw new Error('Relations ou exclusivité non relues.');
  console.log('CRM réel créé, lié, partagé et relu.');
} finally {
  for (const record of created.reverse()) await gristClient.delete(record.table, record.id);
}

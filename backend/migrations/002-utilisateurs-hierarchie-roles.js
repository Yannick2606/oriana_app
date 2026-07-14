import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { gristClient } from '../src/services/gristClient.js';
import { normalizeRoleNames } from '../src/services/roleModel.js';

const columns = await gristClient.listColumns('Utilisateurs');
const snapshot = columns.map((column) => ({ id: column.id, type: column.fields?.type, isFormula: column.fields?.isFormula === true }));
const backupPath = resolve(process.env.GRIST_ROLES_SCHEMA_BACKUP_PATH || 'tmp/grist-utilisateurs-roles-schema-before.json');
await mkdir(dirname(backupPath), { recursive: true });
await writeFile(backupPath, `${JSON.stringify({ table: 'Utilisateurs', columns: snapshot }, null, 2)}\n`, { mode: 0o600 });
await gristClient.addOrUpdateColumns('Utilisateurs', [{ id: 'master_consultant_id', fields: { type: 'Ref:Utilisateurs' } }]);

const users = await gristClient.list('Utilisateurs');
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
if (superAdminEmail && !users.some((user) => String(user.fields.email).toLowerCase() === superAdminEmail)) throw new Error('SUPER_ADMIN_EMAIL ne correspond à aucun utilisateur.');
for (const user of users) {
  const stored = user.fields.role ?? user.fields.roles;
  const roles = normalizeRoleNames(stored);
  if (superAdminEmail && String(user.fields.email).toLowerCase() === superAdminEmail && !roles.includes('super_admin')) roles.push('super_admin');
  const next = ['L', ...roles];
  if (JSON.stringify(stored) !== JSON.stringify(next)) await gristClient.update('Utilisateurs', user.id, { role: next });
}
console.log('Migration 002 vérifiée : rôles et rattachement hiérarchique prêts.');

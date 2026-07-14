import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { gristClient } from '../src/services/gristClient.js';

const columns = await gristClient.listColumns('Utilisateurs');
const snapshot = columns.map((column) => ({ id: column.id, type: column.fields?.type, isFormula: column.fields?.isFormula === true }));
const backupPath = resolve(process.env.GRIST_RESET_SCHEMA_BACKUP_PATH || 'tmp/grist-utilisateurs-reset-schema-before.json');
await mkdir(dirname(backupPath), { recursive: true });
await writeFile(backupPath, `${JSON.stringify({ table: 'Utilisateurs', columns: snapshot }, null, 2)}\n`, { mode: 0o600 });
await gristClient.addOrUpdateColumns('Utilisateurs', [
  { id: 'reset_mot_de_passe_hash', fields: { type: 'Text' } },
  { id: 'reset_mot_de_passe_expiration', fields: { type: 'Text' } },
]);
console.log('Migration 004 vérifiée : réinitialisation de mot de passe prête.');

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { gristClient } from '../src/services/gristClient.js';

const columns = await gristClient.listColumns('Utilisateurs');
const snapshot = columns.map((column) => ({ id: column.id, type: column.fields?.type, isFormula: column.fields?.isFormula === true }));
const backupPath = resolve(process.env.GRIST_FORMATION_SCHEMA_BACKUP_PATH || 'tmp/grist-utilisateurs-formation-schema-before.json');
await mkdir(dirname(backupPath), { recursive: true });
await writeFile(backupPath, `${JSON.stringify({ table: 'Utilisateurs', columns: snapshot }, null, 2)}\n`, { mode: 0o600 });
await gristClient.addOrUpdateColumns('Utilisateurs', [{ id: 'progression_formation', fields: { type: 'Text' } }]);
console.log('Migration 003 vérifiée : progression Auto-formation prête.');

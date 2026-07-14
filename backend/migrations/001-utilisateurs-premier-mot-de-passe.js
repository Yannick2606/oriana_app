import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { gristClient } from '../src/services/gristClient.js';

const tables = await gristClient.listTables();
if (!tables.some((table) => table.id === 'Utilisateurs')) {
  throw new Error('Table Grist Utilisateurs manquante.');
}

const columns = await gristClient.listColumns('Utilisateurs');
const snapshot = columns.map((column) => ({
  id: column.id,
  type: column.fields?.type,
  isFormula: column.fields?.isFormula === true,
}));
const backupPath = resolve(process.env.GRIST_SCHEMA_BACKUP_PATH || 'tmp/grist-utilisateurs-schema-before.json');
await mkdir(dirname(backupPath), { recursive: true });
await writeFile(backupPath, `${JSON.stringify({ table: 'Utilisateurs', columns: snapshot }, null, 2)}\n`, { mode: 0o600 });

await gristClient.addOrUpdateColumns('Utilisateurs', [{
  id: 'doit_changer_mot_de_passe',
  fields: { type: 'Bool' },
}]);

console.log('Migration 001 vérifiée ; sauvegarde de structure créée avant migration.');

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { gristClient } from '../src/services/gristClient.js';

const outputPath = resolve(process.env.GRIST_AUDIT_PATH || 'tmp/grist-audit.json');
const tables = await gristClient.listTables();
const audit = [];

for (const table of tables) {
  const [columns, records] = await Promise.all([
    gristClient.listColumns(table.id),
    gristClient.list(table.id),
  ]);
  audit.push({
    table: table.id,
    record_count: records.length,
    columns: columns.map((column) => ({
      id: column.id,
      type: column.fields?.type ?? null,
      is_formula: column.fields?.isFormula === true,
      formula: column.fields?.formula || null,
    })),
  });
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ generated_at: new Date().toISOString(), tables: audit }, null, 2)}\n`, { mode: 0o600 });
console.log(`Audit Grist produit : ${audit.length} table(s), métadonnées et volumes uniquement.`);

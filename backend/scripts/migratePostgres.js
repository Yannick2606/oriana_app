import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createPostgresPool } from '../src/services/postgres.js';

const directory = resolve('sql');
const pool = createPostgresPool();
const client = await pool.connect();

try {
  await client.query('BEGIN');
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const applied = new Set((await client.query('SELECT filename FROM schema_migrations')).rows.map((row) => row.filename));
  const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
  for (const filename of files) {
    if (applied.has(filename)) continue;
    await client.query(await readFile(resolve(directory, filename), 'utf8'));
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    console.log(`Migration PostgreSQL appliquée : ${filename}`);
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}

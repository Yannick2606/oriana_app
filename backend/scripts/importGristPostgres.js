import 'dotenv/config';
import { gristClient } from '../src/services/gristClient.js';
import { readGristSnapshot, importSnapshot } from '../src/services/gristPostgresImport.js';
import { createPostgresPool } from '../src/services/postgres.js';

const pool = createPostgresPool();
try {
  const result = await importSnapshot(pool, await readGristSnapshot(gristClient));
  console.log(JSON.stringify({ volumes: result.counts, volumes_cibles: result.targetCounts, rejets: result.rejections, importe: result.imported }, null, 2));
  if (!result.imported) process.exitCode = 1;
} finally { await pool.end(); }

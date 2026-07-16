import 'dotenv/config';
import { gristClient } from '../src/services/gristClient.js';
import { readGristSnapshot, validateSnapshot } from '../src/services/gristPostgresImport.js';

const result = validateSnapshot(await readGristSnapshot(gristClient));
console.log(JSON.stringify({ volumes: result.counts, rejets: result.rejections }, null, 2));
if (result.rejections.length) process.exitCode = 1;

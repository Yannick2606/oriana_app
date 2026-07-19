import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

import { createSandboxData } from '../src/sandbox/createSandboxData.js';

const outputUrl = new URL('../fixtures/sandbox/data.json', import.meta.url);
const outputPath = fileURLToPath(outputUrl);

await mkdir(new URL('../fixtures/sandbox/', import.meta.url), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(createSandboxData(), null, 2)}\n`, 'utf8');
console.log(`Jeu de démonstration régénéré : ${outputPath}`);

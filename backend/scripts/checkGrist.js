import { gristClient } from '../src/services/gristClient.js';

try {
  const agences = await gristClient.list('Agences');
  console.log(`Lecture Grist réussie : ${agences.length} agence(s).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Erreur Grist inattendue');
  process.exitCode = 1;
}

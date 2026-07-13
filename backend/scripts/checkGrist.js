import { gristClient } from '../src/services/gristClient.js';

try {
  const agences = await gristClient.list('Agences');
  console.log(`Lecture Grist réussie : ${agences.length} agence(s).`);
} catch (error) {
  if (error instanceof Error && error.message === 'fetch failed') {
    const causeCode = typeof error.cause?.code === 'string' ? error.cause.code : 'INCONNUE';
    console.error(`Connexion Grist impossible (${causeCode}).`);
  } else {
    console.error(error instanceof Error ? error.message : 'Erreur Grist inattendue');
  }
  process.exitCode = 1;
}

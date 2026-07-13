import { gristClient } from '../src/services/gristClient.js';

const columns = [
  ['suivi_id', 'Text'], ['agent', 'Text'], ['objet_type', 'Text'], ['objet_id', 'Int'],
  ['statut_traitement', 'Choice'], ['resultat', 'Text'], ['message_erreur', 'Text'],
  ['agence_id', 'Ref:Agences'], ['user_id', 'Ref:Utilisateurs'], ['date_creation', 'DateTime'],
  ['date_mise_a_jour', 'DateTime'],
].map(([id, type]) => ({ id, fields: { type } }));
const ids = new Set((await gristClient.listTables()).map((table) => table.id));
const missing = ['Agences', 'Utilisateurs'].filter((table) => !ids.has(table));
if (missing.length) throw new Error(`Tables Grist préalables manquantes : ${missing.join(', ')}`);
if (!ids.has('Traitements_Agents')) await gristClient.createTables([{ id: 'Traitements_Agents', columns }]);
await gristClient.addOrUpdateColumns('Traitements_Agents', columns);
console.log('Schéma Traitements_Agents vérifié.');

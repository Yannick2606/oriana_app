import { api } from './client';
export const agentsApi={listDemandes:()=>api.get('/demandes'),trigger:(id)=>api.post('/agents/demonstration/declencher',{objet_type:'demande',objet_id:id}),status:(id)=>api.get(`/agents/statut?objet_type=demande&objet_id=${encodeURIComponent(id)}`)};

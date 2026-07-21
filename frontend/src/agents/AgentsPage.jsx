import { useEffect, useRef, useState } from 'react';
import { Bot, Play, Sparkles } from 'lucide-react';
import { agentsApi } from '../api/agents';
import { Badge, Breadcrumb, Button, Card, EmptyState, Loader, Notification, PageHeader, Select } from '../components/ui';

export function AgentsPage({ pollInterval = 2000, readOnly = false }) {
  const [demandes, setDemandes] = useState([]);
  const [id, setId] = useState('');
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!readOnly);
  const timer = useRef();

  useEffect(() => {
    if (readOnly) {
      clearTimeout(timer.current);
      return undefined;
    }
    let active = true;
    agentsApi.listDemandes()
      .then((response) => {
        if (active) {
          setDemandes(response.data);
          setId(String(response.data[0]?.id || ''));
        }
      })
      .catch(() => active && setError('Les demandes n’ont pas pu être chargées.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      clearTimeout(timer.current);
    };
  }, [readOnly]);

  async function check(demandeId) {
    try {
      const response = await agentsApi.status(demandeId);
      setTracking(response.data);
      if (['en_attente', 'en_cours'].includes(response.data.statut_traitement)) {
        timer.current = setTimeout(() => check(demandeId), pollInterval);
      }
    } catch {
      setError('Le suivi de l’agent a échoué.');
    }
  }

  async function trigger() {
    setError('');
    setTracking({ statut_traitement: 'en_attente' });
    try {
      const response = await agentsApi.trigger(Number(id));
      setTracking(response);
      timer.current = setTimeout(() => check(Number(id)), pollInterval);
    } catch {
      setTracking(null);
      setError('L’agent n’a pas pu être déclenché.');
    }
  }

  const status = tracking?.statut_traitement;
  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil', 'Agents IA']}/>
    <PageHeader eyebrow="Automatisation supervisée" title="Agents IA" description="Lancez un traitement asynchrone sur une demande et poursuivez votre navigation pendant son exécution."/>
    {readOnly ? <EmptyState title="Agents IA indisponibles dans la prévisualisation" description="Aucun connecteur n’est configuré et aucun traitement n’est simulé."/> : <>
      {error && <Notification title="Action impossible" description={error}/>}
      {loading ? <Loader/> : demandes.length === 0 ? <EmptyState title="Aucune demande disponible" description="Créez d’abord une demande CRM."/> : <Card><div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end"><label className="grid gap-2 text-sm font-semibold">Demande<Select value={id} onChange={(event) => setId(event.target.value)} disabled={Boolean(status && ['en_attente', 'en_cours'].includes(status))}>{demandes.map((demande) => <option key={demande.id} value={demande.id}>{demande.secteur_geo || `Demande #${demande.id}`} · {demande.nature_transaction}</option>)}</Select></label><Button onClick={trigger} disabled={!id || ['en_attente', 'en_cours'].includes(status)}><Play size={16}/>Déclencher l’agent</Button></div></Card>}
      {tracking && <Card><div className="flex items-start gap-4"><span className="rounded-full bg-oriana-violet/15 p-3 text-oriana-lavande"><Bot/></span><div className="flex-1"><Badge variant="accent">{status === 'termine' ? 'Terminé' : status === 'erreur' ? 'Erreur' : 'Traitement en cours'}</Badge><h2 className="mt-3 font-titre text-2xl">Agent de démonstration</h2>{['en_attente', 'en_cours'].includes(status) && <div className="mt-4"><Loader label="Analyse en cours… Vous pouvez continuer à utiliser l’application."/></div>}{status === 'termine' && <div className="mt-4 rounded-oriana bg-oriana-surfaceAlt p-4"><p className="flex items-center gap-2 font-semibold"><Sparkles size={16}/>Résultat</p><pre className="mt-3 whitespace-pre-wrap text-sm text-oriana-discret">{tracking.resultat}</pre></div>}{status === 'erreur' && <p className="mt-4 text-sm text-oriana-lavandeClair">{tracking.message_erreur || 'Le traitement a échoué.'}</p>}</div></div></Card>}
    </>}
  </div>;
}

import { useEffect, useState } from 'react';
import { BookOpen, RotateCcw } from 'lucide-react';
import { Breadcrumb, Button, Card, PageHeader, Modal } from '../components/ui';
import { formationApi } from '../api/formation';
import { parcoursParRole } from './parcours';

export function FormationExperience({ user, pageVisible, client = formationApi }) {
  const steps = parcoursParRole[user.role_actif] || [];
  const [progress, setProgress] = useState(null); const [open, setOpen] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    client.get().then(({ data }) => { if (!active) return; setProgress(data.progression); setOpen(data.progression.statut === 'a_faire'); }).catch(() => { if (active) setError('Progression indisponible.'); });
    return () => { active = false; };
  }, [client, user.role_actif]);
  async function save(next) { try { setError(''); const { data } = await client.update(next); setProgress(data.progression); } catch { setError('La progression n’a pas pu être enregistrée.'); } }
  async function next() { const index = progress?.etape ?? 0; if (index >= steps.length - 1) { await save({ etape: steps.length, statut: 'termine' }); setOpen(false); } else await save({ etape: index + 1, statut: 'en_cours' }); }
  async function skip() { await save({ etape: progress?.etape ?? 0, statut: 'passe' }); setOpen(false); }
  async function restart() { await save({ etape: 0, statut: 'en_cours' }); setOpen(true); }
  const index = Math.min(progress?.etape ?? 0, Math.max(steps.length - 1, 0)); const step = steps[index];

  return <>
    {pageVisible && <div className="space-y-7 animate-enter"><Breadcrumb items={['Accueil', 'Auto-formation']}/><PageHeader eyebrow="Documentation" title="Auto-formation" description="Retrouvez à tout moment le parcours correspondant à votre rôle actif."/>
      {error && <p role="alert" className="text-sm font-medium text-oriana-violet">{error}</p>}
      <Card><div className="flex items-start gap-4"><BookOpen className="text-oriana-lavande"/><div className="flex-1"><h2 className="font-titre text-xl">Parcours {user.role_actif.replaceAll('_', ' ')}</h2><p className="mt-2 text-sm text-oriana-discret">Statut : {progress?.statut || 'chargement'} · {steps.length} étapes adaptées à vos droits.</p><div className="mt-5 flex gap-2"><Button onClick={() => setOpen(true)}>{progress?.statut === 'en_cours' ? 'Reprendre' : 'Ouvrir le parcours'}</Button><Button variant="secondary" onClick={restart}><RotateCcw size={16}/>Recommencer</Button></div></div></div></Card>
    </div>}
    <Modal open={open && Boolean(step)} onClose={skip} title={step?.titre || 'Auto-formation'}><p className="text-sm leading-6 text-oriana-discret">{step?.texte}</p><p className="mt-4 text-xs text-oriana-discret">Étape {index + 1} sur {steps.length}</p>{error && <p role="alert" className="mt-3 text-sm">{error}</p>}<div className="mt-5 flex justify-between gap-2"><Button variant="ghost" onClick={skip}>Passer</Button><Button onClick={next}>{index >= steps.length - 1 ? 'Terminer' : 'Suivant'}</Button></div></Modal>
  </>;
}

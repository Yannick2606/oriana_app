import { useState } from 'react';
import { Check, KeyRound, LogOut } from 'lucide-react';
import { Button, Card, Field, Input } from '../components/ui';
import { Logo } from '../components/Logo';
import { ApiError } from '../api';
import { useSession } from './sessionContext';

export function FirstPasswordPage() {
  const { changeInitialPassword, logout } = useSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (password.length < 12) { setError('Le mot de passe doit contenir au moins 12 caractères.'); return; }
    if (password !== confirmation) { setError('Les deux saisies ne correspondent pas.'); return; }
    setPending(true); setError('');
    try {
      await changeInitialPassword(password);
    } catch (requestError) {
      setError(requestError instanceof ApiError && requestError.details?.error === 'PASSWORD_UNCHANGED'
        ? 'Le nouveau mot de passe doit être différent du mot de passe provisoire.'
        : 'Le mot de passe n’a pas pu être enregistré. Réessayez.');
    } finally { setPending(false); }
  }

  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-oriana-fond p-5 text-oriana-texte">
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(156,39,176,.2),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(179,157,219,.12),transparent_30%)]"/>
    <div className="relative w-full max-w-lg"><div className="mb-8 flex justify-center"><Logo/></div><Card className="p-6 sm:p-8"><div className="grid h-12 w-12 place-items-center rounded-oriana bg-oriana-violet/15 text-oriana-lavande"><KeyRound size={22}/></div><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-oriana-lavande">Première connexion</p><h1 className="mt-2 font-titre text-3xl">Choisissez votre mot de passe</h1><p className="mt-3 text-sm leading-6 text-oriana-discret">Le mot de passe provisoire créé par l’administrateur doit être remplacé avant d’accéder à orIAna.</p><div className="mt-6 space-y-5"><Field label="Nouveau mot de passe" hint="12 caractères minimum."><Input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending}/></Field><Field label="Confirmer le mot de passe"><Input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} disabled={pending}/></Field></div>{error && <p role="alert" className="mt-4 rounded-oriana border border-oriana-lavande/40 bg-oriana-violet/10 px-3 py-2 text-sm text-oriana-lavandeClair">{error}</p>}<Button className="mt-6 w-full" onClick={submit} disabled={pending}>{pending ? 'Enregistrement…' : <><Check size={17}/>Enregistrer et accéder à orIAna</>}</Button><Button className="mt-2 w-full" variant="ghost" onClick={logout} disabled={pending}><LogOut size={16}/>Se déconnecter</Button></Card><p className="mt-5 text-center text-xs text-oriana-discret">Le mot de passe est transmis au backend sécurisé puis stocké uniquement sous forme de hash bcrypt.</p></div>
  </main>;
}

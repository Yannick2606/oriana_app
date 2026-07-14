import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { authApi } from '../api/auth';
import { Button, Card, Field, Input } from '../components/ui';
import { Logo } from '../components/Logo';

export function ResetPasswordPage({ token }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit() {
    if (password.length < 12) { setError('Le mot de passe doit contenir au moins 12 caractères.'); return; }
    if (password !== confirmation) { setError('Les deux mots de passe ne correspondent pas.'); return; }
    setPending(true); setError('');
    try {
      await authApi.resetPassword({ token, newPassword: password });
      window.history.replaceState({}, '', window.location.pathname);
      setDone(true);
    } catch {
      setError('Ce lien est invalide ou a expiré. Demandez un nouveau lien.');
    } finally { setPending(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-oriana-fond p-5 text-oriana-texte">
    <div className="w-full max-w-md"><div className="mb-7"><Logo/></div><Card className="p-6 sm:p-8">
      <div className="mb-6 grid h-11 w-11 place-items-center rounded-oriana bg-oriana-violet/15 text-oriana-lavande"><KeyRound size={20}/></div>
      <h1 className="font-titre text-3xl">Nouveau mot de passe</h1>
      {done ? <><p className="mt-4 text-sm leading-6 text-oriana-discret">Votre mot de passe a été remplacé. Vous pouvez maintenant vous connecter.</p><Button className="mt-6 w-full" onClick={() => window.location.reload()}>Revenir à la connexion</Button></> : <>
        <p className="mt-2 text-sm leading-6 text-oriana-discret">Choisissez au moins 12 caractères. Ce lien ne pourra être utilisé qu’une fois.</p>
        <div className="mt-6 space-y-4"><Field label="Nouveau mot de passe"><Input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending}/></Field><Field label="Confirmer le mot de passe"><Input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={pending}/></Field></div>
        {error && <p role="alert" className="mt-4 text-sm text-oriana-lavandeClair">{error}</p>}
        <Button className="mt-6 w-full" onClick={submit} disabled={pending}>{pending ? 'Enregistrement…' : 'Enregistrer le mot de passe'}</Button>
      </>}
    </Card></div>
  </main>;
}

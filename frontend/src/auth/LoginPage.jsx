import { useState } from 'react';
import { ArrowRight, Building2, Check, Eye, EyeOff, KeyRound, Moon, Sun } from 'lucide-react';
import { ApiError } from '../api';
import { Button, Card, Field, Input } from '../components/ui';
import { Logo } from '../components/Logo';
import { useTheme } from '../hooks/useTheme';
import { useSession } from './sessionContext';
import { authApi } from '../api/auth';

const roleLabels = {
  consultant: 'Consultant', master_consultant: 'Master consultant', directeur_agence: 'Directeur d’agence',
  admin_agence: 'Administrateur d’agence', super_admin: 'Super administrateur',
  manager: 'Master consultant', admin: 'Administrateur d’agence', client: 'Client',
};

function errorMessage(error) {
  const code = error instanceof ApiError ? error.details?.error : null;
  if (code === 'INVALID_CREDENTIALS') return 'Adresse email ou mot de passe incorrect.';
  if (code === 'NO_ROLE') return 'Aucun rôle actif n’est attribué à ce compte.';
  if (code === 'INVALID_ROLE') return 'Ce rôle n’est pas autorisé pour votre compte.';
  return 'Connexion impossible pour le moment. Vérifiez votre accès au service.';
}

export function LoginPage({ sessionUnavailable = false }) {
  const { login } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(sessionUnavailable ? 'Le service de session est momentanément indisponible.' : '');
  const [forgotten, setForgotten] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function submit(roleActif) {
    if (!email.trim() || !motDePasse) { setError('Renseignez votre adresse email et votre mot de passe.'); return; }
    setPending(true); setError('');
    try {
      const result = await login({ email: email.trim(), motDePasse, roleActif });
      if (result.selection_role_requise) setRoles(result.roles);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally { setPending(false); }
  }

  async function requestReset() {
    if (!email.trim()) { setError('Renseignez votre adresse email.'); return; }
    setPending(true); setError('');
    try {
      await authApi.requestPasswordReset(email.trim());
      setResetSent(true);
    } catch { setError('Envoi impossible pour le moment. Réessayez plus tard.'); }
    finally { setPending(false); }
  }

  return <main className="relative min-h-screen overflow-hidden bg-oriana-fond text-oriana-texte">
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(156,39,176,.18),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(179,157,219,.12),transparent_30%)]"/>
    <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.1fr_.9fr]">
      <section className="hidden flex-col justify-between p-12 lg:flex xl:p-20">
        <Logo/>
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-oriana-lavande">Intelligence immobilière</p>
          <h1 className="mt-5 font-titre text-5xl leading-[1.08] xl:text-6xl">Vos données deviennent des décisions.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-oriana-discret">Un espace de travail conçu pour qualifier vos actifs, suivre vos opportunités et avancer avec la prochaine action toujours visible.</p>
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
            {['Patrimoine structuré', 'Relations centralisées', 'Matching assisté', 'Accès sécurisé'].map((item) => <div key={item} className="flex items-center gap-2 rounded-oriana border border-oriana-bordure bg-oriana-surface/60 px-3 py-3 text-sm"><Check size={15} className="text-oriana-lavande"/>{item}</div>)}
          </div>
        </div>
        <p className="text-xs text-oriana-discret">orIAna · From data to deals</p>
      </section>
      <section className="flex min-h-screen items-center justify-center p-5 sm:p-8 lg:border-l lg:border-oriana-bordure">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:justify-end"><div className="lg:hidden"><Logo/></div><Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Changer de thème">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</Button></div>
          <Card className="p-6 sm:p-8">
            {forgotten ? <>
              <div className="mb-7"><div className="mb-5 grid h-11 w-11 place-items-center rounded-oriana bg-oriana-violet/15 text-oriana-lavande"><KeyRound size={20}/></div><h2 className="font-titre text-3xl">Mot de passe oublié</h2><p className="mt-2 text-sm leading-6 text-oriana-discret">Saisissez votre adresse. Si un compte actif correspond, un lien valable 30 minutes sera envoyé.</p></div>
              {resetSent ? <p className="rounded-oriana border border-oriana-violet/25 bg-oriana-violet/10 px-3 py-3 text-sm font-medium text-oriana-violet">La demande est enregistrée. Consultez votre messagerie et vos courriers indésirables.</p> : <Field label="Adresse email"><Input autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending}/></Field>}
              {error && <p role="alert" className="mt-4 text-sm font-medium text-oriana-violet">{error}</p>}
              {!resetSent && <Button className="mt-6 w-full" onClick={requestReset} disabled={pending}>{pending ? 'Envoi…' : 'Envoyer le lien'}</Button>}
              <Button className="mt-4 w-full" variant="ghost" onClick={() => { setForgotten(false); setResetSent(false); setError(''); }}>Retour à la connexion</Button>
            </> : roles.length === 0 ? <>
              <div className="mb-7"><div className="mb-5 grid h-11 w-11 place-items-center rounded-oriana bg-oriana-violet/15 text-oriana-lavande"><KeyRound size={20}/></div><h2 className="font-titre text-3xl">Bienvenue</h2><p className="mt-2 text-sm leading-6 text-oriana-discret">Connectez-vous pour retrouver votre espace de travail.</p></div>
              <div className="space-y-5">
                <Field label="Adresse email"><Input autoComplete="username" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="prenom@entreprise.fr" disabled={pending}/></Field>
                <Field label="Mot de passe"><div className="relative"><Input className="pr-11" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={motDePasse} onChange={(event) => setMotDePasse(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} disabled={pending}/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-oriana-discret hover:text-oriana-texte" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></Field>
              </div>
              {error && <p role="alert" className="mt-4 rounded-oriana border border-oriana-violet/25 bg-oriana-violet/10 px-3 py-2 text-sm font-medium text-oriana-violet">{error}</p>}
              <Button className="mt-6 w-full" disabled={pending} onClick={() => submit()}>{pending ? 'Connexion…' : <>Se connecter<ArrowRight size={17}/></>}</Button>
              <button type="button" className="mt-4 w-full text-center text-sm text-oriana-lavande hover:underline" onClick={() => { setForgotten(true); setError(''); }}>Mot de passe oublié ?</button>
            </> : <>
              <div className="mb-6"><div className="mb-5 grid h-11 w-11 place-items-center rounded-oriana bg-oriana-violet/15 text-oriana-lavande"><Building2 size={20}/></div><p className="text-xs font-bold uppercase tracking-[.18em] text-oriana-lavande">Rôle actif</p><h2 className="mt-2 font-titre text-3xl">Comment souhaitez-vous travailler ?</h2><p className="mt-2 text-sm leading-6 text-oriana-discret">Vos droits seront appliqués par le serveur selon le rôle choisi pour cette session.</p></div>
              <div className="grid gap-3">{roles.map((role) => <button key={role} disabled={pending} onClick={() => submit(role)} className="group flex items-center justify-between rounded-oriana border border-oriana-bordure bg-oriana-fond px-4 py-4 text-left transition hover:border-oriana-lavande hover:bg-oriana-surfaceAlt"><span><span className="block text-sm font-semibold">{roleLabels[role] || role}</span><span className="mt-1 block text-xs text-oriana-discret">Ouvrir orIAna avec ce périmètre</span></span><ArrowRight size={18} className="text-oriana-discret transition group-hover:translate-x-1 group-hover:text-oriana-lavande"/></button>)}</div>
              {error && <p role="alert" className="mt-4 text-sm font-medium text-oriana-violet">{error}</p>}
              <Button className="mt-5" variant="ghost" size="sm" onClick={() => setRoles([])}>Retour</Button>
            </>}
          </Card>
          <p className="mt-6 text-center text-xs text-oriana-discret">Session sécurisée par cookie httpOnly · Aucun identifiant conservé dans le navigateur</p>
        </div>
      </section>
    </div>
  </main>;
}

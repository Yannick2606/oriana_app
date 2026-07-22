import { useEffect, useState } from 'react';
import { ArrowRight, Bot, BriefcaseBusiness, Building2, Plus, Settings, Users } from 'lucide-react';
import { systemApi } from './api';
import { useSession } from './auth/sessionContext';
import { AppShell } from './components/AppShell';
import { Breadcrumb, Button, Card, EmptyState, HelpButton, Modal, PageHeader } from './components/ui';
import { useTheme } from './hooks/useTheme';
import { canNavigateTo, navigationForRole } from './navigation/navigation';
import { PatrimoinePage } from './patrimoine/PatrimoinePage';
import { OffresPage } from './offres/OffresPage';
import { CrmPage } from './crm/CrmPage';
import { AgentsPage } from './agents/AgentsPage';
import { AdministrationPage } from './administration/AdministrationPage';
import { FormationExperience } from './formation/FormationExperience';

const pageDescriptions = {
  patrimoine: ['Patrimoine', 'Parcourez bientôt la hiérarchie Site → Bâtiment → Cellule → Lot.'],
  offres: ['Offres', 'La commercialisation et les conditions financières seront accessibles ici.'],
  crm: ['CRM', 'Sociétés, contacts et demandes seront réunis dans cet espace.'],
  matching: ['Matching', 'Les rapprochements calculés par Grist seront présentés ici.'],
  agents: ['Agents IA', 'Les traitements intelligents resteront guidés et validés par l’utilisateur.'],
  administration: ['Administration', 'Gérez les utilisateurs et les référentiels de l’agence.'],
};

function Dashboard({ user, onHelp, onNavigate, onCreateOpportunity, readOnly = false }) {
  const scope = user.role_actif === 'consultant'
    ? 'vos données'
    : ['manager', 'master_consultant'].includes(user.role_actif)
      ? 'votre activité et celle de votre équipe'
      : user.role_actif === 'admin_agence'
        ? 'les comptes et habilitations de votre agence'
        : user.role_actif === 'super_admin'
          ? 'la gouvernance et les habilitations de la plateforme'
          : 'les données et référentiels de votre agence';
  const shortcuts = [
    { id: 'patrimoine', title: 'Patrimoine', description: 'Parcourir et qualifier les sites, bâtiments, cellules et lots.', icon: Building2 },
    { id: 'offres', title: 'Offres', description: 'Gérer les offres et leurs conditions financières.', icon: BriefcaseBusiness },
    { id: 'crm', title: 'CRM', description: 'Retrouver les sociétés, contacts, demandes et matchings.', icon: Users },
    { id: 'agents', title: 'Agents IA', description: 'Déclencher et suivre les traitements asynchrones disponibles.', icon: Bot },
    { id: 'administration', title: 'Administration', description: 'Administrer les utilisateurs dans votre périmètre autorisé.', icon: Settings },
  ].filter(({ id }) => canNavigateTo(user.role_actif, id));
  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil']}/>
    <PageHeader eyebrow="Vue d’ensemble" title={`Bienvenue, ${user.prenom || 'à vous'}\u00a0👋`} description={`Voici les informations utiles pour suivre ${scope} et identifier la prochaine action.`} actions={<><HelpButton onClick={onHelp}/>{!readOnly && canNavigateTo(user.role_actif, 'crm') && <Button onClick={onCreateOpportunity}><Plus size={17}/>Nouvelle opportunité</Button>}</>}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {shortcuts.map(({ id, title, description, icon: Icon }) => <Card key={id} className="flex flex-col"><Icon className="text-oriana-lavande" size={20}/><h2 className="mt-4 font-titre text-xl">{title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-oriana-discret">{description}</p><Button className="mt-5 w-full" variant="secondary" onClick={() => onNavigate(id)}>Ouvrir {title}<ArrowRight size={15}/></Button></Card>)}
    </div>
  </div>;
}

function ModuleOrientation({ page, onBack }) {
  const [title, description] = pageDescriptions[page];
  return <div className="space-y-7 animate-enter"><Breadcrumb items={['Accueil', title]}/><PageHeader eyebrow="Module" title={title} description={description}/><EmptyState title={`${title} — prochaine étape du produit`} description="La navigation est prête. Les fonctionnalités métier seront ajoutées dans la tâche dédiée, sans anticiper le plan de construction." action={<Button onClick={onBack}>Retour à l’accueil</Button>}/></div>;
}

export default function App() {
  const { user, logout, changeRole } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [activePage, setActivePage] = useState('accueil');
  const [crmCreateRequest, setCrmCreateRequest] = useState(0);
  const sandbox = new URLSearchParams(window.location.search).get('sandbox') === '1';
  const navigation = navigationForRole(user.role_actif);
  const safeActivePage = canNavigateTo(user.role_actif, activePage) ? activePage : navigation[0]?.id;

  useEffect(() => {
    let active = true;
    systemApi.health()
      .then((result) => { if (active) setBackendStatus(result?.status === 'ok' ? 'available' : 'unavailable'); })
      .catch(() => { if (active) setBackendStatus('unavailable'); });
    return () => { active = false; };
  }, []);

  if (navigation.length === 0) return <main className="grid min-h-screen place-items-center bg-oriana-fond p-5 text-oriana-texte"><Card className="max-w-lg text-center"><h1 className="font-titre text-2xl">Rôle non reconnu</h1><p className="mt-3 text-sm leading-6 text-oriana-discret">Ce compte contient un rôle qui ne correspond pas au référentiel orIAna. Déconnectez-vous puis demandez sa correction à un administrateur.</p><Button className="mt-5" onClick={logout}>Se déconnecter</Button></Card></main>;

  return <AppShell theme={theme} onToggleTheme={toggleTheme} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((value) => !value)} backendStatus={backendStatus} user={user} onLogout={logout} onRoleChange={changeRole} navigation={navigation} activePage={safeActivePage} onNavigate={setActivePage}>
    {safeActivePage === 'accueil' ? <Dashboard user={user} onHelp={() => setHelpOpen(true)} onNavigate={setActivePage} onCreateOpportunity={() => { setCrmCreateRequest((value) => value + 1); setActivePage('crm'); }} readOnly={sandbox}/> : safeActivePage === 'patrimoine' ? <PatrimoinePage readOnly={sandbox}/> : safeActivePage === 'offres' ? <OffresPage/> : safeActivePage === 'crm' || safeActivePage === 'matching' ? <CrmPage createSocieteRequest={crmCreateRequest} readOnly={sandbox}/> : safeActivePage === 'agents' ? <AgentsPage readOnly={sandbox}/> : safeActivePage === 'administration' ? <AdministrationPage user={user} readOnly={sandbox}/> : safeActivePage === 'autoformation' ? null : <ModuleOrientation page={safeActivePage} onBack={() => setActivePage('accueil')}/>}
    <FormationExperience user={user} pageVisible={safeActivePage === 'autoformation'} readOnly={sandbox}/>
    <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Votre vue d’ensemble"><p className="text-sm leading-6 text-oriana-discret">Cette page rassemble les informations de votre périmètre actif. Les menus visibles facilitent l’accès ; les autorisations restent systématiquement contrôlées par le backend.</p><Button className="mt-5" onClick={() => setHelpOpen(false)}>J’ai compris</Button></Modal>
  </AppShell>;
}

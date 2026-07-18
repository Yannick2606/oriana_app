import { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, Plus, Sparkles, Target, Users } from 'lucide-react';
import { useSession } from './auth/sessionContext';
import { AppShell } from './components/AppShell';
import { Badge, Breadcrumb, Button, Card, EmptyState, HelpButton, Modal, Notification, PageHeader, Pagination, Table, Toolbar } from './components/ui';
import { useTheme } from './hooks/useTheme';
import { canNavigateTo, navigationForRole } from './navigation/navigation';
import { PatrimoinePage } from './patrimoine/PatrimoinePage';
import { OffresPage } from './offres/OffresPage';
import { CrmPage } from './crm/CrmPage';
import { AgentsPage } from './agents/AgentsPage';
import { AdministrationPage } from './administration/AdministrationPage';
import { FormationExperience } from './formation/FormationExperience';

const rows = [
  { id: 1, lot: 'Lot A — Roissy', usage: 'Logistique', surface: '12 450 m²', statut: 'Disponible' },
  { id: 2, lot: 'Bâtiment Horizon', usage: 'Bureaux', surface: '3 280 m²', statut: 'À qualifier' },
  { id: 3, lot: 'Cellule C3 — Sénart', usage: 'Activité', surface: '1 850 m²', statut: 'Mandat actif' },
];
const columns = [
  { key: 'lot', label: 'Actif' }, { key: 'usage', label: 'Usage' }, { key: 'surface', label: 'Surface' },
  { key: 'statut', label: 'Statut', render: (row) => <Badge variant={row.statut === 'Disponible' ? 'accent' : 'default'}>{row.statut}</Badge> },
];

const pageDescriptions = {
  patrimoine: ['Patrimoine', 'Parcourez bientôt la hiérarchie Site → Bâtiment → Cellule → Lot.'],
  offres: ['Offres', 'La commercialisation et les conditions financières seront accessibles ici.'],
  crm: ['CRM', 'Sociétés, contacts et demandes seront réunis dans cet espace.'],
  matching: ['Matching', 'Les rapprochements calculés par Grist seront présentés ici.'],
  agents: ['Agents IA', 'Les traitements intelligents resteront guidés et validés par l’utilisateur.'],
  administration: ['Administration', 'Gérez les utilisateurs et les référentiels de l’agence.'],
};

function Dashboard({ user, onHelp, onNavigate, onCreateOpportunity }) {
  const scope = user.role_actif === 'consultant'
    ? 'vos données'
    : ['manager', 'master_consultant'].includes(user.role_actif)
      ? 'votre activité et celle de votre équipe'
      : 'les données et référentiels de votre agence';
  const journey = [
    { number: '01', title: 'Structurer un actif', description: 'Site, bâtiment, cellule et lot réunis dans un même parcours.', action: 'Ouvrir le patrimoine', icon: Building2, page: 'patrimoine' },
    { number: '02', title: 'Qualifier une demande', description: 'Centralisez le besoin client avant de lancer le rapprochement.', action: 'Ouvrir le CRM', icon: Users, page: 'crm' },
    { number: '03', title: 'Prioriser la prochaine action', description: 'Retrouvez les opportunités qui demandent votre attention.', action: 'Voir le matching', icon: Target, page: 'matching' },
  ];
  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil']}/>
    <PageHeader eyebrow="Vue d’ensemble" title={`Bienvenue, ${user.prenom || 'à vous'}`} description={`Voici les informations utiles pour suivre ${scope} et identifier la prochaine action.`} actions={<><HelpButton onClick={onHelp}/><Button onClick={onCreateOpportunity}><Plus size={17}/>Nouvelle opportunité</Button></>}/>
    <Card className="border-l-4 border-l-oriana-violet">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-oriana-violet">Votre priorité</p><h2 className="mt-3 font-titre text-2xl font-semibold">Un parcours clair, de la donnée à l’action.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-oriana-discret">Commencez par structurer l’information, qualifiez le besoin, puis laissez orIAna faire ressortir la prochaine étape utile.</p></div><Button onClick={() => onNavigate('patrimoine')}>Commencer<ArrowRight size={16}/></Button></div>
    </Card>
    <div aria-label="Parcours recommandé" className="grid gap-3 lg:grid-cols-3">
      {journey.map(({ number, title, description, action, icon: Icon, page }) => <button type="button" key={number} onClick={() => onNavigate(page)} className="group rounded-oriana border border-oriana-bordure bg-oriana-surface p-5 text-left shadow-oriana transition hover:border-oriana-violet"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.18em] text-oriana-violet">ÉTAPE {number}</span><span className="rounded-full bg-oriana-violet/10 p-2 text-oriana-violet"><Icon size={17}/></span></div><h2 className="mt-4 font-titre text-xl font-semibold">{title}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-oriana-discret">{description}</p><span className="mt-4 flex items-center gap-2 text-xs font-bold text-oriana-violet">{action}<ArrowRight size={14} className="transition group-hover:translate-x-1"/></span></button>)}
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Patrimoine suivi', '128 actifs', Building2], ['Relations actives', '42 sociétés', Users], ['Actions suggérées', '7 priorités', Sparkles], ['Taux de qualification', '86 %', ArrowRight]].map(([label, value, Icon]) => <Card key={label} className="relative overflow-hidden"><div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-oriana-violet/10"/><Icon className="text-oriana-lavande" size={19}/><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-oriana-discret">{label}</p><p className="mt-1 font-titre text-2xl">{value}</p></Card>)}
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card><Toolbar><div><h2 className="font-titre text-xl">Actifs récents</h2><p className="mt-1 text-xs text-oriana-discret">Les dernières informations de votre périmètre.</p></div><Button variant="secondary" size="sm" onClick={() => onNavigate('patrimoine')}>Voir le patrimoine<ArrowRight size={15}/></Button></Toolbar><div className="mt-4"><Table columns={columns} rows={rows}/></div><div className="mt-4"><Pagination page={1} total={1}/></div></Card>
      <div className="space-y-4"><Notification title="Deux biens à compléter" description="Ajoutez les informations ICPE et désenfumage avant publication."/><Card><div className="flex items-center gap-2 text-oriana-lavande"><CheckCircle2 size={18}/><span className="text-xs font-bold uppercase tracking-wider">Prochaine action</span></div><h2 className="mt-3 font-titre text-xl">Compléter le lot de Roissy</h2><p className="mt-2 text-sm leading-6 text-oriana-discret">Ajoutez les critères manquants pour obtenir un matching plus pertinent.</p><Button className="mt-5 w-full" onClick={() => onNavigate('patrimoine')}>Continuer la qualification<ArrowRight size={16}/></Button></Card></div>
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
  const [activePage, setActivePage] = useState('accueil');
  const [crmCreateRequest, setCrmCreateRequest] = useState(0);
  const navigation = navigationForRole(user.role_actif);
  const safeActivePage = canNavigateTo(user.role_actif, activePage) ? activePage : navigation[0]?.id;

  return <AppShell theme={theme} onToggleTheme={toggleTheme} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((value) => !value)} user={user} onLogout={logout} onRoleChange={changeRole} navigation={navigation} activePage={safeActivePage} onNavigate={setActivePage}>
    {safeActivePage === 'accueil' ? <Dashboard user={user} onHelp={() => setHelpOpen(true)} onNavigate={setActivePage} onCreateOpportunity={() => { setCrmCreateRequest((value) => value + 1); setActivePage('crm'); }}/> : safeActivePage === 'patrimoine' ? <PatrimoinePage/> : safeActivePage === 'offres' ? <OffresPage/> : safeActivePage === 'crm' || safeActivePage === 'matching' ? <CrmPage createSocieteRequest={crmCreateRequest}/> : safeActivePage === 'agents' ? <AgentsPage/> : safeActivePage === 'administration' ? <AdministrationPage user={user}/> : safeActivePage === 'autoformation' ? null : <ModuleOrientation page={safeActivePage} onBack={() => setActivePage('accueil')}/>}
    <FormationExperience user={user} pageVisible={safeActivePage === 'autoformation'}/>
    <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Votre vue d’ensemble"><p className="text-sm leading-6 text-oriana-discret">Cette page rassemble les informations de votre périmètre actif. Les menus visibles facilitent l’accès ; les autorisations restent systématiquement contrôlées par le backend.</p><Button className="mt-5" onClick={() => setHelpOpen(false)}>J’ai compris</Button></Modal>
  </AppShell>;
}

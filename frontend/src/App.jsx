import { useState } from 'react';
import { ArrowRight, Building2, Plus, Sparkles, Users } from 'lucide-react';
import { useSession } from './auth/sessionContext';
import { AppShell } from './components/AppShell';
import { Badge, Breadcrumb, Button, Card, EmptyState, HelpButton, Modal, Notification, PageHeader, Pagination, Table, Toolbar } from './components/ui';
import { useTheme } from './hooks/useTheme';
import { canNavigateTo, navigationForRole } from './navigation/navigation';
import { PatrimoinePage } from './patrimoine/PatrimoinePage';

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

function Dashboard({ user, onHelp }) {
  const scope = user.role_actif === 'consultant' ? 'vos données' : user.role_actif === 'manager' ? 'l’activité de votre agence' : 'les données et référentiels de votre agence';
  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil']}/>
    <PageHeader eyebrow="Vue d’ensemble" title={`Bienvenue, ${user.prenom || 'à vous'} 👋`} description={`Voici les informations utiles pour suivre ${scope} et identifier la prochaine action.`} actions={<><HelpButton onClick={onHelp}/><Button><Plus size={17}/>Nouvelle opportunité</Button></>}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Patrimoine suivi', '128 actifs', Building2], ['Relations actives', '42 sociétés', Users], ['Actions suggérées', '7 priorités', Sparkles], ['Taux de qualification', '86 %', ArrowRight]].map(([label, value, Icon]) => <Card key={label} className="relative overflow-hidden"><div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-oriana-violet/10"/><Icon className="text-oriana-lavande" size={19}/><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-oriana-discret">{label}</p><p className="mt-1 font-titre text-2xl">{value}</p></Card>)}
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card><Toolbar><div><h2 className="font-titre text-xl">Actifs récents</h2><p className="mt-1 text-xs text-oriana-discret">Les dernières informations de votre périmètre.</p></div><Button variant="secondary" size="sm">Voir le patrimoine<ArrowRight size={15}/></Button></Toolbar><div className="mt-4"><Table columns={columns} rows={rows}/></div><div className="mt-4"><Pagination page={1} total={3}/></div></Card>
      <div className="space-y-4"><Notification title="Deux biens à compléter" description="Ajoutez les informations ICPE et désenfumage avant publication."/><Card><h2 className="font-titre text-xl">Prochaine étape</h2><p className="mt-2 text-sm leading-6 text-oriana-discret">Qualifiez le lot de Roissy pour obtenir un matching plus pertinent.</p><Button className="mt-5 w-full">Continuer la qualification<ArrowRight size={16}/></Button></Card></div>
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
  const navigation = navigationForRole(user.role_actif);
  const safeActivePage = canNavigateTo(user.role_actif, activePage) ? activePage : 'accueil';

  return <AppShell theme={theme} onToggleTheme={toggleTheme} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((value) => !value)} user={user} onLogout={logout} onRoleChange={changeRole} navigation={navigation} activePage={safeActivePage} onNavigate={setActivePage}>
    {safeActivePage === 'accueil' ? <Dashboard user={user} onHelp={() => setHelpOpen(true)}/> : safeActivePage === 'patrimoine' ? <PatrimoinePage/> : <ModuleOrientation page={safeActivePage} onBack={() => setActivePage('accueil')}/>}
    <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Votre vue d’ensemble"><p className="text-sm leading-6 text-oriana-discret">Cette page rassemble les informations de votre périmètre actif. Les menus visibles facilitent l’accès ; les autorisations restent systématiquement contrôlées par le backend.</p><Button className="mt-5" onClick={() => setHelpOpen(false)}>J’ai compris</Button></Modal>
  </AppShell>;
}

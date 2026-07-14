import { useState } from 'react';
import { ArrowRight, Building2, Plus, Sparkles, Users } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { Accordion, Badge, Breadcrumb, Button, Card, Checkbox, EmptyState, Field, HelpButton, Input, Modal, Notification, PageHeader, Pagination, Radio, Select, Skeleton, Table, Tabs, Textarea, Toggle, Toolbar } from './components/ui';
import { useTheme } from './hooks/useTheme';

const rows = [
  { id: 1, lot: 'Lot A — Roissy', usage: 'Logistique', surface: '12 450 m²', statut: 'Disponible' },
  { id: 2, lot: 'Bâtiment Horizon', usage: 'Bureaux', surface: '3 280 m²', statut: 'À qualifier' },
  { id: 3, lot: 'Cellule C3 — Sénart', usage: 'Activité', surface: '1 850 m²', statut: 'Mandat actif' },
];
const columns = [
  { key: 'lot', label: 'Actif' }, { key: 'usage', label: 'Usage' }, { key: 'surface', label: 'Surface' },
  { key: 'statut', label: 'Statut', render: (row) => <Badge variant={row.statut === 'Disponible' ? 'accent' : 'default'}>{row.statut}</Badge> },
];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('apercu');
  const [accordion, setAccordion] = useState('structure');
  const [alerts, setAlerts] = useState(true);

  return <AppShell theme={theme} onToggleTheme={toggleTheme} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((value) => !value)}>
    <div className="space-y-7 animate-enter">
      <Breadcrumb items={['Accueil', 'Design System']}/>
      <PageHeader eyebrow="Fondations produit" title="Un espace simple pour décider vite." description="Le Design System orIAna rassemble les composants, les règles et les repères nécessaires à une expérience cohérente sur tous les écrans." actions={<><HelpButton onClick={() => setHelpOpen(true)}/><Button><Plus size={17}/>Nouvelle opportunité</Button></>}/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Patrimoine suivi', '128 actifs', Building2], ['Relations actives', '42 sociétés', Users], ['Actions suggérées', '7 priorités', Sparkles], ['Taux de qualification', '86 %', ArrowRight]].map(([label, value, Icon]) => <Card key={label} className="relative overflow-hidden"><div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-oriana-violet/10"/><Icon className="text-oriana-lavande" size={19}/><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-oriana-discret">{label}</p><p className="mt-1 font-titre text-2xl">{value}</p></Card>)}
      </div>
      <Tabs tabs={[{ id: 'apercu', label: 'Aperçu' }, { id: 'composants', label: 'Composants' }, { id: 'formulaires', label: 'Formulaires' }]} active={activeTab} onChange={setActiveTab}/>
      {activeTab === 'apercu' && <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card><Toolbar><div><h2 className="font-titre text-xl">Actifs récents</h2><p className="mt-1 text-xs text-oriana-discret">Une lecture claire, avant toute décoration.</p></div><Button variant="secondary" size="sm">Voir le patrimoine<ArrowRight size={15}/></Button></Toolbar><div className="mt-4"><Table columns={columns} rows={rows}/></div><div className="mt-4"><Pagination page={1} total={3}/></div></Card>
        <div className="space-y-4"><Notification title="Deux biens à compléter" description="Ajoutez les informations ICPE et désenfumage avant publication."/><Card><h2 className="font-titre text-xl">Prochaine étape</h2><p className="mt-2 text-sm leading-6 text-oriana-discret">Qualifiez le lot de Roissy pour obtenir un matching plus pertinent.</p><Button className="mt-5 w-full">Continuer la qualification<ArrowRight size={16}/></Button></Card><Accordion openId={accordion} onChange={setAccordion} items={[{ id: 'structure', title: 'Hiérarchie immobilière', content: 'Site → Bâtiment → Cellule → Lot. Chaque niveau conserve son rôle technique et commercial.' }, { id: 'usage', title: 'Bonnes pratiques', content: 'Complétez les données structurantes avant les informations secondaires.' }]}/></div>
      </div>}
      {activeTab === 'composants' && <div className="grid gap-6 lg:grid-cols-2"><Card><h2 className="font-titre text-xl">États et actions</h2><div className="mt-5 flex flex-wrap gap-3"><Button>Action principale</Button><Button variant="secondary">Secondaire</Button><Button variant="ghost">Discrète</Button><Badge variant="accent">Actif</Badge><Badge>Brouillon</Badge></div><div className="mt-6 space-y-3"><Skeleton className="w-3/4"/><Skeleton className="w-full"/><Skeleton className="w-1/2"/></div></Card><EmptyState title="Aucun mandat pour ce lot" description="Créez un mandat afin de préparer sa commercialisation." action={<Button><Plus size={16}/>Créer un mandat</Button>}/></div>}
      {activeTab === 'formulaires' && <Card><div className="grid gap-5 md:grid-cols-2"><Field label="Nom du lot" hint="Utilisez un nom immédiatement reconnaissable."><Input placeholder="Ex. Lot A — Roissy"/></Field><Field label="Usage"><Select defaultValue=""><option value="" disabled>Sélectionner</option><option>Logistique</option><option>Activité</option><option>Bureaux</option></Select></Field><Field label="Description"><Textarea placeholder="Informations utiles à la qualification…"/></Field><div className="space-y-4"><Toggle checked={alerts} onChange={setAlerts} label="Recevoir les alertes de complétude"/><Checkbox label="Bien divisible"/><div className="flex gap-4"><Radio name="nature" label="Location" defaultChecked/><Radio name="nature" label="Vente"/></div></div></div><div className="mt-6 flex justify-end gap-2"><Button variant="secondary">Annuler</Button><Button>Enregistrer</Button></div></Card>}
    </div>
    <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="À propos de cet écran"><p className="text-sm leading-6 text-oriana-discret">Cette page présente les fondations visuelles d’orIAna. Les futures fonctionnalités réutiliseront ces composants afin de conserver les mêmes repères, comportements et niveaux d’accessibilité.</p><Button className="mt-5" onClick={() => setHelpOpen(false)}>J’ai compris</Button></Modal>
  </AppShell>;
}

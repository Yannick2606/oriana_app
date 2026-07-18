import { useState } from 'react';
import { Bell, BookOpen, Bot, BriefcaseBusiness, Building2, ChevronLeft, ContactRound, LayoutDashboard, LogOut, Menu, Moon, PanelLeftClose, Search, Settings, Sparkles, Sun } from 'lucide-react';
import { Logo } from './Logo';
import { Avatar, Badge, Button, Modal, SearchBar, Tooltip } from './ui';
import { branding } from '../config/branding';

const navigationIcons = { dashboard: LayoutDashboard, building: Building2, briefcase: BriefcaseBusiness, contacts: ContactRound, matching: Sparkles, bot: Bot, settings: Settings, book: BookOpen };
const roleLabels = {
  consultant: 'Consultant',
  master_consultant: 'Master consultant',
  directeur_agence: 'Directeur d’agence',
  admin_agence: 'Administrateur d’agence',
  super_admin: 'Super administrateur',
  manager: 'Master consultant',
  admin: 'Administrateur d’agence',
  client: 'Client',
};

function RoleSwitcher({ user, onRoleChange }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const roles = user?.roles || [];

  if (roles.length < 2) return <Badge variant="accent">{roleLabels[user?.role_actif] || user?.role_actif || 'Rôle actif'}</Badge>;

  async function selectRole(role) {
    if (role === user.role_actif) { setOpen(false); return; }
    setPending(true); setError(false);
    try { await onRoleChange(role); setOpen(false); } catch { setError(true); } finally { setPending(false); }
  }

  return <div className="relative">
    <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} className="flex items-center gap-1.5 rounded-full bg-oriana-violet/20 px-2.5 py-1 text-xs font-semibold text-oriana-lavandeClair transition hover:bg-oriana-violet/30"><span>{roleLabels[user.role_actif] || user.role_actif}</span><ChevronLeft size={13} className={`-rotate-90 transition ${open ? 'rotate-90' : ''}`}/></button>
    {open && <div role="menu" className="absolute right-0 top-full z-50 mt-2 min-w-48 rounded-oriana border border-oriana-bordure bg-oriana-surface p-1.5 shadow-oriana-lg">{roles.map((role) => <button type="button" role="menuitemradio" aria-checked={role === user.role_actif} disabled={pending} key={role} onClick={() => selectRole(role)} className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-oriana-surfaceAlt disabled:opacity-50"><span>{roleLabels[role] || role}</span>{role === user.role_actif && <span className="text-oriana-violet">●</span>}</button>)}{error && <p role="alert" className="px-3 py-2 text-xs font-medium text-oriana-violet">Changement impossible. Réessayez.</p>}</div>}
  </div>;
}

export function AppShell({ children, theme, onToggleTheme, collapsed, onToggleCollapsed, mobileOpen, onToggleMobile, backendStatus = 'Opérationnel', user, onLogout, onRoleChange, navigation, activePage, onNavigate }) {
  const [utility, setUtility] = useState(null);
  const utilityContent = {
    search: ['Recherche globale', 'La recherche transversale sera activée avec les modules CRM et patrimoine. Utilisez pour le moment la navigation principale pour accéder aux données.'],
    notifications: ['Notifications', 'Aucune notification non lue. Les alertes métier seront ajoutées avec les tunnels CRM et la veille territoriale.'],
    assistant: ['Assistant IA', 'L’assistant conversationnel sera activé dans une tâche dédiée avec suivi des coûts, validation humaine et choix du fournisseur IA.'],
  };
  return <div className="min-h-screen bg-oriana-fond text-oriana-texte">
    <a href="#contenu" className="fixed left-3 top-3 z-[60] -translate-y-20 rounded-oriana bg-oriana-violet px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0">Aller au contenu principal</a>
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-oriana-bordure bg-oriana-fond/90 px-4 backdrop-blur-xl">
      <button type="button" className="mr-3 min-h-11 min-w-11 md:hidden" onClick={onToggleMobile} aria-label="Ouvrir la navigation"><Menu/></button>
      <div className={`${collapsed ? 'w-16' : 'w-56'} transition-all duration-oriana`}><Logo compact={collapsed}/></div>
      <SearchBar className="mx-auto hidden w-full max-w-xl md:block" placeholder="Rechercher un bien, une société, un contact…" readOnly onClick={() => setUtility('search')}/>
      <div className="ml-auto flex items-center gap-1.5">
        <Tooltip label="Recherche"><Button className="md:hidden" variant="ghost" size="sm" aria-label="Rechercher" onClick={() => setUtility('search')}><Search size={18}/></Button></Tooltip>
        <Tooltip label="Notifications"><Button variant="ghost" size="sm" aria-label="Notifications" onClick={() => setUtility('notifications')}><Bell size={18}/></Button></Tooltip>
        <Tooltip label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}><Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Changer de thème">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</Button></Tooltip>
        <div className="ml-2 hidden items-center gap-2 border-l border-oriana-bordure pl-3 sm:flex"><Avatar name={`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}/><div className="hidden lg:block"><p className="text-xs font-semibold">{user?.prenom} {user?.nom}</p><RoleSwitcher user={user} onRoleChange={onRoleChange}/></div><Tooltip label="Se déconnecter"><Button variant="ghost" size="sm" aria-label="Se déconnecter" onClick={onLogout}><LogOut size={17}/></Button></Tooltip></div>
      </div>
    </header>
    {mobileOpen && <button type="button" className="fixed inset-0 z-40 bg-oriana-fondAlt/75 md:hidden" onClick={onToggleMobile} aria-label="Fermer la navigation"/>}
    <aside className={`oriana-sidebar fixed bottom-0 left-0 top-16 z-40 flex flex-col border-r p-3 transition-all duration-oriana ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {!collapsed && <p className="sidebar-kicker mb-3 px-3 text-[10px] font-bold uppercase tracking-[.22em]">Espace de travail</p>}
      <nav aria-label="Navigation principale" className="space-y-1">
        {navigation.map(({ id, label, icon }) => { const Icon = navigationIcons[icon]; const active = activePage === id; return <button type="button" key={id} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined} aria-current={active ? 'page' : undefined} onClick={() => { onNavigate(id); if (mobileOpen) onToggleMobile(); }} className={`sidebar-link flex min-h-11 w-full items-center gap-3 rounded-oriana px-3 py-2.5 text-sm font-semibold transition ${active ? 'sidebar-link-active' : ''}`}><Icon size={18}/>{!collapsed && <span>{label}</span>}</button>; })}
      </nav>
      <div className="mt-auto space-y-3">
        {!collapsed && <div className="sidebar-role rounded-oriana border p-3"><RoleSwitcher user={user} onRoleChange={onRoleChange}/><p className="mt-2 text-xs leading-5">Les droits sont contrôlés côté serveur pour cette session.</p></div>}
        <Button variant="ghost" className="sidebar-control w-full sm:hidden" onClick={onLogout}><LogOut size={17}/>{!collapsed && 'Se déconnecter'}</Button>
        <Button variant="ghost" className="sidebar-control w-full" onClick={onToggleCollapsed} aria-label={collapsed ? 'Déployer la barre latérale' : 'Replier la barre latérale'}>{collapsed ? <ChevronLeft className="rotate-180" size={18}/> : <><PanelLeftClose size={18}/>Replier</>}</Button>
      </div>
    </aside>
    <div className={`flex min-h-screen flex-col pt-16 transition-all duration-oriana ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
      <main id="contenu" tabIndex="-1" className="mx-auto w-full max-w-[1480px] flex-1 p-4 pb-24 focus:outline-none sm:p-6 sm:pb-24 lg:p-8 lg:pb-20">{children}</main>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-oriana-bordure px-6 py-4 text-xs text-oriana-discret"><span>{branding.appName} v0.1.0 · © {branding.organizationName} 2026</span><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-oriana-lavandeMoyen"/>Backend : {backendStatus}</span></footer>
    </div>
    <button type="button" onClick={() => setUtility('assistant')} aria-label="Ouvrir l’assistant IA" className="fixed bottom-5 right-5 z-30 flex h-12 items-center gap-2 rounded-full bg-gradient-to-br from-oriana-lavandeMoyen to-oriana-violet px-4 text-sm font-semibold text-white shadow-oriana-lg transition hover:scale-[1.02] sm:bottom-6 sm:right-6"><Bot size={20}/><span className="hidden sm:inline">Assistant IA</span></button>
    <Modal open={Boolean(utility)} onClose={() => setUtility(null)} title={utility ? utilityContent[utility][0] : ''}>
      <p className="text-sm leading-6 text-oriana-discret">{utility ? utilityContent[utility][1] : ''}</p>
      <Button className="mt-5" onClick={() => setUtility(null)}>Fermer</Button>
    </Modal>
  </div>;
}

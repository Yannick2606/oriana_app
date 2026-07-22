import { useEffect, useId, useRef, useState } from 'react';
import { Bell, BookOpen, Bot, BriefcaseBusiness, Building2, ChevronLeft, ContactRound, LayoutDashboard, LogOut, Menu, Moon, PanelLeftClose, Search, Settings, Sparkles, Sun } from 'lucide-react';
import { Logo } from './Logo';
import { Avatar, Badge, Button, Modal, Tooltip } from './ui';
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
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const roles = user?.roles || [];

  useEffect(() => {
    if (!open) return undefined;
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitemradio"]') || [])];
    (items.find((item) => item.getAttribute('aria-checked') === 'true') || items[0])?.focus();
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, [open]);

  if (roles.length < 2) return <Badge variant="accent">{roleLabels[user?.role_actif] || user?.role_actif || 'Rôle actif'}</Badge>;

  async function selectRole(role) {
    if (role === user.role_actif) { setOpen(false); triggerRef.current?.focus(); return; }
    setPending(true); setError(false);
    try { await onRoleChange(role); setOpen(false); triggerRef.current?.focus(); } catch { setError(true); } finally { setPending(false); }
  }

  function moveFocus(event, index, role) {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitemradio"]') || [])];
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectRole(role);
      return;
    }
    let nextIndex = null;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % items.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    items[nextIndex]?.focus();
  }

  return <div ref={containerRef} className="relative">
    <button ref={triggerRef} type="button" aria-controls={open ? menuId : undefined} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} className="flex items-center gap-1.5 rounded-full bg-oriana-violet/20 px-2.5 py-1 text-xs font-semibold text-oriana-lavandeClair transition hover:bg-oriana-violet/30"><span>{roleLabels[user.role_actif] || user.role_actif}</span><ChevronLeft size={13} className={`-rotate-90 transition ${open ? 'rotate-90' : ''}`}/></button>
    {open && <div ref={menuRef} id={menuId} role="menu" aria-label="Choisir le rôle actif" className="absolute right-0 top-full z-50 mt-2 max-h-[min(20rem,calc(100vh-2rem))] min-w-48 overflow-y-auto overscroll-contain rounded-oriana border border-oriana-bordure bg-oriana-surface p-1.5 shadow-oriana-lg">{roles.map((role, index) => <button type="button" role="menuitemradio" aria-checked={role === user.role_actif} disabled={pending} key={role} onKeyDown={(event) => moveFocus(event, index, role)} onClick={() => selectRole(role)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-oriana-surfaceAlt disabled:opacity-50"><span>{roleLabels[role] || role}</span>{role === user.role_actif && <span aria-hidden="true" className="text-oriana-lavande">●</span>}</button>)}{error && <p role="alert" className="px-3 py-2 text-xs text-oriana-lavandeClair">Changement impossible. Réessayez.</p>}</div>}
  </div>;
}

export function AppShell({ children, theme, onToggleTheme, collapsed, onToggleCollapsed, mobileOpen, onToggleMobile, backendStatus = 'checking', user, onLogout, onRoleChange, navigation, activePage, onNavigate }) {
  const [utility, setUtility] = useState(null);
  const backendStates = {
    checking: { label: 'Vérification…', dot: 'bg-oriana-bordure animate-pulse' },
    available: { label: 'Disponible', dot: 'bg-oriana-lavandeMoyen' },
    unavailable: { label: 'Indisponible', dot: 'border border-oriana-lavande bg-transparent' },
  };
  const backendState = backendStates[backendStatus] || backendStates.unavailable;
  const utilityContent = {
    search: ['Recherche globale', 'La recherche transversale sera activée avec les modules CRM et patrimoine. Utilisez pour le moment la navigation principale pour accéder aux données.'],
    notifications: ['Notifications', 'Aucune notification non lue. Les alertes métier seront ajoutées avec les tunnels CRM et la veille territoriale.'],
    assistant: ['Assistant IA', 'L’assistant conversationnel sera activé dans une tâche dédiée avec suivi des coûts, validation humaine et choix du fournisseur IA.'],
  };
  return <div className="min-h-screen bg-oriana-fond text-oriana-texte">
    <a href="#contenu" className="sr-only fixed left-3 top-3 z-[60] rounded-oriana bg-oriana-surface px-4 py-2 text-sm font-semibold text-oriana-texte shadow-oriana-lg focus:not-sr-only">Aller au contenu</a>
    <header className={`fixed inset-x-0 top-0 z-30 flex h-16 min-w-0 items-center gap-2 border-b border-oriana-bordure bg-oriana-fond/90 px-3 backdrop-blur-xl transition-all duration-oriana sm:px-4 ${collapsed ? 'md:left-20' : 'md:left-64'}`}>
      <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-oriana text-oriana-discret hover:bg-oriana-surfaceAlt hover:text-oriana-texte md:hidden" onClick={onToggleMobile} aria-label="Ouvrir la navigation"><Menu/></button>
      <div className="min-w-0 flex-1 md:hidden"><Logo compact/></div>
      <button type="button" aria-haspopup="dialog" onClick={() => setUtility('search')} className="mx-auto hidden h-10 w-full max-w-xl items-center gap-3 rounded-oriana border border-oriana-bordure bg-oriana-fond px-3 text-left text-sm text-oriana-discret transition hover:bg-oriana-surfaceAlt focus:border-oriana-lavande focus:outline-none md:flex"><Search size={17}/><span>Rechercher un bien, une société, un contact…</span></button>
      <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
        <Tooltip label="Recherche"><Button className="md:hidden" variant="ghost" size="sm" aria-label="Rechercher" onClick={() => setUtility('search')}><Search size={18}/></Button></Tooltip>
        <Tooltip label="Notifications"><Button variant="ghost" size="sm" aria-label="Notifications" onClick={() => setUtility('notifications')}><Bell size={18}/></Button></Tooltip>
        <Tooltip label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}><Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Changer de thème">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</Button></Tooltip>
        <div className="ml-1 flex items-center gap-1 border-l border-oriana-bordure pl-2 sm:ml-2 sm:gap-2 sm:pl-3"><span className="hidden sm:inline-flex"><Avatar name={`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}/></span><div><p className="hidden text-xs font-semibold lg:block">{user?.prenom} {user?.nom}</p><RoleSwitcher user={user} onRoleChange={onRoleChange}/></div><span className="hidden sm:inline-flex"><Tooltip label="Se déconnecter"><Button variant="ghost" size="sm" aria-label="Se déconnecter" onClick={onLogout}><LogOut size={17}/></Button></Tooltip></span></div>
      </div>
    </header>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-oriana-fondAlt/75 md:hidden" onClick={onToggleMobile} aria-label="Fermer la navigation"/>}
    <aside aria-label="Navigation latérale" className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-oriana-navigationBorder bg-oriana-navigation/92 p-3 text-oriana-navigationText backdrop-blur-md transition-all duration-oriana ${collapsed ? 'md:w-20' : 'md:w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex h-10 items-center px-2"><Logo compact={collapsed} inverse/></div>
      <nav aria-label="Navigation principale" className="mt-3 space-y-1">
        {navigation.map(({ id, label, icon }) => { const Icon = navigationIcons[icon]; const active = activePage === id; const entry = <button type="button" aria-label={collapsed ? label : undefined} aria-current={active ? 'page' : undefined} onClick={() => { onNavigate(id); if (mobileOpen) onToggleMobile(); }} className={`flex w-full items-center gap-3 rounded-oriana px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-oriana-violet/25 text-oriana-lavandeClair' : 'text-oriana-navigationMuted hover:bg-oriana-navigationSurface hover:text-oriana-navigationText'} ${collapsed ? 'md:justify-center' : ''}`}><Icon size={18}/><span className={collapsed ? 'md:hidden' : ''}>{label}</span></button>; return <Tooltip key={id} label={collapsed ? label : null} placement="right" className="w-full">{entry}</Tooltip>; })}
      </nav>
      <div className="mt-auto space-y-3">
        <div className={`rounded-oriana border border-oriana-navigationBorder bg-oriana-navigationSurface p-3 ${collapsed ? 'md:hidden' : ''}`}><p className="text-xs font-semibold text-oriana-navigationText">{roleLabels[user?.role_actif] || user?.role_actif || 'Rôle actif'}</p><p className="mt-2 text-xs leading-5 text-oriana-navigationMuted">Rôle actif rappelé ici. Les droits sont contrôlés côté serveur.</p></div>
        <Button variant="ghost" className="w-full text-oriana-navigationMuted hover:bg-oriana-navigationSurface hover:text-oriana-navigationText sm:hidden" onClick={onLogout}><LogOut size={17}/><span className={collapsed ? 'md:hidden' : ''}>Se déconnecter</span></Button>
        <Button variant="ghost" className="hidden w-full text-oriana-navigationMuted hover:bg-oriana-navigationSurface hover:text-oriana-navigationText md:inline-flex" onClick={onToggleCollapsed} aria-label={collapsed ? 'Déployer la barre latérale' : 'Replier la barre latérale'}>{collapsed ? <ChevronLeft className="rotate-180" size={18}/> : <><PanelLeftClose size={18}/>Replier</>}</Button>
      </div>
    </aside>
    <div className={`flex min-h-screen flex-col pt-16 transition-all duration-oriana ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
      <main id="contenu" className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-oriana-bordure px-6 py-4 text-xs text-oriana-discret"><span>{branding.appName} v0.1.0 · © {branding.organizationName} 2026</span><span role="status" className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${backendState.dot}`}/>API : {backendState.label}</span></footer>
    </div>
    <button type="button" onClick={() => setUtility('assistant')} aria-label="Ouvrir l’assistant IA" className="fixed bottom-5 right-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-oriana-bordure bg-oriana-surface text-oriana-discret shadow-oriana transition hover:bg-oriana-surfaceAlt hover:text-oriana-texte"><Bot size={19}/></button>
    <Modal open={Boolean(utility)} onClose={() => setUtility(null)} title={utility ? utilityContent[utility][0] : ''}>
      <p className="text-sm leading-6 text-oriana-discret">{utility ? utilityContent[utility][1] : ''}</p>
      <Button className="mt-5" onClick={() => setUtility(null)}>Fermer</Button>
    </Modal>
  </div>;
}

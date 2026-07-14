import { Bell, Bot, Building2, ChevronLeft, LayoutDashboard, LogOut, Menu, Moon, PanelLeftClose, Search, Sun, Users } from 'lucide-react';
import { Logo } from './Logo';
import { Avatar, Badge, Button, SearchBar, Tooltip } from './ui';
import { branding } from '../config/branding';

const navigation = [
  { label: 'Vue d’ensemble', icon: LayoutDashboard, active: true },
  { label: 'Patrimoine', icon: Building2 },
  { label: 'Relations', icon: Users },
  { label: 'Assistant', icon: Bot },
];

export function AppShell({ children, theme, onToggleTheme, collapsed, onToggleCollapsed, mobileOpen, onToggleMobile, backendStatus = 'Opérationnel', user, onLogout }) {
  return <div className="min-h-screen bg-oriana-fond text-oriana-texte">
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-oriana-bordure bg-oriana-fond/90 px-4 backdrop-blur-xl">
      <button className="mr-3 md:hidden" onClick={onToggleMobile} aria-label="Ouvrir la navigation"><Menu/></button>
      <div className="w-56"><Logo compact={collapsed}/></div>
      <SearchBar className="mx-auto hidden w-full max-w-xl md:block" placeholder="Rechercher un bien, une société, un contact…"/>
      <div className="ml-auto flex items-center gap-1.5">
        <Tooltip label="Recherche"><Button className="md:hidden" variant="ghost" size="sm" aria-label="Rechercher"><Search size={18}/></Button></Tooltip>
        <Tooltip label="Notifications"><Button variant="ghost" size="sm" aria-label="Notifications"><Bell size={18}/><span className="sr-only">2 nouvelles notifications</span></Button></Tooltip>
        <Tooltip label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}><Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Changer de thème">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</Button></Tooltip>
        <div className="ml-2 hidden items-center gap-2 border-l border-oriana-bordure pl-3 sm:flex"><Avatar name={`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}/><div className="hidden lg:block"><p className="text-xs font-semibold">{user?.prenom} {user?.nom}</p><p className="text-[11px] text-oriana-discret">Rôle : {user?.role_actif}</p></div><Tooltip label="Se déconnecter"><Button variant="ghost" size="sm" aria-label="Se déconnecter" onClick={onLogout}><LogOut size={17}/></Button></Tooltip></div>
      </div>
    </header>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-oriana-fondAlt/75 md:hidden" onClick={onToggleMobile} aria-label="Fermer la navigation"/>}
    <aside className={`fixed bottom-0 left-0 top-16 z-40 flex flex-col border-r border-oriana-bordure bg-oriana-fondAlt p-3 transition-all duration-oriana ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <nav aria-label="Navigation principale" className="space-y-1">
        {navigation.map(({ label, icon: Icon, active }) => <button key={label} className={`flex w-full items-center gap-3 rounded-oriana px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-oriana-violet/20 text-oriana-lavandeClair' : 'text-oriana-discret hover:bg-oriana-surface hover:text-oriana-texte'}`}><Icon size={18}/>{!collapsed && <span>{label}</span>}</button>)}
      </nav>
      <div className="mt-auto space-y-3">
        {!collapsed && <div className="rounded-oriana border border-oriana-bordure bg-oriana-surface p-3"><Badge variant="accent">{user?.role_actif || 'Rôle actif'}</Badge><p className="mt-2 text-xs leading-5 text-oriana-discret">Les droits sont contrôlés côté serveur pour cette session.</p></div>}
        <Button variant="ghost" className="w-full" onClick={onToggleCollapsed} aria-label={collapsed ? 'Déployer la barre latérale' : 'Replier la barre latérale'}>{collapsed ? <ChevronLeft className="rotate-180" size={18}/> : <><PanelLeftClose size={18}/>Replier</>}</Button>
      </div>
    </aside>
    <div className={`flex min-h-screen flex-col pt-16 transition-all duration-oriana ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
      <main id="contenu" className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-oriana-bordure px-6 py-4 text-xs text-oriana-discret"><span>{branding.appName} v0.1.0 · © {branding.organizationName} 2026</span><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-oriana-lavandeMoyen"/>Backend : {backendStatus}</span></footer>
    </div>
    <button aria-label="Ouvrir l’assistant IA" className="fixed bottom-6 right-6 z-30 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-oriana-lavandeMoyen to-oriana-violet text-white shadow-oriana-lg transition hover:scale-105"><Bot size={21}/></button>
  </div>;
}

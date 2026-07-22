import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import App from './App';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SessionProvider } from './auth/SessionContext.jsx';

vi.mock('./api/crm', () => ({ crmApi: { listAll: vi.fn().mockResolvedValue({ societes: [], contacts: [], demandes: [], lots: [] }), matching: vi.fn() } }));
vi.mock('./api/patrimoine', () => ({ patrimoineApi: { listAll: vi.fn().mockResolvedValue({ sites: [], batiments: [], cellules: [], lots: [] }) } }));
vi.mock('./api', async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, systemApi: { health: vi.fn().mockResolvedValue({ status: 'ok' }) } };
});

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.dataset.theme = 'dark';
  window.history.replaceState({}, '', '/');
});

function renderApp(role, roles = [role]) {
  const user = { id: 1, prenom: 'Julie', nom: 'Martin', roles, role_actif: role };
  const client = {
    me: vi.fn().mockResolvedValue({ user }),
    logout: vi.fn().mockResolvedValue({ status: 'ok' }),
    changeRole: vi.fn().mockImplementation((nextRole) => Promise.resolve({ user: { ...user, role_actif: nextRole } })),
  };
  render(<SessionProvider client={client}><ProtectedRoute><App/></ProtectedRoute></SessionProvider>);
  return client;
}

test('affiche la vue d’ensemble dans la charte orIAna', async () => {
  renderApp('master_consultant');
  expect(await screen.findByRole('heading', { name: /Bienvenue, Julie/i })).toBeInTheDocument();
  expect(screen.getAllByLabelText(/orIAna/i).length).toBeGreaterThan(0);
});

test('le thème foncé validé est utilisé par défaut', async () => {
  delete document.documentElement.dataset.theme;
  renderApp('consultant');
  await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
  expect(screen.getByRole('button', { name: 'Changer de thème' })).toBeInTheDocument();
});

test('le thème choisi explicitement est conservé après rechargement', async () => {
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: 'Changer de thème' }));
  await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'));
  expect(window.localStorage.getItem('oriana-theme')).toBe('light');

  cleanup();
  document.documentElement.dataset.theme = 'dark';
  renderApp('consultant');
  await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'));
});

test('le bac à sable désactive réellement les agents IA depuis la navigation', async () => {
  window.history.replaceState({}, '', '/?sandbox=1');
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: 'Agents IA' }));
  expect(await screen.findByText('Agents IA indisponibles dans la prévisualisation')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Déclencher l’agent' })).not.toBeInTheDocument();
});

test('un consultant voit les modules métier mais jamais l’administration', async () => {
  renderApp('consultant');
  expect(await screen.findByRole('button', { name: 'Patrimoine' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Offres' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'CRM' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
});

test('un master consultant voit le périmètre équipe sans écran admin', async () => {
  renderApp('master_consultant');
  expect(await screen.findByText(/celle de votre équipe/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
});

test('un admin d’agence accède à l’administration et peut ouvrir sa vue', async () => {
  renderApp('admin_agence');
  const administration = await screen.findByRole('button', { name: 'Administration' });
  fireEvent.click(administration);
  expect(screen.getByRole('heading', { name: 'Administration' })).toBeInTheDocument();
});

test('un utilisateur multirôle change de rôle sans nouvelle connexion', async () => {
  const client = renderApp('consultant', ['consultant', 'admin_agence']);
  const switchers = await screen.findAllByRole('button', { name: /Consultant/ });
  fireEvent.click(switchers[0]);
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Administrateur d’agence' }));
  expect(await screen.findByRole('button', { name: 'Administration' })).toBeInTheDocument();
  expect(client.changeRole).toHaveBeenCalledWith('admin_agence');
});

test('le sélecteur de rôle se parcourt aux flèches et se ferme avec Échap', async () => {
  renderApp('consultant', ['consultant', 'admin_agence']);
  const trigger = (await screen.findAllByRole('button', { name: /Consultant/ }))[0];
  fireEvent.click(trigger);
  const consultant = screen.getByRole('menuitemradio', { name: 'Consultant' });
  const admin = screen.getByRole('menuitemradio', { name: 'Administrateur d’agence' });
  await waitFor(() => expect(consultant).toHaveFocus());
  fireEvent.keyDown(consultant, { key: 'ArrowDown' });
  expect(admin).toHaveFocus();
  fireEvent.keyDown(admin, { key: 'Escape' });
  expect(screen.queryByRole('menu', { name: 'Choisir le rôle actif' })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('le sélecteur latéral s’ouvre vers le haut et reste défilable', async () => {
  renderApp('consultant', ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence', 'super_admin']);
  const switchers = await screen.findAllByRole('button', { name: /Consultant/ });
  fireEvent.click(switchers[1]);
  const menu = screen.getByRole('menu', { name: 'Choisir le rôle actif' });
  expect(menu).toHaveClass('bottom-full', 'overflow-y-auto');
  expect(screen.getByRole('menuitemradio', { name: 'Super administrateur' })).toBeInTheDocument();
});

test('un rôle focalisé peut être activé au clavier', async () => {
  const client = renderApp('consultant', ['consultant', 'admin_agence']);
  const trigger = (await screen.findAllByRole('button', { name: /Consultant/ }))[0];
  fireEvent.click(trigger);
  const consultant = screen.getByRole('menuitemradio', { name: 'Consultant' });
  const admin = screen.getByRole('menuitemradio', { name: 'Administrateur d’agence' });
  await waitFor(() => expect(consultant).toHaveFocus());
  fireEvent.keyDown(consultant, { key: 'ArrowDown' });
  fireEvent.keyDown(admin, { key: 'Enter' });
  await waitFor(() => expect(client.changeRole).toHaveBeenCalledWith('admin_agence'));
  expect(await screen.findByRole('button', { name: 'Administration' })).toBeInTheDocument();
});

test('les raccourcis du tableau de bord ouvrent un parcours réel', async () => {
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: 'Ouvrir Patrimoine' }));
  expect(await screen.findByRole('heading', { name: 'Patrimoine' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Accueil' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Nouvelle opportunité' }));
  expect(await screen.findByRole('dialog', { name: 'Créer société' })).toBeInTheDocument();
});

test('le tableau de bord ne présente aucune donnée métier simulée', async () => {
  renderApp('consultant');
  await screen.findByRole('heading', { name: /Bienvenue, Julie/i });
  expect(screen.queryByText('128 actifs')).not.toBeInTheDocument();
  expect(screen.queryByText('42 sociétés')).not.toBeInTheDocument();
  expect(screen.queryByText('86 %')).not.toBeInTheDocument();
});

test('les utilitaires visibles expliquent leur disponibilité au lieu de rester muets', async () => {
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: 'Notifications' }));
  const notifications = screen.getByRole('dialog', { name: 'Notifications' });
  expect(notifications).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Fermer' })[1]);
  fireEvent.click(screen.getByRole('button', { name: 'Ouvrir l’assistant IA' }));
  expect(screen.getByRole('dialog', { name: 'Assistant IA' })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog', { name: 'Assistant IA' })).not.toBeInTheDocument();
});

test.each([
  ['consultant', false],
  ['master_consultant', false],
  ['directeur_agence', true],
  ['admin_agence', true],
  ['super_admin', true],
])('la navigation du rôle %s respecte son périmètre', async (role, hasAdministration) => {
  renderApp(role);
  await screen.findByRole('navigation', { name: 'Navigation principale' });
  expect(Boolean(screen.queryByRole('button', { name: 'Administration' }))).toBe(hasAdministration);
});

test('un rôle inconnu affiche une issue explicite au lieu de produire un écran blanc', async () => {
  const client = renderApp('Master consultant');
  expect(await screen.findByRole('heading', { name: 'Rôle non reconnu' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));
  expect(client.logout).toHaveBeenCalled();
});

test('la navigation mobile s’ouvre, navigue puis se referme', async () => {
  renderApp('consultant');
  const menu = await screen.findByRole('button', { name: 'Ouvrir la navigation' });
  fireEvent.click(menu);
  expect(screen.getByRole('button', { name: 'Fermer la navigation' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'CRM' }));
  expect(await screen.findByRole('heading', { name: 'CRM' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Fermer la navigation' })).not.toBeInTheDocument();
});

test('la marque complète et les noms accessibles restent présents lorsque la navigation est repliée', async () => {
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: 'Replier la barre latérale' }));
  const words = [...document.querySelectorAll('[data-logo-word]')].map((node) => node.textContent);
  expect(words.every((word) => word === 'orIAna')).toBe(true);
  expect(screen.getByRole('button', { name: 'Patrimoine' })).toBeInTheDocument();
  expect(screen.getByRole('tooltip', { name: 'Patrimoine' })).toBeInTheDocument();
});

test('la navigation utilise un fond sombre dédié dans tous les thèmes', async () => {
  renderApp('consultant');
  const sidebar = await screen.findByLabelText('Navigation latérale');
  expect(sidebar).toHaveClass('bg-oriana-navigation/92', 'backdrop-blur-md');
});

test('le statut de l’API repose sur le contrôle health réel', async () => {
  renderApp('consultant');
  expect(await screen.findByText('API : Disponible')).toBeInTheDocument();
});

test('la recherche indisponible reste une action clavier explicite', async () => {
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: /Rechercher un bien/i }));
  expect(screen.getByRole('dialog', { name: 'Recherche globale' })).toBeInTheDocument();
});

test('un lien d’évitement conduit directement au contenu principal', async () => {
  renderApp('consultant');
  const skipLink = await screen.findByRole('link', { name: 'Aller au contenu' });
  expect(skipLink).toHaveAttribute('href', '#contenu');
  expect(document.querySelector('#contenu')).toBeInTheDocument();
});

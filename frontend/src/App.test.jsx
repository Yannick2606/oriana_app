import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SessionProvider } from './auth/SessionContext';

vi.mock('./api/crm', () => ({ crmApi: { listAll: vi.fn().mockResolvedValue({ societes: [], contacts: [], demandes: [], lots: [] }), matching: vi.fn() } }));
vi.mock('./api/patrimoine', () => ({ patrimoineApi: { listAll: vi.fn().mockResolvedValue({ sites: [], batiments: [], cellules: [], lots: [] }) } }));

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });

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

test('les raccourcis du tableau de bord ouvrent un parcours réel', async () => {
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: 'Voir le patrimoine' }));
  expect(await screen.findByRole('heading', { name: 'Patrimoine' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Accueil' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Nouvelle opportunité' }));
  expect(await screen.findByRole('dialog', { name: 'Créer société' })).toBeInTheDocument();
});

test('les utilitaires visibles expliquent leur disponibilité au lieu de rester muets', async () => {
  renderApp('consultant');
  fireEvent.click(await screen.findByRole('button', { name: 'Notifications' }));
  const notifications = screen.getByRole('dialog', { name: 'Notifications' });
  expect(notifications).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Fermer' })[1]);
  fireEvent.click(screen.getByRole('button', { name: 'Ouvrir l’assistant IA' }));
  expect(screen.getByRole('dialog', { name: 'Assistant IA' })).toBeInTheDocument();
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

test('la navigation mobile s’ouvre, navigue puis se referme', async () => {
  renderApp('consultant');
  const menu = await screen.findByRole('button', { name: 'Ouvrir la navigation' });
  fireEvent.click(menu);
  expect(screen.getByRole('button', { name: 'Fermer la navigation' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'CRM' }));
  expect(await screen.findByRole('heading', { name: 'CRM' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Fermer la navigation' })).not.toBeInTheDocument();
});

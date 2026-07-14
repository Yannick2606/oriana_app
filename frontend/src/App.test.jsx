import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SessionProvider } from './auth/SessionContext';

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
  renderApp('manager');
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

test('un manager voit le périmètre agence sans écran admin', async () => {
  renderApp('manager');
  expect(await screen.findByText(/activité de votre agence/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
});

test('un admin accède à l’administration et peut ouvrir sa vue', async () => {
  renderApp('admin');
  const administration = await screen.findByRole('button', { name: 'Administration' });
  fireEvent.click(administration);
  expect(screen.getByRole('heading', { name: 'Administration' })).toBeInTheDocument();
});

test('un utilisateur multirôle change de rôle sans nouvelle connexion', async () => {
  const client = renderApp('consultant', ['consultant', 'admin']);
  const switchers = await screen.findAllByRole('button', { name: /Consultant/ });
  fireEvent.click(switchers[0]);
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Administrateur' }));
  expect(await screen.findByRole('button', { name: 'Administration' })).toBeInTheDocument();
  expect(client.changeRole).toHaveBeenCalledWith('admin');
});

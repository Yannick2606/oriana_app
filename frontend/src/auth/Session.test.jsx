import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../api';
import { ProtectedRoute } from './ProtectedRoute';
import { SessionProvider } from './SessionContext';

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });

function renderSession(client) {
  return render(<SessionProvider client={client}><ProtectedRoute><h1>Espace protégé</h1></ProtectedRoute></SessionProvider>);
}

test('un utilisateur non connecté reste sur la connexion', async () => {
  const client = { me: vi.fn().mockRejectedValue(new ApiError('Non authentifié', 401, {})), login: vi.fn(), logout: vi.fn(), changeRole: vi.fn() };
  renderSession(client);
  expect(await screen.findByRole('heading', { name: 'Bienvenue' })).toBeInTheDocument();
  expect(screen.queryByText('Espace protégé')).not.toBeInTheDocument();
});

test('la connexion ouvre l’espace protégé sans stockage navigateur', async () => {
  const ephemeralPassword = randomUUID();
  const user = { id: 1, prenom: 'Julie', nom: 'Martin', roles: ['consultant'], role_actif: 'consultant' };
  const client = { me: vi.fn().mockRejectedValue(new ApiError('Non authentifié', 401, {})), login: vi.fn().mockResolvedValue({ user }), logout: vi.fn() };
  const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
  renderSession(client);
  fireEvent.change(await screen.findByLabelText('Adresse email'), { target: { value: 'julie@example.test' } });
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: ephemeralPassword } });
  fireEvent.click(screen.getByRole('button', { name: /Se connecter/ }));
  expect(await screen.findByText('Espace protégé')).toBeInTheDocument();
  expect(client.login).toHaveBeenCalledWith({ email: 'julie@example.test', motDePasse: ephemeralPassword, roleActif: undefined });
  expect(localStorageSpy).not.toHaveBeenCalled();
  localStorageSpy.mockRestore();
});

test('un compte multirôle choisit le rôle actif avant ouverture', async () => {
  const ephemeralPassword = randomUUID();
  const user = { id: 1, prenom: 'Julie', nom: 'Martin', roles: ['consultant', 'master_consultant'], role_actif: 'master_consultant' };
  const client = {
    me: vi.fn().mockRejectedValue(new ApiError('Non authentifié', 401, {})),
    login: vi.fn().mockResolvedValueOnce({ selection_role_requise: true, roles: ['consultant', 'master_consultant'] }).mockResolvedValueOnce({ user }),
    logout: vi.fn(),
  };
  renderSession(client);
  fireEvent.change(await screen.findByLabelText('Adresse email'), { target: { value: 'julie@example.test' } });
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: ephemeralPassword } });
  fireEvent.click(screen.getByRole('button', { name: /Se connecter/ }));
  fireEvent.click(await screen.findByRole('button', { name: /Master consultant/ }));
  await waitFor(() => expect(screen.getByText('Espace protégé')).toBeInTheDocument());
  expect(client.login).toHaveBeenLastCalledWith({ email: 'julie@example.test', motDePasse: ephemeralPassword, roleActif: 'master_consultant' });
});

test('un mot de passe provisoire impose son remplacement avant l’espace protégé', async () => {
  const newPassword = randomUUID() + randomUUID();
  const user = {
    id: 1, prenom: 'Julie', nom: 'Martin', roles: ['consultant'], role_actif: 'consultant',
    doit_changer_mot_de_passe: true,
  };
  const client = {
    me: vi.fn().mockResolvedValue({ user }),
    changeInitialPassword: vi.fn().mockResolvedValue({
      user: { ...user, doit_changer_mot_de_passe: false },
    }),
    logout: vi.fn(), login: vi.fn(), changeRole: vi.fn(),
  };
  renderSession(client);
  expect(await screen.findByRole('heading', { name: /Choisissez votre mot de passe/ })).toBeInTheDocument();
  expect(screen.queryByText('Espace protégé')).not.toBeInTheDocument();
  const inputs = screen.getAllByLabelText(/mot de passe/i);
  fireEvent.change(inputs[0], { target: { value: newPassword } });
  fireEvent.change(inputs[1], { target: { value: newPassword } });
  fireEvent.click(screen.getByRole('button', { name: /Enregistrer et accéder/ }));
  expect(await screen.findByText('Espace protégé')).toBeInTheDocument();
  expect(client.changeInitialPassword).toHaveBeenCalledWith(newPassword);
});

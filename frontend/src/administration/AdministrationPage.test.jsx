import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AdministrationPage } from './AdministrationPage';

const users = [
  { id: 11, prenom: 'Marc', nom: 'Master', email: 'marc@example.test', roles: ['master_consultant'], agence_id: 3, actif: true },
  { id: 12, prenom: 'Julie', nom: 'Consultante', email: 'julie@example.test', roles: ['consultant'], agence_id: 3, actif: true, master_consultant_id: null },
  { id: 13, prenom: 'Lina', nom: 'Direction', email: 'lina@example.test', roles: ['directeur_agence'], agence_id: 3, actif: false },
];

function client(overrides = {}) {
  return {
    list: vi.fn().mockResolvedValue({ data: users }),
    update: vi.fn().mockResolvedValue({ data: users[1] }),
    ...overrides,
  };
}

test('présente les comptes et indicateurs réels dans la charte Administration', async () => {
  render(<AdministrationPage user={{ role_actif: 'super_admin' }} client={client()}/>);
  expect(await screen.findByRole('heading', { name: 'Administration' })).toBeInTheDocument();
  expect(screen.getByText('3', { selector: 'p.font-titre' })).toBeInTheDocument();
  expect(screen.getAllByText('1', { selector: 'p.font-titre' })).toHaveLength(2);
  expect(screen.getAllByText('Julie Consultante').length).toBeGreaterThan(0);
  expect(screen.getAllByText('À rattacher').length).toBeGreaterThan(0);
});

test('la prévisualisation expose les comptes sans autoriser leur gestion', async () => {
  const api = client();
  render(<AdministrationPage user={{ role_actif: 'super_admin' }} client={api} readOnly/>);
  expect(await screen.findByText('Administration en lecture seule')).toBeInTheDocument();
  expect(screen.getAllByText('Julie Consultante').length).toBeGreaterThan(0);
  expect(screen.queryByRole('button', { name: 'Gérer' })).not.toBeInTheDocument();
  expect(screen.getAllByText('Lecture seule').length).toBeGreaterThan(0);
  expect(api.update).not.toHaveBeenCalled();
});

test('recherche et filtre les utilisateurs sans simuler de résultat', async () => {
  render(<AdministrationPage user={{ role_actif: 'super_admin' }} client={client()}/>);
  await screen.findAllByText('Marc Master');
  fireEvent.change(screen.getByRole('searchbox', { name: 'Recherche' }), { target: { value: 'Julie' } });
  expect(screen.getAllByText('Julie Consultante').length).toBeGreaterThan(0);
  expect(screen.queryAllByText('Marc Master')).toHaveLength(0);
  fireEvent.change(screen.getByRole('combobox', { name: 'Filtrer par état' }), { target: { value: 'blocked' } });
  expect(screen.getByText('Aucun résultat')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Effacer les filtres' }));
  expect(screen.getAllByText('Marc Master').length).toBeGreaterThan(0);
});

test('un super administrateur modifie les rôles et le rattachement dans le panneau utilisateur', async () => {
  const api = client();
  render(<AdministrationPage user={{ role_actif: 'super_admin' }} client={api}/>);
  await screen.findAllByText('Julie Consultante');
  const row = screen.getAllByRole('row').find((candidate) => within(candidate).queryByText('Julie Consultante'));
  fireEvent.click(within(row).getByRole('button', { name: 'Gérer' }));
  const drawer = screen.getByRole('dialog', { name: 'Gérer Julie Consultante' });
  fireEvent.click(within(drawer).getByRole('checkbox', { name: 'Master consultant' }));
  fireEvent.change(within(drawer).getByRole('combobox', { name: /^Master consultant/ }), { target: { value: '11' } });
  fireEvent.click(within(drawer).getByRole('button', { name: 'Enregistrer' }));
  await waitFor(() => expect(api.update).toHaveBeenCalledWith(12, {
    actif: true,
    master_consultant_id: 11,
    roles: ['consultant', 'master_consultant'],
  }));
  expect(await screen.findByText('Mise à jour enregistrée')).toBeInTheDocument();
});

test('un directeur gère le rattachement sans pouvoir modifier les rôles', async () => {
  const api = client();
  render(<AdministrationPage user={{ role_actif: 'directeur_agence' }} client={api}/>);
  expect(await screen.findByRole('heading', { name: 'Mon équipe' })).toBeInTheDocument();
  const row = screen.getAllByRole('row').find((candidate) => within(candidate).queryByText('Julie Consultante'));
  fireEvent.click(within(row).getByRole('button', { name: 'Gérer' }));
  const drawer = screen.getByRole('dialog', { name: 'Gérer Julie Consultante' });
  expect(within(drawer).queryByRole('checkbox')).not.toBeInTheDocument();
  fireEvent.change(within(drawer).getByRole('combobox', { name: /^Master consultant/ }), { target: { value: '11' } });
  fireEvent.click(within(drawer).getByRole('button', { name: 'Enregistrer' }));
  await waitFor(() => expect(api.update).toHaveBeenCalledWith(12, { actif: true, master_consultant_id: 11 }));
});

test('propose le compte courant comme master sans permettre de le modifier', async () => {
  const protectedMaster = {
    id: 20, prenom: 'Yannick', nom: 'Plateforme', email: 'yannick@example.test',
    roles: ['master_consultant', 'super_admin'], agence_id: 3, actif: true, administrable: false,
  };
  const api = client({ list: vi.fn().mockResolvedValue({ data: [...users, protectedMaster] }) });
  render(<AdministrationPage user={{ id: 20, role_actif: 'super_admin' }} client={api}/>);
  await screen.findAllByText('Yannick Plateforme');
  expect(screen.getAllByText('Compte protégé').length).toBeGreaterThan(0);
  const row = screen.getAllByRole('row').find((candidate) => within(candidate).queryByText('Julie Consultante'));
  fireEvent.click(within(row).getByRole('button', { name: 'Gérer' }));
  expect(within(screen.getByRole('dialog')).getByRole('option', { name: 'Yannick Plateforme' })).toBeInTheDocument();
});

test('explique une erreur de chargement et permet de réessayer', async () => {
  const api = client({ list: vi.fn().mockRejectedValueOnce(new Error('indisponible')).mockResolvedValueOnce({ data: users }) });
  render(<AdministrationPage user={{ role_actif: 'super_admin' }} client={api}/>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger');
  fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
  expect(await screen.findByText('Utilisateurs administrables')).toBeInTheDocument();
});

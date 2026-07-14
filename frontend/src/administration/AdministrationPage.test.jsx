import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AdministrationPage } from './AdministrationPage';

test('un directeur rattache un consultant et bloque un compte inférieur', async () => {
  const users = [
    { id: 11, prenom: 'Marc', nom: 'Master', roles: ['master_consultant'], actif: true },
    { id: 12, prenom: 'Julie', nom: 'Consultante', roles: ['consultant'], actif: true, master_consultant_id: null },
  ];
  const client = { list: vi.fn().mockResolvedValue({ data: users }), update: vi.fn().mockResolvedValue({ data: users[1] }) };
  render(<AdministrationPage user={{ role_actif: 'directeur_agence' }} client={client}/>);
  expect(await screen.findByRole('heading', { name: 'Mon équipe' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Master consultant de Julie Consultante'), { target: { value: '11' } });
  await waitFor(() => expect(client.update).toHaveBeenCalledWith(12, { master_consultant_id: 11 }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Bloquer' })[1]);
  await waitFor(() => expect(client.update).toHaveBeenCalledWith(12, { actif: false }));
});

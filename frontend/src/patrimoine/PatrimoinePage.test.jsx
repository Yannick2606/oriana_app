import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { patrimoineApi } from '../api/patrimoine';
import { PatrimoinePage } from './PatrimoinePage';

vi.mock('../api/patrimoine', () => ({
  patrimoineApi: { listAll: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

const hierarchy = {
  sites: [{ id: 1, nom: 'Parc du Levant', surface_terrain: 12000, gestionnaire: 7, agence_id: 2 }],
  batiments: [{ id: 2, site_id: 1, nom: 'Bâtiment Atlas', numero: 'A', surface_totale: 4200, gestionnaire: 7, agence_id: 2 }],
  cellules: [{ id: 3, batiment_id: 2, nom: 'Cellule Nord', numero: 'C1', surface: 1800, gestionnaire: 7, agence_id: 2 }],
  lots: [{ id: 4, cellules: ['L', 3], nom: 'Lot Logistique', numero: 'L1', surface: 1800, divisible: true, gestionnaire: 7, agence_id: 2 }],
};

beforeEach(() => {
  patrimoineApi.listAll.mockResolvedValue(hierarchy);
  patrimoineApi.create.mockResolvedValue({ data: { id: 9 } });
  patrimoineApi.update.mockResolvedValue({ data: hierarchy.lots[0] });
});

test('parcourt la hiérarchie complète du site au lot', async () => {
  render(<PatrimoinePage/>);
  expect((await screen.findAllByText('Parc du Levant')).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: /Bâtiment Atlas/ }));
  fireEvent.click(screen.getByRole('button', { name: /Cellule Nord/ }));
  fireEvent.click(screen.getByRole('button', { name: /Lot Logistique/ }));
  expect(screen.getByRole('button', { name: /Modifier la fiche/i })).toBeInTheDocument();
  expect(screen.getByText('Divisible')).toBeInTheDocument();
});

test('crée un bâtiment dans le site sélectionné', async () => {
  render(<PatrimoinePage/>);
  await screen.findAllByText('Parc du Levant');
  fireEvent.click(screen.getByRole('button', { name: 'Créer un bâtiment' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Créer un bâtiment');
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Bâtiment Nova' } });
  fireEvent.click(screen.getByRole('button', { name: 'Créer le bâtiment' }));
  await waitFor(() => expect(patrimoineApi.create).toHaveBeenCalledWith('batiments', expect.objectContaining({ nom: 'Bâtiment Nova', site_id: 1 })));
});

test('édite la fiche d’un lot sans modifier son rattachement', async () => {
  render(<PatrimoinePage/>);
  await screen.findAllByText('Parc du Levant');
  fireEvent.click(screen.getByRole('button', { name: /Bâtiment Atlas/ }));
  fireEvent.click(screen.getByRole('button', { name: /Cellule Nord/ }));
  fireEvent.click(screen.getByRole('button', { name: /Lot Logistique/ }));
  fireEvent.click(screen.getByRole('button', { name: /Modifier la fiche/i }));
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Lot Logistique rénové' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
  await waitFor(() => expect(patrimoineApi.update).toHaveBeenCalledWith('lots', 4, expect.objectContaining({ nom: 'Lot Logistique rénové', cellules: [3] })));
});

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
  vi.clearAllMocks();
  patrimoineApi.listAll.mockResolvedValue(hierarchy);
  patrimoineApi.create.mockResolvedValue({ data: { id: 9 } });
  patrimoineApi.update.mockResolvedValue({ data: hierarchy.lots[0] });
});

test('la prévisualisation permet de parcourir le patrimoine sans commande d’écriture', async () => {
  render(<PatrimoinePage readOnly/>);
  expect(await screen.findByText('Données fictives en lecture seule')).toBeInTheDocument();
  expect(screen.getAllByText('Parc du Levant').length).toBeGreaterThan(0);
  expect(screen.queryByRole('button', { name: 'Nouveau site' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Créer un/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Modifier la fiche/i })).not.toBeInTheDocument();
  expect(patrimoineApi.create).not.toHaveBeenCalled();
  expect(patrimoineApi.update).not.toHaveBeenCalled();
});

test('parcourt la hiérarchie complète du site au lot', async () => {
  render(<PatrimoinePage/>);
  expect((await screen.findAllByText('Parc du Levant')).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('tab', { name: 'Bâtiments · 1' }));
  fireEvent.click(screen.getByRole('button', { name: /Bâtiment Atlas/ }));
  fireEvent.click(screen.getByRole('tab', { name: 'Cellules · 1' }));
  fireEvent.click(screen.getByRole('button', { name: /Cellule Nord/ }));
  fireEvent.click(screen.getByRole('tab', { name: 'Lots · 1' }));
  fireEvent.click(screen.getByRole('button', { name: /Lot Logistique/ }));
  expect(screen.getByRole('button', { name: /Modifier la fiche/i })).toBeInTheDocument();
  expect(screen.getByText('Divisible')).toBeInTheDocument();
});

test('crée un bâtiment dans le site sélectionné', async () => {
  render(<PatrimoinePage/>);
  await screen.findAllByText('Parc du Levant');
  fireEvent.click(screen.getByRole('tab', { name: 'Bâtiments · 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Créer un bâtiment' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Créer un bâtiment');
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Bâtiment Nova' } });
  fireEvent.click(screen.getByRole('button', { name: 'Créer le bâtiment' }));
  await waitFor(() => expect(patrimoineApi.create).toHaveBeenCalledWith('batiments', expect.objectContaining({ nom: 'Bâtiment Nova', site_id: 1 })));
});

test('édite la fiche d’un lot sans modifier son rattachement', async () => {
  render(<PatrimoinePage/>);
  await screen.findAllByText('Parc du Levant');
  fireEvent.click(screen.getByRole('tab', { name: 'Bâtiments · 1' }));
  fireEvent.click(screen.getByRole('button', { name: /Bâtiment Atlas/ }));
  fireEvent.click(screen.getByRole('tab', { name: 'Cellules · 1' }));
  fireEvent.click(screen.getByRole('button', { name: /Cellule Nord/ }));
  fireEvent.click(screen.getByRole('tab', { name: 'Lots · 1' }));
  fireEvent.click(screen.getByRole('button', { name: /Lot Logistique/ }));
  fireEvent.click(screen.getByRole('button', { name: /Modifier la fiche/i }));
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Lot Logistique rénové' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
  await waitFor(() => expect(patrimoineApi.update).toHaveBeenCalledWith('lots', 4, expect.objectContaining({ nom: 'Lot Logistique rénové', cellules: [3] })));
});

test('filtre le niveau actif sans perdre le contexte de rattachement', async () => {
  render(<PatrimoinePage/>);
  await screen.findAllByText('Parc du Levant');
  fireEvent.click(screen.getByRole('tab', { name: 'Bâtiments · 1' }));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Recherche' }), { target: { value: 'Atlas' } });
  fireEvent.click(screen.getByRole('button', { name: /Bâtiment Atlas/ }));
  expect(screen.getByRole('navigation', { name: 'Rattachement de l’actif' })).toHaveTextContent('Parc du Levant');
  expect(screen.getByRole('navigation', { name: 'Rattachement de l’actif' })).toHaveTextContent('Bâtiment Atlas');
  fireEvent.click(screen.getByRole('tab', { name: 'Sites · 1' }));
  expect(screen.getByRole('navigation', { name: 'Rattachement de l’actif' })).not.toHaveTextContent('Bâtiment Atlas');
});

test('guide le parcours vers le niveau suivant depuis la fiche active', async () => {
  render(<PatrimoinePage readOnly/>);
  await screen.findAllByText('Parc du Levant');
  fireEvent.click(screen.getByRole('button', { name: 'Explorer les bâtiments' }));
  expect(screen.getByRole('tab', { name: 'Bâtiments · 1' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(screen.getByRole('button', { name: /Bâtiment Atlas/ }));
  expect(screen.getByRole('navigation', { name: 'Rattachement de l’actif' })).toHaveTextContent('Parc du Levant');
  expect(screen.getByRole('button', { name: 'Explorer les cellules' })).toBeInTheDocument();
});

test('revient explicitement de la fiche vers la liste sur le parcours mobile', async () => {
  render(<PatrimoinePage readOnly/>);
  await screen.findAllByText('Parc du Levant');
  fireEvent.click(screen.getByRole('button', { name: /Parc du Levant/ }));
  const list = screen.getByRole('region', { name: 'Liste des sites' });
  const detail = screen.getByRole('region', { name: 'Fiche de l’actif sélectionné' });
  expect(list).toHaveClass('hidden');
  expect(detail).not.toHaveClass('hidden');
  fireEvent.click(screen.getByRole('button', { name: 'Retour à la liste' }));
  expect(list).not.toHaveClass('hidden');
  expect(detail).toHaveClass('hidden');
});

test('propose une reprise après une indisponibilité de chargement', async () => {
  patrimoineApi.listAll.mockReset().mockRejectedValueOnce(new Error('indisponible')).mockResolvedValue(hierarchy);
  render(<PatrimoinePage readOnly/>);
  expect(await screen.findByText('Action impossible')).toBeInTheDocument();
  expect(screen.getByText('Le patrimoine n’a pas pu être chargé.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Actualiser' }));
  expect((await screen.findAllByText('Parc du Levant')).length).toBeGreaterThan(0);
});

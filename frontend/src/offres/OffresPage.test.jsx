import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { offresApi } from '../api/offres';
import { OffresPage } from './OffresPage';

vi.mock('../api/offres', () => ({
  offresApi: { listAll: vi.fn(), createOffer: vi.fn(), updateOffer: vi.fn(), createCondition: vi.fn(), updateCondition: vi.fn() },
}));

const data = {
  lots: [{ id: 10, nom: 'Lot Horizon' }],
  offers: [{ id: 20, numero: 'OFF-20', nom: 'Horizon flexible', lot_id: 10, nature: 'vente_et_location', occupation: 'libre' }],
  conditions: [
    { id: 30, offre_id: 20, type: 'vente', prix_vente: 1250000, disponibilite: 'Immédiate' },
    { id: 31, offre_id: 20, type: 'location', loyer_ht_m2_an: 145, disponibilite: 'Immédiate' },
  ],
};

beforeEach(() => {
  offresApi.listAll.mockResolvedValue(data);
  offresApi.createOffer.mockResolvedValue({ data: { id: 21 } });
  offresApi.updateOffer.mockResolvedValue({ data: data.offers[0] });
  offresApi.createCondition.mockResolvedValue({ data: { id: 32 } });
  offresApi.updateCondition.mockResolvedValue({ data: data.conditions[0] });
});

test('une offre double nature affiche ses deux jeux de conditions', async () => {
  render(<OffresPage/>);
  expect(await screen.findByRole('heading', { name: 'Horizon flexible' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Conditions de vente' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Conditions de location' })).toBeInTheDocument();
  expect(screen.getByText(/1.250.000 €/)).toBeInTheDocument();
  expect(screen.getAllByText(/145 €/).length).toBeGreaterThan(0);
});

test('modifie indépendamment les conditions de vente', async () => {
  render(<OffresPage/>);
  const saleCard = (await screen.findByRole('heading', { name: 'Conditions de vente' })).closest('section');
  fireEvent.click(within(saleCard).getByRole('button', { name: 'Modifier' }));
  fireEvent.change(within(saleCard).getByLabelText('Prix de vente (€)'), { target: { value: '1180000' } });
  fireEvent.click(within(saleCard).getByRole('button', { name: 'Enregistrer les conditions' }));
  await waitFor(() => expect(offresApi.updateCondition).toHaveBeenCalledWith(30, expect.objectContaining({ prix_vente: 1180000 })));
});

test('crée une offre sur un lot avec la nature choisie', async () => {
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });
  fireEvent.click(screen.getByRole('button', { name: 'Nouvelle offre' }));
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Nouvelle location' } });
  fireEvent.change(screen.getByLabelText('Lot commercialisé'), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText('Nature'), { target: { value: 'location' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer l’offre' }));
  await waitFor(() => expect(offresApi.createOffer).toHaveBeenCalledWith(expect.objectContaining({ nom: 'Nouvelle location', lot_id: 10, nature: 'location' })));
});

test('les onglets ouvrent de nouvelles vues métier', async () => {
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });
  fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
  expect(screen.getByRole('heading', { name: 'Actions commerciales' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Documents' }));
  expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Transactions' }));
  expect(screen.getByRole('heading', { name: 'Transactions et négociations' })).toBeInTheDocument();
});

test('une offre locative masque les conditions de vente', async () => {
  offresApi.listAll.mockResolvedValue({
    ...data,
    offers: [{ ...data.offers[0], nature: 'location' }],
    conditions: [data.conditions[1]],
  });
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });
  expect(screen.getByText('À louer')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Conditions de location' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Conditions de vente' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Transactions' }));
  expect(screen.getByRole('heading', { name: 'Négociations locatives' })).toBeInTheDocument();
});

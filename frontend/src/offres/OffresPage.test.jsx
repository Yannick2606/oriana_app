import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { offresApi } from '../api/offres';
import { OffresPage } from './OffresPage';

vi.mock('../api/offres', () => ({
  offresApi: {
    listAll: vi.fn(), createOffer: vi.fn(), updateOffer: vi.fn(),
    createCondition: vi.fn(), updateCondition: vi.fn(),
  },
}));

const data = {
  lots: [{ id: 10, nom: 'Lot Horizon', cellules: ['L', 40] }, { id: 11, nom: 'Lot Atlas', cellules: ['L', 41] }],
  cells: [{ id: 40, type_bien: 'activite' }, { id: 41, type_bien: 'logistique' }],
  offers: [{
    id: 20, numero: 'OFF-20', nom: 'Horizon flexible', lot_id: 10,
    nature: 'vente_et_location', occupation: 'libre', ville: 'Gonesse', code_postal: '95500',
  }, {
    id: 21, numero: 'OFF-21', nom: 'Atlas logistique', lot_id: 11,
    nature: 'location', occupation: 'libre', ville: 'Mitry-Mory', code_postal: '77290',
  }],
  conditions: [
    { id: 30, offre_id: 20, type: 'vente', prix_vente: 1250000, disponibilite: 'Immédiate' },
    { id: 31, offre_id: 20, type: 'location', loyer_ht_m2_an: 145, disponibilite: 'Immédiate' },
  ],
};

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  offresApi.listAll.mockResolvedValue(data);
  offresApi.createOffer.mockResolvedValue({ data: { id: 21 } });
  offresApi.updateOffer.mockResolvedValue({ data: data.offers[0] });
  offresApi.createCondition.mockResolvedValue({ data: { id: 32 } });
  offresApi.updateCondition.mockResolvedValue({ data: data.conditions[0] });
});

async function openFinances() {
  await screen.findByRole('heading', { name: 'Horizon flexible' });
  fireEvent.click(screen.getByRole('tab', { name: 'Finances' }));
}

test('une offre double nature affiche ses deux jeux de conditions', async () => {
  render(<OffresPage/>);
  await openFinances();
  expect(screen.getByRole('heading', { name: 'Conditions de vente' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Conditions de location' })).toBeInTheDocument();
  expect(screen.getByText(/1.250.000 €/)).toBeInTheDocument();
  expect(screen.getByText('145 €')).toBeInTheDocument();
});

test('modifie indépendamment les conditions de vente', async () => {
  render(<OffresPage/>);
  await openFinances();
  const saleCard = screen.getByRole('heading', { name: 'Conditions de vente' }).closest('section');
  fireEvent.click(within(saleCard).getByRole('button', { name: 'Modifier' }));
  fireEvent.change(within(saleCard).getByLabelText('Prix de vente (€)'), { target: { value: '1180000' } });
  fireEvent.click(within(saleCard).getByRole('button', { name: 'Enregistrer les conditions' }));
  await waitFor(() => expect(offresApi.updateCondition).toHaveBeenCalledWith(
    30, expect.objectContaining({ prix_vente: 1180000 }),
  ));
});

test('signale un échec d’enregistrement des conditions sans fermer le formulaire', async () => {
  offresApi.updateCondition.mockRejectedValueOnce(new Error('indisponible'));
  render(<OffresPage/>);
  await openFinances();
  const saleCard = screen.getByRole('heading', { name: 'Conditions de vente' }).closest('section');
  fireEvent.click(within(saleCard).getByRole('button', { name: 'Modifier' }));
  fireEvent.click(within(saleCard).getByRole('button', { name: 'Enregistrer les conditions' }));
  expect(await within(saleCard).findByRole('alert')).toHaveTextContent(
    'Les conditions financières n’ont pas pu être enregistrées.',
  );
  expect(within(saleCard).getByRole('button', { name: 'Enregistrer les conditions' })).toBeInTheDocument();
});

test('crée une offre sur un lot avec la nature choisie', async () => {
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });
  fireEvent.click(screen.getByRole('button', { name: 'Nouvelle offre' }));
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Nouvelle location' } });
  fireEvent.change(screen.getByLabelText('Lot commercialisé'), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText('Nature'), { target: { value: 'location' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer l’offre' }));
  await waitFor(() => expect(offresApi.createOffer).toHaveBeenCalledWith(expect.objectContaining({
    nom: 'Nouvelle location', lot_id: 10, nature: 'location',
  })));
});

test('recherche et filtre le portefeuille en synchronisant la fiche sélectionnée', async () => {
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });

  fireEvent.change(screen.getByRole('searchbox', { name: 'Recherche' }), { target: { value: 'Mitry' } });
  expect(screen.queryByRole('button', { name: /Horizon flexible/ })).not.toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Atlas logistique' })).toBeInTheDocument();
  expect(screen.getByText('1 offre trouvée sur 2')).toBeInTheDocument();

  fireEvent.change(screen.getByRole('combobox', { name: 'Filtrer par nature' }), { target: { value: 'vente' } });
  expect(screen.getByRole('heading', { name: 'Aucune offre trouvée' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Atlas logistique' })).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Réinitialiser les filtres' })[0]);
  expect(await screen.findByRole('heading', { name: 'Horizon flexible' })).toBeInTheDocument();
  expect(screen.getByText('2 offres trouvées sur 2')).toBeInTheDocument();
});

test('combine le type de bien aux autres filtres et permet de retirer chaque filtre actif', async () => {
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });

  fireEvent.change(screen.getByRole('combobox', { name: 'Filtrer par type de bien' }), { target: { value: 'logistique' } });
  expect(await screen.findByRole('heading', { name: 'Atlas logistique' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Type : Logistique ×' })).toBeInTheDocument();

  fireEvent.change(screen.getByRole('combobox', { name: 'Filtrer par nature' }), { target: { value: 'location' } });
  expect(screen.getByRole('button', { name: 'Nature : Location ×' })).toBeInTheDocument();
  expect(screen.getByText('1 offre trouvée sur 2')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Type : Logistique ×' }));
  expect(screen.getByText('1 offre trouvée sur 2')).toBeInTheDocument();
});

test('propose un parcours liste puis fiche avec retour explicite sur mobile', async () => {
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });
  const search = screen.getByRole('searchbox', { name: 'Recherche' });
  fireEvent.change(search, { target: { value: 'Atlas' } });
  const list = screen.getByRole('region', { name: 'Liste des offres' });
  const detail = screen.getByRole('region', { name: 'Fiche de l’offre sélectionnée' });
  expect(list).not.toHaveClass('hidden');
  expect(detail).toHaveClass('hidden');

  fireEvent.click(screen.getByRole('button', { name: /Atlas logistique/ }));
  expect(list).toHaveClass('hidden');
  expect(detail).not.toHaveClass('hidden');
  fireEvent.click(screen.getByRole('button', { name: 'Retour aux offres' }));
  expect(list).not.toHaveClass('hidden');
  expect(detail).toHaveClass('hidden');
  expect(search).toHaveValue('Atlas');
  expect(screen.getByText('1 offre trouvée sur 2')).toBeInTheDocument();
});

test('navigue au clavier entre les vues de la fiche', async () => {
  render(<OffresPage/>);
  await screen.findByRole('heading', { name: 'Horizon flexible' });
  const synthesisTab = screen.getByRole('tab', { name: 'Synthèse' });
  synthesisTab.focus();
  fireEvent.keyDown(synthesisTab, { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Bien & surfaces' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('heading', { name: 'Patrimoine rattaché' })).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Bien & surfaces' }), { key: 'End' });
  expect(screen.getByRole('tab', { name: 'Transactions' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('heading', { name: 'Transactions non encore disponibles' })).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Transactions' }), { key: 'Home' });
  expect(synthesisTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText('Localisation')).toBeInTheDocument();
});

test('affiche les photographies et les huit vues du bac à sable en lecture seule', async () => {
  window.history.replaceState({}, '', '/?sandbox=1');
  offresApi.listAll.mockResolvedValueOnce({
    ...data,
    source: 'sandbox',
    offers: [{
      ...data.offers[0], photo: '/demo/offres/gonesse-activite-bureaux.webp',
      photo_alt: 'Bâtiment fictif', ville: 'Gonesse', code_postal: '95500',
    }],
    sites: [], buildings: [], cells: [], addresses: [], mandates: [],
    media: [{
      id: 90, offre_id: 20, url: '/demo/offres/gonesse-activite-bureaux.webp',
      alt: 'Bâtiment fictif', provenance: 'Image générée',
    }],
  });
  render(<OffresPage/>);

  expect(await screen.findByRole('heading', { name: 'Horizon flexible' })).toBeInTheDocument();
  expect(screen.getAllByRole('tab')).toHaveLength(8);
  expect(screen.queryByRole('button', { name: 'Nouvelle offre' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('tab', { name: 'Bien & surfaces' }));
  expect(screen.getByRole('heading', { name: 'Patrimoine rattaché' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Finances' }));
  expect(screen.getByRole('heading', { name: 'Conditions de vente' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Conditions de location' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Mandats' }));
  expect(screen.getByRole('heading', { name: 'Aucun mandat lié' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Actions' }));
  expect(screen.getByRole('heading', { name: 'Actions non encore disponibles' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Visites' }));
  expect(screen.getByRole('heading', { name: 'Visites non encore disponibles' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Documents' }));
  expect(screen.getAllByRole('img', { name: 'Bâtiment fictif' })).toHaveLength(2);
  fireEvent.click(screen.getByRole('tab', { name: 'Transactions' }));
  expect(screen.getByRole('heading', { name: 'Transactions non encore disponibles' })).toBeInTheDocument();
  expect(offresApi.listAll).toHaveBeenCalledWith({ sandbox: true });
});

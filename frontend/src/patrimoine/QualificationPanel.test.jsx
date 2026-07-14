import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { qualificationApi } from '../api/qualification';
import { QualificationPanel } from './QualificationPanel';

vi.mock('../api/qualification', () => ({
  qualificationApi: { dictionary: vi.fn(), values: vi.fn(), save: vi.fn() },
}));

const dictionaries = {
  logistique: [{ id: 10, libelle: 'Hauteur libre', type_valeur: 'nombre', unite: 'm', ordre: 1 }],
  bureaux: [{ id: 11, libelle: 'Climatisation', type_valeur: 'bool', ordre: 1 }],
};

beforeEach(() => {
  qualificationApi.dictionary.mockImplementation((family) => Promise.resolve({ data: dictionaries[family] }));
  qualificationApi.values.mockResolvedValue({ data: [] });
  qualificationApi.save.mockResolvedValue({ data: { id: 100 } });
});

test('affiche des champs différents pour un entrepôt et un plateau de bureaux', async () => {
  const { rerender } = render(<QualificationPanel key="logistique" niveau="cellule" bienId={20} famille="logistique"/>);
  expect(await screen.findByLabelText(/Hauteur libre/)).toBeInTheDocument();
  expect(screen.queryByLabelText('Climatisation')).not.toBeInTheDocument();
  rerender(<QualificationPanel key="bureaux" niveau="cellule" bienId={21} famille="bureaux"/>);
  expect(await screen.findByLabelText('Climatisation')).toBeInTheDocument();
  expect(screen.queryByLabelText('Hauteur libre')).not.toBeInTheDocument();
});

test('relit une valeur existante puis enregistre sa modification avec le type attendu', async () => {
  qualificationApi.values.mockResolvedValue({ data: [{ id: 50, caracteristique_id: 10, valeur_nombre: 8.5 }] });
  render(<QualificationPanel niveau="cellule" bienId={20} famille="logistique"/>);
  const height = await screen.findByLabelText(/Hauteur libre/);
  expect(height).toHaveValue(8.5);
  fireEvent.change(height, { target: { value: '9.2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la qualification' }));
  await waitFor(() => expect(qualificationApi.save).toHaveBeenCalledWith({ caracteristique_id: 10, niveau: 'cellule', cellule_id: 20, valeur_nombre: 9.2 }));
  expect(await screen.findByText('Qualification enregistrée.')).toBeInTheDocument();
});

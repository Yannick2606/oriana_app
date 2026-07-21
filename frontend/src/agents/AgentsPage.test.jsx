import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { agentsApi } from '../api/agents';
import { AgentsPage } from './AgentsPage';

vi.mock('../api/agents', () => ({ agentsApi: { listDemandes: vi.fn(), trigger: vi.fn(), status: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  agentsApi.listDemandes.mockResolvedValue({ data: [{ id: 3, secteur_geo: 'Paris', nature_transaction: 'location' }] });
  agentsApi.trigger.mockResolvedValue({ suivi_id: 'x', statut_traitement: 'en_attente' });
  agentsApi.status.mockResolvedValue({ data: { statut_traitement: 'termine', resultat: 'Analyse terminée' } });
});

test('déclenche sans figer puis affiche le résultat après polling', async () => {
  render(<AgentsPage pollInterval={1}/>);
  const button = await screen.findByRole('button', { name: 'Déclencher l’agent' });
  fireEvent.click(button);
  expect(await screen.findByText('Traitement en cours')).toBeInTheDocument();
  expect(agentsApi.trigger).toHaveBeenCalledWith(3);
  await waitFor(() => expect(screen.getByText('Analyse terminée')).toBeInTheDocument());
});

test('la prévisualisation ne charge ni ne simule aucun agent', () => {
  render(<AgentsPage readOnly/>);
  expect(screen.getByText('Agents IA indisponibles dans la prévisualisation')).toBeInTheDocument();
  expect(screen.getByText('Aucun connecteur n’est configuré et aucun traitement n’est simulé.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Déclencher l’agent' })).not.toBeInTheDocument();
  expect(agentsApi.listDemandes).not.toHaveBeenCalled();
  expect(agentsApi.trigger).not.toHaveBeenCalled();
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { FormationExperience } from './FormationExperience';

test('ouvre le parcours à la première connexion et enregistre la progression du rôle', async () => {
  const client = {
    get: vi.fn().mockResolvedValue({ data: { role: 'consultant', progression: { etape: 0, statut: 'a_faire' } } }),
    update: vi.fn()
      .mockResolvedValueOnce({ data: { progression: { etape: 1, statut: 'en_cours' } } })
      .mockResolvedValueOnce({ data: { progression: { etape: 1, statut: 'passe' } } }),
  };
  render(<FormationExperience user={{ role_actif: 'consultant' }} pageVisible client={client}/>);
  expect(await screen.findByText('Bienvenue dans votre espace')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
  await waitFor(() => expect(client.update).toHaveBeenCalledWith({ etape: 1, statut: 'en_cours' }));
  expect(await screen.findByText('Vos modules métier')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Passer' }));
  await waitFor(() => expect(client.update).toHaveBeenCalledWith({ etape: 1, statut: 'passe' }));
  expect(screen.getByRole('heading', { name: 'Auto-formation' })).toBeInTheDocument();
});

test('un parcours déjà passé ne s’ouvre pas automatiquement mais peut recommencer', async () => {
  const client = {
    get: vi.fn().mockResolvedValue({ data: { progression: { etape: 1, statut: 'passe' } } }),
    update: vi.fn().mockResolvedValue({ data: { progression: { etape: 0, statut: 'en_cours' } } }),
  };
  render(<FormationExperience user={{ role_actif: 'directeur_agence' }} pageVisible client={client}/>);
  expect(await screen.findByRole('heading', { name: 'Auto-formation' })).toBeInTheDocument();
  expect(screen.queryByText('Bienvenue dans votre espace')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Recommencer/ }));
  expect(await screen.findByText('Bienvenue dans votre espace')).toBeInTheDocument();
});

test('fait progresser localement le parcours de prévisualisation sans écriture serveur', async () => {
  const client = {
    get: vi.fn().mockResolvedValue({ data: { progression: { etape: 0, statut: 'a_faire' } } }),
    update: vi.fn(),
  };
  render(<FormationExperience user={{ role_actif: 'consultant' }} pageVisible readOnly client={client}/>);

  expect(await screen.findByText('Bienvenue dans votre espace')).toBeInTheDocument();
  expect(screen.getByText('Prévisualisation : progression non enregistrée.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

  expect(await screen.findByText('Vos modules métier')).toBeInTheDocument();
  expect(client.update).not.toHaveBeenCalled();
  expect(screen.queryByText('La progression n’a pas pu être enregistrée.')).not.toBeInTheDocument();
});

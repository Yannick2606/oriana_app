import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { authApi } from '../api/auth';
import { ResetPasswordPage } from './ResetPasswordPage';

test('remplace le mot de passe avec le jeton du lien', async () => {
  const spy = vi.spyOn(authApi, 'resetPassword').mockResolvedValue({ status: 'ok' });
  render(<ResetPasswordPage token="jeton-test"/>);
  fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'nouveau-mot-de-passe-solide' } });
  fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'nouveau-mot-de-passe-solide' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le mot de passe' }));
  expect(await screen.findByText(/Vous pouvez maintenant vous connecter/)).toBeInTheDocument();
  expect(spy).toHaveBeenCalledWith({ token: 'jeton-test', newPassword: 'nouveau-mot-de-passe-solide' });
  spy.mockRestore();
});

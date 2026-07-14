import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';
import { SessionProvider } from './auth/SessionContext';

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });

test('affiche la charte et le repère principal orIAna', async () => {
  const client = { me: vi.fn().mockResolvedValue({ user: { prenom: 'Julie', nom: 'Martin', role_actif: 'manager' } }) };
  render(<SessionProvider client={client}><App/></SessionProvider>);
  expect(screen.getByLabelText(/orIAna/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Un espace simple/i })).toBeInTheDocument();
});

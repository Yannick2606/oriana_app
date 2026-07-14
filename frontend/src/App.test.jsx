import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });

test('affiche la charte et le repère principal orIAna', () => {
  render(<App/>);
  expect(screen.getByLabelText(/orIAna/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Un espace simple/i })).toBeInTheDocument();
});

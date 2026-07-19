import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { PageHeader, Tabs } from './index';

function TabsExample() {
  const [active, setActive] = useState('synthese');
  return <Tabs
    tabs={[{ id: 'synthese', label: 'Synthèse' }, { id: 'finances', label: 'Finances' }]}
    active={active}
    onChange={setActive}
    ariaLabel="Vues de l’offre"
  ><p>Vue {active}</p></Tabs>;
}

test('les onglets relient la sélection à son panneau et se parcourent aux flèches', () => {
  render(<TabsExample/>);
  const synthese = screen.getByRole('tab', { name: 'Synthèse' });
  const finances = screen.getByRole('tab', { name: 'Finances' });
  expect(synthese).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
  fireEvent.keyDown(synthese, { key: 'ArrowRight' });
  expect(finances).toHaveFocus();
  expect(finances).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Vue finances');
});

test('les actions d’en-tête peuvent revenir à la ligne', () => {
  render(<PageHeader eyebrow="Commercialisation" title="Offre" description="Description" actions={<><button>Actualiser</button><button>Créer</button></>}/>);
  expect(screen.getByText('Actualiser').parentElement).toHaveClass('flex-wrap');
});

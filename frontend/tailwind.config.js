/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        oriana: {
          fond: 'rgb(var(--color-bg) / <alpha-value>)',
          fondAlt: 'rgb(var(--color-bg-alt) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          surfaceAlt: 'rgb(var(--color-surface-alt) / <alpha-value>)',
          texte: 'rgb(var(--color-text) / <alpha-value>)',
          discret: 'rgb(var(--color-muted) / <alpha-value>)',
          bordure: 'rgb(var(--color-border) / <alpha-value>)',
          aubergine: '#3D1E4D',
          violet: '#9C27B0',
          lavande: '#B39DDB',
          lavandeMoyen: '#CE93D8',
          lavandeClair: '#F3E5F5',
        },
      },
      fontFamily: { titre: ['Georgia', 'serif'], corps: ['Arial', 'sans-serif'] },
      borderRadius: { oriana: 'var(--radius)' },
      boxShadow: { oriana: 'var(--shadow)', 'oriana-lg': 'var(--shadow-lg)' },
      transitionDuration: { oriana: '180ms' },
    },
  },
  plugins: [],
};

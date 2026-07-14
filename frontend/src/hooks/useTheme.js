import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return { theme, toggleTheme: () => setTheme((value) => value === 'dark' ? 'light' : 'dark') };
}

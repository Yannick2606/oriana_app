import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const current = document.documentElement.dataset.theme;
    return current === 'dark' || current === 'light' ? current : 'dark';
  });
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return { theme, toggleTheme: () => setTheme((value) => value === 'dark' ? 'light' : 'dark') };
}

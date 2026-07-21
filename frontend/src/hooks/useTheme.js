import { useEffect, useState } from 'react';

const themeKey = 'oriana-theme';

function storedTheme() {
  try {
    const value = window.localStorage.getItem(themeKey);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = storedTheme();
    if (stored) return stored;
    const current = document.documentElement.dataset.theme;
    return current === 'dark' || current === 'light' ? current : 'dark';
  });
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  function toggleTheme() {
    setTheme((value) => {
      const nextTheme = value === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(themeKey, nextTheme); } catch { /* préférence non persistée */ }
      return nextTheme;
    });
  }
  return { theme, toggleTheme };
}

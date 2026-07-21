(function initialiseTheme() {
  const themeKey = 'oriana-theme';

  try {
    const storedTheme = window.localStorage.getItem(themeKey);
    document.documentElement.dataset.theme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : 'dark';
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
}());

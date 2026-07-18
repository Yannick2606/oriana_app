const allowedNames = new Set([
  'PATH', 'HOME', 'CI', 'NODE_ENV', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL',
  'NO_COLOR', 'FORCE_COLOR', 'SYSTEMROOT', 'COMSPEC', 'PATHEXT',
  'npm_config_cache', 'npm_config_userconfig',
]);

export function buildChildEnvironment(source = process.env) {
  return Object.fromEntries(
    Object.entries(source).filter(([name, value]) => allowedNames.has(name) && value !== undefined),
  );
}


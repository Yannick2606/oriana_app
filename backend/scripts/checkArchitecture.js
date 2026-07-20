import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROVIDER_MODULES = new Set([
  'backend/src/services/gristClient.js',
  'backend/src/services/mailService.js',
  'backend/src/services/n8nConnector.js',
  'backend/src/services/persistence.js',
  'backend/src/services/postgres.js',
  'backend/src/services/postgresClient.js',
  'backend/src/services/sandboxClient.js',
  'backend/src/services/sessionStore.js',
]);

const PROVIDER_IMPORTERS = new Set([
  'backend/src/server.js',
  'backend/src/services/persistence.js',
]);

function normalized(path) {
  return path.split(sep).join('/');
}

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length;
}

function importsFrom(source) {
  const imports = [];
  const patterns = [
    /^\s*import\s+(?:[^'"\n]*?\sfrom\s*)?['"]([^'"]+)['"]/gm,
    /^\s*export\s+[^'"\n]*?\sfrom\s*['"]([^'"]+)['"]/gm,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.push({ specifier: match[1], line: lineAt(source, match.index) });
    }
  }
  return imports;
}

function resolvedImport(repoRoot, importer, specifier) {
  if (!specifier.startsWith('.')) return null;
  const absolute = resolve(repoRoot, dirname(importer), specifier);
  return normalized(relative(repoRoot, absolute));
}

export function inspectSource({ repoRoot, file, source }) {
  const violations = [];
  const imports = importsFrom(source);

  for (const entry of imports) {
    const target = resolvedImport(repoRoot, file, entry.specifier);
    if (!target) continue;

    if (file.startsWith('backend/src/services/') && target.startsWith('backend/src/middlewares/')) {
      violations.push({ file, line: entry.line, rule: 'backend-service-no-middleware', target });
    }
    if (PROVIDER_MODULES.has(target) && !PROVIDER_IMPORTERS.has(file)) {
      violations.push({ file, line: entry.line, rule: 'backend-provider-composition-only', target });
    }
    if (file.startsWith('frontend/src/') && !target.startsWith('frontend/src/')) {
      violations.push({ file, line: entry.line, rule: 'frontend-stays-inside-src', target });
    }
  }

  const networkPattern = /\b(fetch|XMLHttpRequest|WebSocket)\b/g;
  if (file.startsWith('frontend/src/') && !file.startsWith('frontend/src/api/')) {
    for (const match of source.matchAll(networkPattern)) {
      violations.push({ file, line: lineAt(source, match.index), rule: 'frontend-network-via-api', target: match[1] });
    }
  }
  if (file.startsWith('backend/src/')
    && !['backend/src/services/gristClient.js', 'backend/src/services/n8nConnector.js'].includes(file)) {
    for (const match of source.matchAll(/\bfetch\b/g)) {
      violations.push({ file, line: lineAt(source, match.index), rule: 'backend-network-via-connector', target: 'fetch' });
    }
  }

  return violations;
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(js|jsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

export async function checkArchitecture(repoRoot) {
  const roots = [resolve(repoRoot, 'backend/src'), resolve(repoRoot, 'frontend/src')];
  const violations = [];
  for (const root of roots) {
    for (const absoluteFile of await sourceFiles(root)) {
      const file = normalized(relative(repoRoot, absoluteFile));
      const source = await readFile(absoluteFile, 'utf8');
      violations.push(...inspectSource({ repoRoot, file, source }));
    }
  }
  return violations;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const repoRoot = resolve(dirname(currentFile), '../..');
  const violations = await checkArchitecture(repoRoot);
  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`${violation.file}:${violation.line} ${violation.rule} -> ${violation.target}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Frontières applicatives vérifiées.');
  }
}

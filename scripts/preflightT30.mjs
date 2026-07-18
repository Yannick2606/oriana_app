import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildChildEnvironment } from './preflightT30Environment.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = resolve(root, process.argv[2] || 'docs/T30_PREFLIGHT_REPORT.md');

const runtimeVariables = [
  'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
  'SESSION_SECRET', 'FRONTEND_ORIGIN', 'BACKEND_PUBLIC_URL', 'FRONTEND_PUBLIC_URL',
  'VITE_API_BASE_URL', 'N8N_WEBHOOK_BASE_URL', 'N8N_SHARED_SECRET',
];

const externalProofs = [
  ['T30_OFFSITE_BACKUP_VERIFIED', 'Copie chiffrée hors VPS vérifiée'],
  ['T30_RESTORE_REHEARSAL_VERIFIED', 'Restauration chronométrée réussie'],
  ['T30_FIVE_ROLES_VERIFIED', 'Recette réelle des cinq rôles signée'],
  ['T30_AGENTS_LIVE_VERIFIED', 'Agents asynchrones réels validés'],
  ['T30_MONITORING_VERIFIED', 'Supervision et alertes testées'],
  ['T30_ROLLBACK_VERIFIED', 'Retour arrière répété'],
];

const checks = [
  ['T-30 — isolation des secrets', '.', 'node', ['--test', 'scripts/preflightT30Environment.test.mjs']],
  ['Backend — lint', 'backend', 'npm', ['run', 'lint']],
  ['Backend — tests', 'backend', 'npm', ['test']],
  ['Frontend — lint', 'frontend', 'npm', ['run', 'lint']],
  ['Frontend — tests', 'frontend', 'npm', ['test', '--', '--run']],
  ['Frontend — build', 'frontend', 'npm', ['run', 'build']],
];

function runCheck([label, cwd, command, args]) {
  const result = spawnSync(command, args, {
    cwd: resolve(root, cwd),
    encoding: 'utf8',
    env: buildChildEnvironment(process.env),
    maxBuffer: 10 * 1024 * 1024,
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const backendSummary = output.match(/tests (\d+)[\s\S]*?pass (\d+)[\s\S]*?fail (\d+)[\s\S]*?skipped (\d+)/);
  const frontendSummary = output.match(/Tests\s+(\d+) passed \((\d+)\)/);
  const proof = backendSummary
    ? `${backendSummary[2]}/${backendSummary[1]} réussis, ${backendSummary[3]} échec, ${backendSummary[4]} ignoré`
    : frontendSummary
      ? `${frontendSummary[1]} tests réussis`
      : result.status === 0 ? 'commande réussie' : 'commande en échec';
  return { label, ok: result.status === 0, proof };
}

const commandResults = checks.map(runCheck);
const configResults = runtimeVariables.map((name) => ({ name, ok: Boolean(process.env[name]?.trim()) }));
const proofResults = externalProofs.map(([name, label]) => ({ name, label, ok: process.env[name] === 'true' }));
const blockers = [
  ...commandResults.filter((item) => !item.ok).map((item) => item.label),
  ...configResults.filter((item) => !item.ok).map((item) => `Configuration ${item.name}`),
  ...proofResults.filter((item) => !item.ok).map((item) => item.label),
];
const decision = blockers.length === 0 ? 'PRÊT POUR DÉCISION HUMAINE' : 'NO-GO';
const generatedAt = new Date().toISOString();

const lines = [
  '# T-30 — Rapport de pré-contrôle',
  '',
  `Généré le ${generatedAt}. Ce rapport ne contient aucune valeur de secret et n'autorise pas une bascule.`,
  '',
  `## Résultat : **${decision}**`,
  '',
  '## Contrôles automatisés',
  '',
  '| Contrôle | État | Preuve |',
  '|---|---|---|',
  ...commandResults.map((item) => `| ${item.label} | ${item.ok ? 'VERT' : 'ROUGE'} | ${item.proof} |`),
  '',
  '## Configuration',
  '',
  'Seule la présence est contrôlée ; aucune valeur n’est lue dans le rapport.',
  '',
  '| Variable | État |',
  '|---|---|',
  ...configResults.map((item) => `| \`${item.name}\` | ${item.ok ? 'présente' : 'manquante'} |`),
  '',
  '## Preuves externes',
  '',
  '| Preuve | État |',
  '|---|---|',
  ...proofResults.map((item) => `| ${item.label} | ${item.ok ? 'confirmée' : 'manquante'} |`),
  '',
  '## Bloquants',
  '',
  ...(blockers.length ? blockers.map((item) => `- ${item}`) : ['- Aucun bloquant automatisé. La décision humaine reste obligatoire.']),
  '',
  '## Rappel',
  '',
  'Même sans bloquant, ce rapport signifie uniquement « prêt pour décision humaine ». Il ne vaut jamais autorisation de déployer, de geler Grist ou de basculer la production.',
  '',
];

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, lines.join('\n'), 'utf8');
console.log(`Rapport T-30 écrit : ${reportPath}`);
console.log(`Résultat : ${decision}`);
process.exitCode = blockers.length === 0 ? 0 : 2;

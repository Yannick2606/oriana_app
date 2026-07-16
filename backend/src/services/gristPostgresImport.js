import { field, importConfig, importTables, listValue, referenceValue } from './gristImportMappings.js';

const listRelations = {
  'Utilisateurs.roles': ['utilisateur_roles', 'utilisateur_id', 'role_code'],
  'Sites.parcelles': ['site_parcelles', 'site_id', 'parcelle'],
  'Lots.cellules': ['lot_cellules', 'lot_id', 'cellule_id', 'Cellules'],
  'Ref_Caracteristiques.familles': ['ref_caracteristique_familles', 'caracteristique_id', 'famille_id', 'Ref_Familles'],
  'Ref_Caracteristiques.niveaux': ['ref_caracteristique_niveaux', 'caracteristique_id', 'niveau'],
  'Offres.co_gestionnaires': ['offre_co_gestionnaires', 'offre_id', 'utilisateur_id', 'Utilisateurs'],
  'Demandes.familles': ['demande_familles', 'demande_id', 'famille_id', 'Ref_Familles'],
};

function sourceReference(fields, aliases) { return referenceValue(field(fields, aliases[0], ...aliases.slice(1))); }
function normalizedText(value) { return String(value ?? '').trim().toLocaleLowerCase('fr-FR'); }
function sourceText(fields, aliases) { return field(fields, aliases[0], ...aliases.slice(1)); }
function rejection(table, record, code) { return { source_table: table, legacy_grist_id: Number(record.id), code }; }

export async function readGristSnapshot(client) {
  const snapshot = {};
  for (const table of importTables) snapshot[table] = await client.list(table);
  return snapshot;
}

export function validateSnapshot(snapshot) {
  const rejections = []; const sourceIds = {};
  for (const table of importTables) sourceIds[table] = new Set((snapshot[table] ?? []).map((record) => Number(record.id)));
  for (const table of importTables) {
    const config = importConfig[table];
    for (const record of snapshot[table] ?? []) {
      const values = config.values(record.fields);
      for (const required of config.required ?? []) if (values[required] === null || values[required] === undefined || values[required] === '') rejections.push(rejection(table, record, `CHAMP_REQUIS_${required}`));
      for (const [targetTable, aliases] of Object.values({ ...config.refs, ...config.deferredRefs })) {
        const legacyId = sourceReference(record.fields, aliases);
        if (legacyId && !sourceIds[targetTable]?.has(legacyId)) rejections.push(rejection(table, record, `REFERENCE_ABSENTE_${targetTable}`));
      }
      for (const [targetTable, aliases] of Object.values(config.valueRefs ?? {})) {
        const value = sourceText(record.fields, aliases);
        const target = (snapshot[targetTable] ?? []).find((item) => [item.fields.code, item.fields.libelle].some((candidate) => normalizedText(candidate) === normalizedText(value)));
        if (value && !target) rejections.push(rejection(table, record, `VALEUR_REFERENCE_ABSENTE_${targetTable}`));
      }
      for (const [name, getter] of Object.entries(config.lists ?? {})) {
        const relation = listRelations[`${table}.${name}`];
        if (!relation?.[3]) continue;
        for (const legacyId of listValue(getter(record.fields)).map(referenceValue).filter(Boolean)) {
          if (!sourceIds[relation[3]]?.has(legacyId)) rejections.push(rejection(table, record, `REFERENCE_LISTE_ABSENTE_${relation[3]}`));
        }
      }
    }
  }
  return {
    counts: Object.fromEntries(importTables.map((table) => [table, snapshot[table]?.length ?? 0])),
    rejections,
  };
}

async function targetId(client, config, legacyId) {
  if (!legacyId) return null;
  const result = await client.query(`SELECT ${config.key ?? 'id'} AS id FROM ${config.target} WHERE legacy_grist_id = $1`, [legacyId]);
  return result.rows[0]?.id ?? null;
}

async function upsert(client, table, record) {
  const config = importConfig[table]; const values = config.values(record.fields);
  for (const [column, [targetTable, aliases]] of Object.entries(config.refs ?? {})) {
    values[column] = await targetId(client, importConfig[targetTable], sourceReference(record.fields, aliases));
  }
  for (const [column, [targetTable, aliases]] of Object.entries(config.valueRefs ?? {})) {
    const value = sourceText(record.fields, aliases);
    if (!value) { values[column] = null; continue; }
    const target = importConfig[targetTable];
    const result = await client.query(`SELECT id FROM ${target.target} WHERE lower(code) = lower($1) OR lower(libelle) = lower($1)`, [value]);
    values[column] = result.rows[0]?.id ?? null;
  }
  const key = config.key ?? 'legacy_grist_id';
  if (key === 'legacy_grist_id') values.legacy_grist_id = Number(record.id);
  const entries = Object.entries(values).filter(([, value]) => value !== undefined);
  const columns = entries.map(([column]) => column); const parameters = entries.map(([, value]) => value);
  const conflict = key === 'legacy_grist_id' ? 'legacy_grist_id' : key;
  const updates = columns.filter((column) => column !== conflict).map((column) => `${column} = EXCLUDED.${column}`);
  const result = await client.query(`INSERT INTO ${config.target} (${columns.join(', ')}) VALUES (${parameters.map((_, index) => `$${index + 1}`).join(', ')}) ON CONFLICT (${conflict}) DO UPDATE SET ${updates.join(', ')} RETURNING ${config.key ?? 'id'} AS id`, parameters);
  return result.rows[0].id;
}

async function replaceLists(client, snapshot, ids) {
  for (const table of importTables) {
    const config = importConfig[table];
    for (const record of snapshot[table] ?? []) {
      const ownerId = ids[table].get(Number(record.id));
      for (const [name, getter] of Object.entries(config.lists ?? {})) {
        const [joinTable, ownerColumn, valueColumn, targetTable] = listRelations[`${table}.${name}`];
        await client.query(`DELETE FROM ${joinTable} WHERE ${ownerColumn} = $1`, [ownerId]);
        for (const rawValue of listValue(getter(record.fields))) {
          const value = targetTable ? ids[targetTable].get(referenceValue(rawValue)) : rawValue;
          await client.query(`INSERT INTO ${joinTable} (${ownerColumn}, ${valueColumn}) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [ownerId, value]);
        }
      }
    }
  }
}

async function applyDeferred(client, snapshot, ids) {
  for (const table of importTables) {
    const config = importConfig[table];
    for (const record of snapshot[table] ?? []) {
      for (const [column, [targetTable, aliases]] of Object.entries(config.deferredRefs ?? {})) {
        const legacyId = sourceReference(record.fields, aliases);
        await client.query(`UPDATE ${config.target} SET ${column} = $1 WHERE ${config.key ?? 'id'} = $2`, [legacyId ? ids[targetTable].get(legacyId) : null, ids[table].get(Number(record.id))]);
      }
    }
  }
}

export async function importSnapshot(pool, snapshot) {
  const validation = validateSnapshot(snapshot);
  if (validation.rejections.length) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const run = await client.query("INSERT INTO import_grist_runs(mode, statut, source_counts, finished_at) VALUES ('import', 'rejete', $1, now()) RETURNING id", [validation.counts]);
      for (const item of validation.rejections) await client.query('INSERT INTO import_grist_rejections(run_id, source_table, legacy_grist_id, code) VALUES ($1, $2, $3, $4)', [run.rows[0].id, item.source_table, item.legacy_grist_id, item.code]);
      for (const table of importTables) {
        const rejected = validation.rejections.filter((item) => item.source_table === table).length;
        await client.query('INSERT INTO import_grist_table_counts(run_id, source_table, source_count, imported_count, rejected_count) VALUES ($1, $2, $3, 0, $4)', [run.rows[0].id, table, validation.counts[table], rejected]);
      }
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
    return { ...validation, imported: false };
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const runResult = await client.query("INSERT INTO import_grist_runs(mode, statut, source_counts) VALUES ('import', 'en_cours', $1) RETURNING id", [validation.counts]);
    const runId = runResult.rows[0].id; const ids = {};
    for (const table of importTables) {
      ids[table] = new Map();
      for (const record of snapshot[table] ?? []) ids[table].set(Number(record.id), await upsert(client, table, record));
    }
    await applyDeferred(client, snapshot, ids); await replaceLists(client, snapshot, ids);
    for (const table of importTables) await client.query('INSERT INTO import_grist_table_counts(run_id, source_table, source_count, imported_count, rejected_count) VALUES ($1, $2, $3, $3, 0)', [runId, table, validation.counts[table]]);
    const targetCounts = {};
    for (const table of importTables) { const result = await client.query(`SELECT count(*)::integer AS count FROM ${importConfig[table].target}`); targetCounts[table] = result.rows[0].count; }
    await client.query("UPDATE import_grist_runs SET statut = 'reussi', finished_at = now(), target_counts = $2 WHERE id = $1", [runId, targetCounts]);
    await client.query('COMMIT');
    return { counts: validation.counts, targetCounts, rejections: [], imported: true, runId };
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

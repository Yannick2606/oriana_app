const tableDefinitions = {
  Agences: { table: 'agences', fields: { nom: 'nom', ville: 'ville', actif: 'actif' } },
  Adresses: { table: 'adresses', fields: { numero: 'numero', voie: 'voie', complement: 'complement', code_postal: 'code_postal', ville: 'ville', departement: 'departement', adresse_formatee: 'adresse_formatee', latitude: 'latitude', longitude: 'longitude', infos_acces: 'infos_acces', agence_id: 'agence_id' } },
  Utilisateurs: {
    table: 'utilisateurs',
    fields: { nom: 'nom', prenom: 'prenom', email: 'email', mot_de_passe_hash: 'mot_de_passe_hash', agence_id: 'agence_id', master_consultant_id: 'master_consultant_id', actif: 'actif', derniere_connexion: 'derniere_connexion', doit_changer_mot_de_passe: 'doit_changer_mot_de_passe', reset_mot_de_passe_hash: 'reset_mot_de_passe_hash', reset_mot_de_passe_expiration: 'reset_mot_de_passe_expiration', progression_formation: 'progression_formation', session_version: 'session_version' },
    lists: { role: { table: 'utilisateur_roles', owner: 'utilisateur_id', value: 'role_code' } },
  },
  Ref_Roles: { table: 'roles', primaryKey: 'code', fields: { code: 'code', perimetre: 'perimetre' } },
  Ref_Familles: { table: 'ref_familles', fields: { code: 'code', libelle: 'libelle' } },
  Societes: { table: 'societes', fields: { raison_sociale: 'raison_sociale', enseigne: 'enseigne', siren: 'siren', siret: 'siret', code_ape: 'code_ape', libelle_ape: 'libelle_ape', forme_juridique: 'forme_juridique', capital: 'capital', effectif_salarie: 'effectif_salarie', adresse_siege: 'adresse_siege_id', contact_principal: 'contact_principal_id', type_relation: 'type_relation', gestionnaire: 'gestionnaire_id', donnee_exclusive: 'donnee_exclusive', agence_id: 'agence_id' } },
  Contacts: { table: 'contacts', fields: { nom: 'nom', prenom: 'prenom', fonction: 'fonction', email: 'email', tel: 'tel', mobile: 'mobile', societe_id: 'societe_id', gestionnaire: 'gestionnaire_id', donnee_exclusive: 'donnee_exclusive', agence_id: 'agence_id' } },
  Sites: { table: 'sites', fields: { nom: 'nom', adresse_id: 'adresse_id', proprietaire_id: 'proprietaire_id', type_site: 'type_site', surface_terrain: 'surface_terrain', surface_totale: 'surface_totale', section_cadastrale: 'section_cadastrale', divisible: 'divisible', reserve_fonciere: 'reserve_fonciere', servitudes: 'servitudes', en_bloc: 'en_bloc', gestionnaire: 'gestionnaire_id', agence_id: 'agence_id' }, lists: { parcelles: { table: 'site_parcelles', owner: 'site_id', value: 'parcelle' } } },
  Batiments: { table: 'batiments', fields: { site_id: 'site_id', nom: 'nom', numero: 'numero', annee_construction: 'annee_construction', surface_totale: 'surface_totale', etat: 'etat', divisible: 'divisible', copropriete: 'copropriete', erp: 'erp', igh: 'igh', erp_categorie: 'erp_categorie', erp_type: 'erp_type', destination_plu: 'destination_plu', decret_tertiaire: 'decret_tertiaire', gestionnaire: 'gestionnaire_id', agence_id: 'agence_id' } },
  Cellules: { table: 'cellules', fields: { batiment_id: 'batiment_id', nom: 'nom', numero: 'numero', surface: 'surface', etage: 'etage', type_bien: 'type_bien_id', gestionnaire: 'gestionnaire_id', agence_id: 'agence_id' } },
  Lots: { table: 'lots', fields: { nom: 'nom', reference_lot: 'reference_lot', numero: 'numero', site_id: 'site_id', batiment_id: 'batiment_id', surface: 'surface', divisible: 'divisible', nombre_parking: 'nombre_parking', en_bloc: 'en_bloc', etage: 'etage', usage: 'usage_id', type_transaction: 'type_transaction', loyer_annuel: 'loyer_annuel', prix_vente: 'prix_vente', charges: 'charges', statut_commercial: 'statut_commercial', date_disponibilite: 'date_disponibilite', gestionnaire: 'gestionnaire_id', agence_id: 'agence_id' }, lists: { cellules: { table: 'lot_cellules', owner: 'lot_id', value: 'cellule_id' } } },
  Ref_Categories_Carac: { table: 'ref_categories_caracteristiques', fields: { libelle: 'libelle', ordre: 'ordre' } },
  Ref_Caracteristiques: { table: 'ref_caracteristiques', fields: { libelle: 'libelle', categorie_id: 'categorie_id', type_valeur: 'type_valeur', unite: 'unite', ordre: 'ordre' }, lists: { familles: { table: 'ref_caracteristique_familles', owner: 'caracteristique_id', value: 'famille_id' }, niveaux: { table: 'ref_caracteristique_niveaux', owner: 'caracteristique_id', value: 'niveau' } } },
  Caracteristiques_Bien: { table: 'caracteristiques_bien', fields: { caracteristique_id: 'caracteristique_id', niveau: 'niveau', batiment_id: 'batiment_id', cellule_id: 'cellule_id', lot_id: 'lot_id', valeur_bool: 'valeur_bool', valeur_nombre: 'valeur_nombre', valeur_texte: 'valeur_texte', agence_id: 'agence_id' } },
  Offres: { table: 'offres', fields: { numero: 'numero', nom: 'nom', lot_id: 'lot_id', nature: 'nature', type_contrat: 'type_contrat', occupation: 'occupation', stade_commercialisation: 'stade_commercialisation', gestionnaire: 'gestionnaire_id', agence_id: 'agence_id' }, lists: { co_gestionnaires: { table: 'offre_co_gestionnaires', owner: 'offre_id', value: 'utilisateur_id' } } },
  Conditions_Financieres: { table: 'conditions_financieres', fields: { offre_id: 'offre_id', type: 'type', prix_vente: 'prix_vente', loyer_ht_m2_an: 'loyer_ht_m2_an', loyer_global_an: 'loyer_global_an', charges_ht_m2_an: 'charges_ht_m2_an', depot_garantie: 'depot_garantie', taxe_fonciere: 'taxe_fonciere', teom: 'teom', cfe: 'cfe', taux_net_initial: 'taux_net_initial', taux_net_potentiel: 'taux_net_potentiel', disponibilite: 'disponibilite' } },
  Mandats: { table: 'mandats', fields: { numero: 'numero', numero_registre: 'numero_registre', offre_id: 'offre_id', societe_mandante: 'societe_mandante_id', type: 'type', nature: 'nature', avancement: 'avancement', date_debut: 'date_debut', date_fin: 'date_fin', honoraires_mode: 'honoraires_mode', honoraires_montant: 'honoraires_montant', honoraires_charge: 'honoraires_charge', gestionnaire: 'gestionnaire_id', donnee_exclusive: 'donnee_exclusive', agence_id: 'agence_id' } },
  Demandes: { table: 'demandes', fields: { societe_id: 'societe_id', contact_id: 'contact_id', nature_transaction: 'nature_transaction', surface_min: 'surface_min', surface_max: 'surface_max', budget_min: 'budget_min', budget_max: 'budget_max', secteur_geo: 'secteur_geo', criteres_specifiques: 'criteres_specifiques', gestionnaire: 'gestionnaire_id', donnee_exclusive: 'donnee_exclusive', agence_id: 'agence_id' }, lists: { familles: { table: 'demande_familles', owner: 'demande_id', value: 'famille_id' } } },
  Matching_demandes_lots: { table: 'matching_demandes_lots', fields: { demande_id: 'demande_id', lot_id: 'lot_id', score_surface: 'score_surface', score_budget: 'score_budget', score_geographie: 'score_geographie', score_transaction: 'score_transaction', score_type_bien: 'score_type_bien', score_global: 'score_global', scores_detail: 'scores_detail', historique: 'historique' } },
  Traitements_Agents: { table: 'traitements_agents', fields: { suivi_id: 'suivi_id', agent: 'agent', objet_type: 'objet_type', objet_id: 'objet_id', statut_traitement: 'statut_traitement', resultat: 'resultat', message_erreur: 'message_erreur', agence_id: 'agence_id', user_id: 'user_id', date_creation: 'date_creation', date_mise_a_jour: 'date_mise_a_jour' } },
};

function definition(name) {
  const value = tableDefinitions[name];
  if (!value) throw new Error(`Table PostgreSQL non prise en charge : ${name}`);
  return { primaryKey: 'id', lists: {}, ...value };
}

function normalizeList(value) {
  if (!Array.isArray(value)) return value === null || value === undefined || value === '' ? [] : [value];
  return value[0] === 'L' ? value.slice(1) : value;
}

const timestampColumns = new Set(['date_creation', 'date_mise_a_jour', 'derniere_connexion', 'reset_mot_de_passe_expiration']);
const dateFields = new Set(['date_disponibilite', 'date_debut', 'date_fin', 'disponibilite']);
const jsonTextFields = new Set(['progression_formation', 'resultat', 'scores_detail']);

function writeValue(value, column) {
  if (value === '') return null;
  if (timestampColumns.has(column) && typeof value === 'number') return new Date(value * 1000).toISOString();
  return value;
}

function readValue(value, field) {
  if (value === null || value === undefined) return value;
  if (jsonTextFields.has(field) && typeof value === 'object') return JSON.stringify(value);
  if (dateFields.has(field) && value instanceof Date) return value.toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString();
  return value;
}

async function replaceLists(client, config, id, data) {
  for (const [field, list] of Object.entries(config.lists)) {
    if (!(field in data)) continue;
    await client.query(`DELETE FROM ${list.table} WHERE ${list.owner} = $1`, [id]);
    for (const value of normalizeList(data[field])) {
      await client.query(`INSERT INTO ${list.table} (${list.owner}, ${list.value}) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, value]);
    }
  }
}

async function hydrate(client, name, rows) {
  const config = definition(name);
  const records = rows.map((row) => {
    const fields = {};
    for (const [field, column] of Object.entries(config.fields)) fields[field] = readValue(row[column], field);
    return { id: row[config.primaryKey], fields };
  });
  for (const [field, list] of Object.entries(config.lists)) {
    for (const record of records) {
      const result = await client.query(`SELECT ${list.value} AS value FROM ${list.table} WHERE ${list.owner} = $1 ORDER BY ${list.value}`, [record.id]);
      record.fields[field] = ['L', ...result.rows.map((row) => row.value)];
    }
  }
  return records;
}

export function createPostgresClient(pool) {
  async function transaction(work) {
    const client = await pool.connect();
    try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }

  return {
    async list(name, filters = {}) {
      const config = definition(name); const clauses = []; const values = [];
      for (const [field, rawExpected] of Object.entries(filters)) {
        const column = config.fields[field];
        if (!column) continue;
        const expected = normalizeList(rawExpected);
        values.push(expected);
        clauses.push(`${column} = ANY($${values.length})`);
      }
      const result = await pool.query(`SELECT * FROM ${config.table}${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''} ORDER BY ${config.primaryKey}`, values);
      return hydrate(pool, name, result.rows);
    },
    async getById(name, id) {
      const config = definition(name);
      const result = await pool.query(`SELECT * FROM ${config.table} WHERE ${config.primaryKey} = $1`, [id]);
      return (await hydrate(pool, name, result.rows))[0] ?? null;
    },
    async create(name, data) {
      const config = definition(name);
      return transaction(async (client) => {
        const entries = Object.entries(config.fields).filter(([field]) => field in data);
        const columns = entries.map(([, column]) => column); const values = entries.map(([field, column]) => writeValue(data[field], column));
        const result = await client.query(`INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')}) RETURNING *`, values);
        const id = result.rows[0][config.primaryKey]; await replaceLists(client, config, id, data);
        return (await hydrate(client, name, result.rows))[0];
      });
    },
    async update(name, id, data) {
      const config = definition(name);
      return transaction(async (client) => {
        const entries = Object.entries(config.fields).filter(([field]) => field in data);
        if (entries.length) {
          const values = entries.map(([field, column]) => writeValue(data[field], column)); values.push(id);
          await client.query(`UPDATE ${config.table} SET ${entries.map(([, column], index) => `${column} = $${index + 1}`).join(', ')} WHERE ${config.primaryKey} = $${values.length}`, values);
        }
        await replaceLists(client, config, id, data);
        const result = await client.query(`SELECT * FROM ${config.table} WHERE ${config.primaryKey} = $1`, [id]);
        return (await hydrate(client, name, result.rows))[0] ?? null;
      });
    },
    async delete(name, id) { const config = definition(name); await pool.query(`DELETE FROM ${config.table} WHERE ${config.primaryKey} = $1`, [id]); return null; },
  };
}

export const testing = { tableDefinitions, normalizeList, readValue };

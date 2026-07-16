function first(fields, names, fallback = null) {
  for (const name of names) if (fields[name] !== undefined && fields[name] !== null && fields[name] !== '') return fields[name];
  return fallback;
}

export function listValue(value) {
  if (!Array.isArray(value)) return value === undefined || value === null || value === '' ? [] : [value];
  return value[0] === 'L' ? value.slice(1) : value;
}

export function referenceValue(value) {
  if (Array.isArray(value)) return listValue(value)[0] ?? null;
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function booleanValue(value, fallback = null) {
  if (value === true || value === false) return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  return fallback;
}

export function utcValue(value) {
  if (!value) return null;
  if (typeof value === 'number') return new Date(value * 1000).toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function dateValue(value) { return utcValue(value)?.slice(0, 10) ?? null; }
export function jsonValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return { historique: String(value) }; }
}

export function normalizedRoles(fields) {
  const aliases = { manager: 'master_consultant', admin: 'admin_agence' };
  return [...new Set(listValue(first(fields, ['roles', 'role'], [])).map((role) => aliases[role] ?? role))];
}

export function field(fields, canonical, ...aliases) { return first(fields, [canonical, ...aliases]); }

export function normalizedHistoricalUsage(value) {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('fr-FR');
  return normalized === 'entrepôt' ? 'logistique' : value;
}

export const importTables = [
  'Agences', 'Adresses', 'Utilisateurs', 'Ref_Familles', 'Societes', 'Contacts',
  'Sites', 'Batiments', 'Cellules', 'Lots', 'Ref_Categories_Carac', 'Ref_Caracteristiques',
  'Caracteristiques_Bien', 'Offres', 'Conditions_Financieres', 'Mandats', 'Demandes',
  'Matching_demandes_lots', 'Traitements_Agents',
];

export const importConfig = {
  Agences: { target: 'agences', required: ['nom'], values: (f) => ({ nom: field(f, 'nom', 'nom_agence'), ville: field(f, 'ville'), actif: booleanValue(field(f, 'actif'), true) }) },
  Adresses: { target: 'adresses', values: (f) => ({ numero: field(f, 'numero'), voie: field(f, 'voie', 'rue'), complement: field(f, 'complement'), code_postal: field(f, 'code_postal'), ville: field(f, 'ville'), departement: field(f, 'departement'), adresse_formatee: field(f, 'adresse_formatee', 'adresse_complete'), latitude: field(f, 'latitude'), longitude: field(f, 'longitude'), infos_acces: field(f, 'infos_acces') }), refs: { agence_id: ['Agences', ['agence_id', 'agence']] } },
  Utilisateurs: { target: 'utilisateurs', required: ['nom', 'prenom', 'email', 'mot_de_passe_hash'], values: (f) => ({ nom: field(f, 'nom'), prenom: field(f, 'prenom'), email: String(field(f, 'email') ?? '').trim().toLowerCase(), mot_de_passe_hash: field(f, 'mot_de_passe_hash'), actif: booleanValue(field(f, 'actif'), true), derniere_connexion: utcValue(field(f, 'derniere_connexion')), doit_changer_mot_de_passe: booleanValue(field(f, 'doit_changer_mot_de_passe'), false), reset_mot_de_passe_hash: field(f, 'reset_mot_de_passe_hash'), reset_mot_de_passe_expiration: utcValue(field(f, 'reset_mot_de_passe_expiration')), progression_formation: jsonValue(field(f, 'progression_formation')) ?? {} }), refs: { agence_id: ['Agences', ['agence_id', 'agence']] }, deferredRefs: { master_consultant_id: ['Utilisateurs', ['master_consultant_id']] }, lists: { roles: normalizedRoles } },
  Ref_Roles: { target: 'roles', key: 'code', values: (f) => ({ code: field(f, 'code'), perimetre: field(f, 'perimetre') }), required: ['code'] },
  Ref_Familles: { target: 'ref_familles', values: (f) => ({ code: field(f, 'code', 'usage'), libelle: field(f, 'libelle', 'nom') }), required: ['code', 'libelle'] },
  Societes: { target: 'societes', values: (f) => ({ raison_sociale: field(f, 'raison_sociale', 'nom'), enseigne: field(f, 'enseigne'), siren: field(f, 'siren'), siret: field(f, 'siret'), code_ape: field(f, 'code_ape'), libelle_ape: field(f, 'libelle_ape'), forme_juridique: field(f, 'forme_juridique'), capital: field(f, 'capital'), effectif_salarie: field(f, 'effectif_salarie'), type_relation: field(f, 'type_relation'), donnee_exclusive: booleanValue(field(f, 'donnee_exclusive'), true) }), required: ['raison_sociale'], refs: { adresse_siege_id: ['Adresses', ['adresse_siege', 'adresse_siege_id']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] }, deferredRefs: { contact_principal_id: ['Contacts', ['contact_principal', 'contact_principal_id']] } },
  Contacts: { target: 'contacts', values: (f) => ({ nom: field(f, 'nom'), prenom: field(f, 'prenom'), fonction: field(f, 'fonction'), email: field(f, 'email'), tel: field(f, 'tel', 'telephone'), mobile: field(f, 'mobile'), donnee_exclusive: booleanValue(field(f, 'donnee_exclusive'), true) }), required: ['nom'], refs: { societe_id: ['Societes', ['societe_id', 'societe']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] } },
  Sites: { target: 'sites', values: (f) => ({ nom: field(f, 'nom', 'nom_site'), type_site: field(f, 'type_site'), surface_terrain: field(f, 'surface_terrain'), surface_totale: field(f, 'surface_totale'), section_cadastrale: field(f, 'section_cadastrale'), divisible: booleanValue(field(f, 'divisible')), reserve_fonciere: booleanValue(field(f, 'reserve_fonciere')), servitudes: field(f, 'servitudes'), en_bloc: booleanValue(field(f, 'en_bloc')) }), required: ['nom'], refs: { adresse_id: ['Adresses', ['adresse_id', 'adresse']], proprietaire_id: ['Societes', ['proprietaire_id', 'proprietaire']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] }, lists: { parcelles: (f) => listValue(field(f, 'parcelles')) } },
  Batiments: { target: 'batiments', values: (f) => ({ nom: field(f, 'nom', 'nom_batiment'), numero: field(f, 'numero'), annee_construction: field(f, 'annee_construction'), surface_totale: field(f, 'surface_totale'), etat: field(f, 'etat'), divisible: booleanValue(field(f, 'divisible')), copropriete: booleanValue(field(f, 'copropriete')), erp: booleanValue(field(f, 'erp')), igh: booleanValue(field(f, 'igh')), erp_categorie: field(f, 'erp_categorie'), erp_type: field(f, 'erp_type'), destination_plu: field(f, 'destination_plu'), decret_tertiaire: booleanValue(field(f, 'decret_tertiaire')) }), required: ['nom'], refs: { site_id: ['Sites', ['site_id', 'site']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] }, inheritedRefs: { agence_id: ['site_id', 'sites', 'agence_id'] } },
  Cellules: { target: 'cellules', values: (f) => ({ nom: field(f, 'nom', 'nom_cellule'), numero: field(f, 'numero'), surface: field(f, 'surface'), etage: field(f, 'etage') }), required: ['nom'], refs: { batiment_id: ['Batiments', ['batiment_id', 'batiment']], type_bien_id: ['Ref_Familles', ['type_bien', 'usage']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] } },
  Lots: { target: 'lots', values: (f) => ({ nom: field(f, 'nom', 'nom_lot', 'reference_lot'), reference_lot: field(f, 'reference_lot'), numero: field(f, 'numero'), surface: field(f, 'surface'), divisible: booleanValue(field(f, 'divisible')), nombre_parking: field(f, 'nombre_parking'), en_bloc: booleanValue(field(f, 'en_bloc')), etage: field(f, 'etage'), usage_historique: field(f, 'usage'), type_transaction: field(f, 'type_transaction'), loyer_annuel: field(f, 'loyer_annuel'), prix_vente: field(f, 'prix_vente'), charges: field(f, 'charges'), statut_commercial: field(f, 'statut_commercial'), date_disponibilite: dateValue(field(f, 'date_disponibilite')) }), required: ['nom'], refs: { site_id: ['Sites', ['site_id', 'site']], batiment_id: ['Batiments', ['batiment_id', 'batiment']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] }, inheritedRefs: { agence_id: ['batiment_id', 'batiments', 'agence_id'] }, valueRefs: { usage_id: ['Ref_Familles', ['usage'], normalizedHistoricalUsage] }, lists: { cellules: (f) => listValue(field(f, 'cellules')) } },
  Ref_Categories_Carac: { target: 'ref_categories_caracteristiques', values: (f) => ({ libelle: field(f, 'libelle'), ordre: field(f, 'ordre') ?? 0 }), required: ['libelle'] },
  Ref_Caracteristiques: { target: 'ref_caracteristiques', values: (f) => ({ libelle: field(f, 'libelle'), type_valeur: field(f, 'type_valeur'), unite: field(f, 'unite'), ordre: field(f, 'ordre') }), required: ['libelle', 'type_valeur'], refs: { categorie_id: ['Ref_Categories_Carac', ['categorie_id', 'categorie']] }, lists: { familles: (f) => listValue(field(f, 'familles')), niveaux: (f) => listValue(field(f, 'niveaux')) } },
  Caracteristiques_Bien: { target: 'caracteristiques_bien', values: (f) => ({ niveau: field(f, 'niveau'), valeur_bool: booleanValue(field(f, 'valeur_bool')), valeur_nombre: field(f, 'valeur_nombre'), valeur_texte: field(f, 'valeur_texte') }), refs: { caracteristique_id: ['Ref_Caracteristiques', ['caracteristique_id']], batiment_id: ['Batiments', ['batiment_id']], cellule_id: ['Cellules', ['cellule_id']], lot_id: ['Lots', ['lot_id']], agence_id: ['Agences', ['agence_id']] } },
  Offres: { target: 'offres', values: (f) => ({ numero: field(f, 'numero'), nom: field(f, 'nom'), nature: field(f, 'nature'), type_contrat: field(f, 'type_contrat'), occupation: field(f, 'occupation'), stade_commercialisation: field(f, 'stade_commercialisation') }), required: ['nom', 'nature'], refs: { lot_id: ['Lots', ['lot_id', 'lot']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] }, lists: { co_gestionnaires: (f) => listValue(field(f, 'co_gestionnaires')) } },
  Conditions_Financieres: { target: 'conditions_financieres', values: (f) => ({ type: field(f, 'type'), prix_vente: field(f, 'prix_vente'), loyer_ht_m2_an: field(f, 'loyer_ht_m2_an'), loyer_global_an: field(f, 'loyer_global_an'), charges_ht_m2_an: field(f, 'charges_ht_m2_an'), depot_garantie: field(f, 'depot_garantie'), taxe_fonciere: field(f, 'taxe_fonciere'), teom: field(f, 'teom'), cfe: field(f, 'cfe'), taux_net_initial: field(f, 'taux_net_initial'), taux_net_potentiel: field(f, 'taux_net_potentiel'), disponibilite: dateValue(field(f, 'disponibilite')) }), required: ['type'], refs: { offre_id: ['Offres', ['offre_id', 'offre']] } },
  Mandats: { target: 'mandats', values: (f) => ({ numero: field(f, 'numero'), numero_registre: field(f, 'numero_registre'), type: field(f, 'type'), nature: field(f, 'nature'), avancement: field(f, 'avancement'), date_debut: dateValue(field(f, 'date_debut')), date_fin: dateValue(field(f, 'date_fin')), honoraires_mode: field(f, 'honoraires_mode'), honoraires_montant: field(f, 'honoraires_montant'), honoraires_charge: field(f, 'honoraires_charge'), donnee_exclusive: booleanValue(field(f, 'donnee_exclusive'), true) }), refs: { offre_id: ['Offres', ['offre_id', 'offre']], societe_mandante_id: ['Societes', ['societe_mandante', 'societe_mandante_id']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] } },
  Demandes: { target: 'demandes', values: (f) => ({ nature_transaction: field(f, 'nature_transaction'), surface_min: field(f, 'surface_min'), surface_max: field(f, 'surface_max'), budget_min: field(f, 'budget_min'), budget_max: field(f, 'budget_max'), secteur_geo: field(f, 'secteur_geo'), criteres_specifiques: field(f, 'criteres_specifiques'), donnee_exclusive: booleanValue(field(f, 'donnee_exclusive'), true) }), refs: { societe_id: ['Societes', ['societe_id', 'societe']], contact_id: ['Contacts', ['contact_id', 'contact']], gestionnaire_id: ['Utilisateurs', ['gestionnaire', 'consultant_responsable_id']], agence_id: ['Agences', ['agence_id']] }, lists: { familles: (f) => listValue(field(f, 'familles')) } },
  Matching_demandes_lots: { target: 'matching_demandes_lots', values: (f) => ({ score_surface: field(f, 'score_surface'), score_budget: field(f, 'score_budget'), score_geographie: field(f, 'score_geographie'), score_transaction: field(f, 'score_transaction'), score_type_bien: field(f, 'score_type_bien'), score_global: field(f, 'score_global'), scores_detail: jsonValue(field(f, 'scores_detail')), historique: true }), refs: { demande_id: ['Demandes', ['demande_id', 'demande']], lot_id: ['Lots', ['lot_id', 'lot']] } },
  Traitements_Agents: { target: 'traitements_agents', values: (f) => ({ suivi_id: field(f, 'suivi_id'), agent: field(f, 'agent'), objet_type: field(f, 'objet_type'), objet_id: field(f, 'objet_id'), statut_traitement: field(f, 'statut_traitement'), resultat: jsonValue(field(f, 'resultat')), message_erreur: field(f, 'message_erreur'), date_creation: utcValue(field(f, 'date_creation')), date_mise_a_jour: utcValue(field(f, 'date_mise_a_jour')) }), required: ['suivi_id', 'agent', 'objet_type', 'objet_id', 'statut_traitement'], refs: { agence_id: ['Agences', ['agence_id']], user_id: ['Utilisateurs', ['user_id', 'utilisateur_id']] } },
};

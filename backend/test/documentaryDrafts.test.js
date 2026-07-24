import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DRAFT_COMMENT_MAX_LENGTH,
  DRAFT_INITIAL_VERSION,
  DRAFT_LIST_LIMITS,
  DRAFT_MUTABLE_FIELDS,
  DRAFT_TITLE_MAX_LENGTH,
  DraftCommandValidationError,
  isDraftReadyToProcess,
  nextDraftVersion,
  normalizeDraftListOptions,
  selectSafeDraftMutableFields,
  validateCreateDraftCommand,
  validateExpectedVersion,
  validateUpdateDraftCommand,
} from '../src/documentary/drafts.js';

function isValidationError(field) {
  return (error) => error instanceof DraftCommandValidationError && error.field === field;
}

test('expose les bornes validées des brouillons T-34B', () => {
  assert.equal(DRAFT_INITIAL_VERSION, 1);
  assert.equal(DRAFT_TITLE_MAX_LENGTH, 160);
  assert.equal(DRAFT_COMMENT_MAX_LENGTH, 2_000);
  assert.deepEqual(DRAFT_LIST_LIMITS, { default: 20, max: 50 });
  assert.deepEqual(DRAFT_MUTABLE_FIELDS, [
    'type',
    'titre',
    'commentaire',
    'rattachement_propose',
  ]);
  assert.equal(Object.isFrozen(DRAFT_LIST_LIMITS), true);
  assert.equal(Object.isFrozen(DRAFT_MUTABLE_FIELDS), true);
});

test('valide une création avec les seuls champs autorisés', () => {
  const command = validateCreateDraftCommand({
    type: 'signal_terrain',
    titre: '  Accès livraison  ',
    commentaire: 'Accès poids lourds à confirmer',
    rattachement_propose: { type: 'offre', id: 42 },
  });

  assert.deepEqual(command, {
    type: 'signal_terrain',
    titre: 'Accès livraison',
    commentaire: 'Accès poids lourds à confirmer',
    rattachement_propose: { type: 'offre', id: 42 },
  });
  assert.equal(Object.isFrozen(command), true);
  assert.equal(Object.isFrozen(command.rattachement_propose), true);
  assert.equal('agence_id' in command, false);
  assert.equal('geolocalisation' in command, false);
});

test('normalise le titre facultatif et le borne à 160 caractères Unicode', () => {
  assert.deepEqual(validateCreateDraftCommand({
    type: 'signal_terrain',
  }), { type: 'signal_terrain' });
  assert.equal(validateCreateDraftCommand({
    type: 'signal_terrain',
    titre: null,
  }).titre, null);
  assert.equal(validateCreateDraftCommand({
    type: 'signal_terrain',
    titre: ' \t ',
  }).titre, null);
  assert.equal(validateCreateDraftCommand({
    type: 'signal_terrain',
    titre: '  Quai nord  ',
  }).titre, 'Quai nord');

  const exactLimit = 'é'.repeat(159) + '🙂';
  assert.equal([...exactLimit].length, DRAFT_TITLE_MAX_LENGTH);
  assert.equal(validateCreateDraftCommand({
    type: 'signal_terrain',
    titre: exactLimit,
  }).titre, exactLimit);

  for (const titre of [`${exactLimit}x`, 42, {}, ['titre']]) {
    assert.throws(
      () => validateCreateDraftCommand({ type: 'signal_terrain', titre }),
      isValidationError('titre'),
    );
  }
});

test('refuse une création sans type, hors catalogue ou avec champ serveur', () => {
  assert.throws(() => validateCreateDraftCommand({}), isValidationError('type'));
  assert.throws(
    () => validateCreateDraftCommand({ type: 'inconnu' }),
    isValidationError('type'),
  );
  for (const protectedField of ['auteur_id', 'agence_id', 'etat', 'version', 'fichiers', 'geolocalisation']) {
    assert.throws(
      () => validateCreateDraftCommand({ type: 'signal_terrain', [protectedField]: 'interdit' }),
      isValidationError(protectedField),
    );
  }
});

test('borne le commentaire à 2 000 caractères Unicode', () => {
  const exactLimit = 'é'.repeat(1_999) + '🙂';
  assert.equal([...exactLimit].length, 2_000);
  assert.equal(validateCreateDraftCommand({
    type: 'article_document',
    commentaire: exactLimit,
  }).commentaire, exactLimit);

  assert.throws(
    () => validateCreateDraftCommand({
      type: 'article_document',
      commentaire: `${exactLimit}x`,
    }),
    isValidationError('commentaire'),
  );

  assert.throws(
    () => validateCreateDraftCommand({
      type: 'article_document',
      commentaire: 'x'.repeat(1_000_000),
    }),
    isValidationError('commentaire'),
  );
});

test('valide un rattachement complet ou sa suppression explicite', () => {
  assert.deepEqual(validateCreateDraftCommand({
    type: 'carte_visite',
    rattachement_propose: { type: 'contact', id: 'contact-7' },
  }).rattachement_propose, { type: 'contact', id: 'contact-7' });
  assert.equal(validateCreateDraftCommand({
    type: 'carte_visite',
    rattachement_propose: null,
  }).rattachement_propose, null);
  assert.deepEqual(validateCreateDraftCommand({
    type: 'article_document',
    rattachement_propose: { type: 'mandat', id: 31 },
  }).rattachement_propose, { type: 'mandat', id: 31 });

  for (const rattachement_propose of [
    {},
    { type: 'contact' },
    { id: 7 },
    { type: 'territoire', id: 7 },
    { type: 'contact', id: '' },
    { type: 'contact', id: 7, agence_id: 3 },
  ]) {
    assert.throws(
      () => validateCreateDraftCommand({ type: 'carte_visite', rattachement_propose }),
      isValidationError('rattachement_propose'),
    );
  }
});

test('valide un PATCH partiel avec version attendue obligatoire', () => {
  assert.deepEqual(validateUpdateDraftCommand({
    version_attendue: 4,
    commentaire: null,
  }), { version_attendue: 4, commentaire: null });
  assert.deepEqual(validateUpdateDraftCommand({
    version_attendue: 2,
    type: 'article_document',
  }), { version_attendue: 2, type: 'article_document' });
  assert.deepEqual(validateUpdateDraftCommand({
    version_attendue: 3,
    titre: '  Nouveau titre  ',
  }), { version_attendue: 3, titre: 'Nouveau titre' });
  assert.deepEqual(validateUpdateDraftCommand({
    version_attendue: 4,
    titre: '',
  }), { version_attendue: 4, titre: null });

  for (const version_attendue of [undefined, null, 0, -1, 1.5, '1']) {
    assert.throws(
      () => validateUpdateDraftCommand({ version_attendue, commentaire: 'test' }),
      isValidationError('version_attendue'),
    );
  }
  assert.throws(
    () => validateUpdateDraftCommand({ version_attendue: 1 }),
    isValidationError(null),
  );
});

test('refuse les propriétés inconnues dans un PATCH sans les ignorer', () => {
  for (const field of ['id', 'auteur_id', 'agence_id', 'etat', 'version', 'dates', 'fichiers', 'geolocalisation']) {
    assert.throws(
      () => validateUpdateDraftCommand({ version_attendue: 1, commentaire: 'test', [field]: true }),
      isValidationError(field),
    );
  }
});

test('sélectionne uniquement les champs modifiables sûrs pour un conflit visible', () => {
  const safeFields = selectSafeDraftMutableFields({
    id: 91,
    agence_id: 3,
    auteur_id: 7,
    etat: 'brouillon_prive',
    version: 5,
    type: 'signal_terrain',
    titre: '  Accès livraison  ',
    commentaire: 'Portail à mesurer',
    rattachement_propose: { type: 'offre', id: 42 },
    fichiers: [{ id: 'secret-technique' }],
    geolocalisation: { latitude: 49 },
  });

  assert.deepEqual(safeFields, {
    type: 'signal_terrain',
    titre: 'Accès livraison',
    commentaire: 'Portail à mesurer',
    rattachement_propose: { type: 'offre', id: 42 },
  });
  assert.equal(Object.isFrozen(safeFields), true);
  assert.equal(Object.isFrozen(safeFields.rattachement_propose), true);
});

test('calcule la complétude sans créer de nouvel état métier', () => {
  assert.equal(isDraftReadyToProcess({
    type: 'signal_terrain',
    titre: 'Quai nord',
  }), true);
  assert.equal(isDraftReadyToProcess({
    type: 'signal_terrain',
    commentaire: 'Accès à confirmer',
  }), true);

  for (const draft of [
    null,
    {},
    { type: 'inconnu', titre: 'Quai nord' },
    { type: 'signal_terrain' },
    { type: 'signal_terrain', titre: '  ', commentaire: '\n' },
  ]) {
    assert.equal(isDraftReadyToProcess(draft), false);
  }
});

test('valide et incrémente uniquement des versions entières positives', () => {
  assert.equal(validateExpectedVersion(1), 1);
  assert.equal(nextDraftVersion(1), 2);
  assert.equal(nextDraftVersion(41), 42);
  assert.throws(() => nextDraftVersion(Number.MAX_SAFE_INTEGER), isValidationError('version_attendue'));
});

test('borne les options de liste avec un curseur opaque', () => {
  assert.deepEqual(normalizeDraftListOptions(), { limit: 20 });
  assert.deepEqual(normalizeDraftListOptions({ cursor: 'opaque', limit: 50 }), {
    cursor: 'opaque',
    limit: 50,
  });
  for (const limit of [0, 51, 1.5, '20']) {
    assert.throws(() => normalizeDraftListOptions({ limit }), isValidationError('limit'));
  }
  for (const cursor of ['', 42, {}]) {
    assert.throws(() => normalizeDraftListOptions({ cursor }), isValidationError('cursor'));
  }
});

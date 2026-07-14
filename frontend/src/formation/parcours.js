const commun = [
  { titre: 'Bienvenue dans votre espace', texte: 'La navigation et les données visibles s’adaptent toujours à votre rôle actif.' },
  { titre: 'Vos modules métier', texte: 'Patrimoine, offres, CRM, matching et agents IA restent accessibles selon vos droits réels.' },
];

export const parcoursParRole = {
  consultant: [...commun, { titre: 'Votre portefeuille', texte: 'Vous créez et modifiez vos propres données et suivez vos opportunités.' }],
  master_consultant: [...commun, { titre: 'Votre équipe', texte: 'Vous consultez aussi les données des consultants qui vous sont rattachés, sans les modifier.' }],
  directeur_agence: [...commun, { titre: 'Piloter l’agence', texte: 'Vous consultez l’agence, organisez les équipes et bloquez ou réactivez les niveaux inférieurs.' }],
  admin_agence: [...commun, { titre: 'Administrer l’agence', texte: 'Vous gérez les comptes, rôles et mots de passe des niveaux inférieurs de votre agence.' }],
  super_admin: [{ titre: 'Administration de la plateforme', texte: 'Votre rôle administre la plateforme sans ouvrir automatiquement les données métier des agences.' }, { titre: 'Agences et habilitations', texte: 'Vous êtes le seul rôle autorisé à gérer les agences et à attribuer le rôle super administrateur.' }],
};

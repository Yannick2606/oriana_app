const navigation = [
  { id: 'accueil', label: 'Accueil', icon: 'dashboard', roles: ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence'] },
  { id: 'patrimoine', label: 'Patrimoine', icon: 'building', roles: ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence'] },
  { id: 'offres', label: 'Offres', icon: 'briefcase', roles: ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence'] },
  { id: 'crm', label: 'CRM', icon: 'contacts', roles: ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence'] },
  { id: 'matching', label: 'Matching', icon: 'matching', roles: ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence'] },
  { id: 'agents', label: 'Agents IA', icon: 'bot', roles: ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence'] },
  { id: 'autoformation', label: 'Auto-formation', icon: 'book', roles: ['consultant', 'master_consultant', 'directeur_agence', 'admin_agence', 'super_admin'] },
  { id: 'administration', label: 'Administration', icon: 'settings', roles: ['directeur_agence', 'admin_agence', 'super_admin'] },
];

const roleAliases = { manager: 'master_consultant', admin: 'admin_agence' };

function canonicalRole(role) {
  return roleAliases[role] || role;
}

export function navigationForRole(role) {
  const canonical = canonicalRole(role);
  return navigation.filter((item) => item.roles.includes(canonical));
}

export function canNavigateTo(role, pageId) {
  return navigationForRole(role).some((item) => item.id === pageId);
}

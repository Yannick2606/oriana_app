const navigation = [
  { id: 'accueil', label: 'Accueil', icon: 'dashboard', roles: ['consultant', 'manager', 'admin'] },
  { id: 'patrimoine', label: 'Patrimoine', icon: 'building', roles: ['consultant', 'manager', 'admin'] },
  { id: 'offres', label: 'Offres', icon: 'briefcase', roles: ['consultant', 'manager', 'admin'] },
  { id: 'crm', label: 'CRM', icon: 'contacts', roles: ['consultant', 'manager', 'admin'] },
  { id: 'matching', label: 'Matching', icon: 'matching', roles: ['consultant', 'manager', 'admin'] },
  { id: 'agents', label: 'Agents IA', icon: 'bot', roles: ['consultant', 'manager', 'admin'] },
  { id: 'administration', label: 'Administration', icon: 'settings', roles: ['admin'] },
];

export function navigationForRole(role) {
  return navigation.filter((item) => item.roles.includes(role));
}

export function canNavigateTo(role, pageId) {
  return navigationForRole(role).some((item) => item.id === pageId);
}

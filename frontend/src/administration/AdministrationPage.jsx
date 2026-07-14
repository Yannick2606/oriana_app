import { useEffect, useMemo, useState } from 'react';
import { Breadcrumb, Button, Card, EmptyState, PageHeader } from '../components/ui';
import { utilisateursApi } from '../api/utilisateurs';

const labels = { consultant: 'Consultant', master_consultant: 'Master consultant', directeur_agence: 'Directeur d’agence', admin_agence: 'Administrateur d’agence', super_admin: 'Super administrateur' };

export function AdministrationPage({ user, client = utilisateursApi }) {
  const [users, setUsers] = useState([]); const [error, setError] = useState(''); const [pending, setPending] = useState(null);
  const masters = useMemo(() => users.filter((item) => item.roles.includes('master_consultant') && item.actif), [users]);
  async function load() { try { setError(''); setUsers((await client.list()).data); } catch { setError('Impossible de charger les utilisateurs.'); } }
  useEffect(() => {
    let active = true;
    client.list().then((result) => { if (active) setUsers(result.data); }).catch(() => { if (active) setError('Impossible de charger les utilisateurs.'); });
    return () => { active = false; };
  }, [client]);
  async function update(id, data) { try { setPending(id); await client.update(id, data); await load(); } catch { setError('Modification refusée ou impossible.'); } finally { setPending(null); } }

  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil', 'Administration']}/>
    <PageHeader eyebrow="Organisation" title={user.role_actif === 'directeur_agence' ? 'Mon équipe' : 'Administration'} description="Les actions proposées respectent votre agence et votre niveau hiérarchique."/>
    {error && <p role="alert" className="rounded-oriana border border-oriana-bordure bg-oriana-surface p-3 text-sm">{error}</p>}
    {users.length === 0 ? <EmptyState title="Aucun compte administrable" description="Les comptes de votre niveau ou d’un niveau supérieur restent volontairement invisibles."/> : <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-oriana-bordure text-oriana-discret"><th className="p-3">Utilisateur</th><th className="p-3">Rôles</th><th className="p-3">Master consultant</th><th className="p-3">État</th><th className="p-3">Action</th></tr></thead>
        <tbody>{users.map((item) => <tr key={item.id} className="border-b border-oriana-bordure/60"><td className="p-3 font-semibold">{item.prenom} {item.nom}</td><td className="p-3">{item.roles.map((role) => labels[role] || role).join(', ')}</td><td className="p-3">{item.roles.includes('consultant') ? <select aria-label={`Master consultant de ${item.prenom} ${item.nom}`} value={item.master_consultant_id || ''} disabled={pending === item.id} onChange={(event) => update(item.id, { master_consultant_id: event.target.value ? Number(event.target.value) : null })} className="rounded-lg border border-oriana-bordure bg-oriana-fond p-2"><option value="">Non rattaché</option>{masters.map((master) => <option key={master.id} value={master.id}>{master.prenom} {master.nom}</option>)}</select> : '—'}</td><td className="p-3">{item.actif ? 'Actif' : 'Bloqué'}</td><td className="p-3"><Button size="sm" variant="secondary" disabled={pending === item.id} onClick={() => update(item.id, { actif: !item.actif })}>{item.actif ? 'Bloquer' : 'Réactiver'}</Button></td></tr>)}</tbody>
      </table>
    </Card>}
  </div>;
}

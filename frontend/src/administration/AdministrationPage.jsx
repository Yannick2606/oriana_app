import { useEffect, useMemo, useState } from 'react';
import { Network, ShieldCheck, UserRoundCheck, UserRoundX, Users } from 'lucide-react';
import {
  Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Drawer, EmptyState, Field, Loader,
  Notification, PageHeader, SearchBar, Select, Toggle,
} from '../components/ui';
import { utilisateursApi } from '../api/utilisateurs';

const roleLabels = {
  consultant: 'Consultant',
  master_consultant: 'Master consultant',
  directeur_agence: 'Directeur d’agence',
  admin_agence: 'Administrateur d’agence',
  super_admin: 'Super administrateur',
};

const roleOptions = Object.keys(roleLabels);
function fullName(item) {
  return `${item.prenom || ''} ${item.nom || ''}`.trim() || 'Utilisateur sans nom';
}

function hasRole(item, role) {
  return Array.isArray(item.roles) && item.roles.includes(role);
}

function roleVariant(role) {
  return ['super_admin', 'admin_agence'].includes(role) ? 'accent' : 'default';
}

function StatCard({ icon: Icon, label, value, description }) {
  return <Card className="relative overflow-hidden">
    <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-oriana-violet/10"/>
    <Icon size={19} className="text-oriana-lavande"/>
    <p className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-oriana-discret">{label}</p>
    <p className="mt-1 font-titre text-3xl">{value}</p>
    <p className="mt-1 text-xs text-oriana-discret">{description}</p>
  </Card>;
}

function RoleBadges({ roles }) {
  return <div className="flex flex-wrap gap-1.5">
    {(roles || []).map((role) => <Badge key={role} variant={roleVariant(role)}>{roleLabels[role] || role}</Badge>)}
  </div>;
}

function MasterAssignment({ item, masters }) {
  if (!hasRole(item, 'consultant')) return <span className="text-oriana-discret">Non concerné</span>;
  const master = masters.find((candidate) => Number(candidate.id) === Number(item.master_consultant_id));
  return master ? <span>{fullName(master)}</span> : <span className="text-oriana-lavandeMoyen">À rattacher</span>;
}

function canManage(item) {
  return item.administrable !== false;
}

function UserDrawer({ item, masters, actorRole, pending, onClose, onSave }) {
  const [roles, setRoles] = useState(item?.roles || []);
  const [masterId, setMasterId] = useState(item?.master_consultant_id || '');
  const [active, setActive] = useState(item?.actif === true);
  const canEditRoles = ['admin_agence', 'super_admin'].includes(actorRole);
  const assignableRoles = actorRole === 'super_admin' ? roleOptions : roleOptions.slice(0, 3);
  const eligibleMasters = masters.filter((master) => String(master.agence_id) === String(item?.agence_id));
  const consultantSelected = roles.includes('consultant');

  function toggleRole(role) {
    setRoles((current) => current.includes(role) ? current.filter((itemRole) => itemRole !== role) : [...current, role]);
  }

  function submit() {
    const nextMasterId = consultantSelected && masterId ? Number(masterId) : null;
    const data = { actif: active, master_consultant_id: nextMasterId };
    if (canEditRoles) data.roles = roles;
    onSave(item.id, data);
  }

  return <Drawer open={Boolean(item)} onClose={onClose} title={`Gérer ${fullName(item)}`}>
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-oriana border border-oriana-bordure bg-oriana-fond p-4">
        <Avatar name={fullName(item)}/>
        <div className="min-w-0">
          <p className="truncate font-semibold">{fullName(item)}</p>
          <p className="truncate text-xs text-oriana-discret">{item.email || 'Adresse email non communiquée'}</p>
          <p className="mt-1 text-xs text-oriana-discret">Agence {item.agence_id || 'non rattachée'}</p>
        </div>
      </div>

      {canEditRoles ? <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Rôles attribués</legend>
        <p className="text-xs leading-5 text-oriana-discret">Le backend vérifiera votre niveau et refusera toute attribution interdite.</p>
        <div className="grid gap-3 rounded-oriana border border-oriana-bordure bg-oriana-fond p-4">
          {assignableRoles.map((role) => <Checkbox key={role} label={roleLabels[role]} checked={roles.includes(role)} onChange={() => toggleRole(role)}/>) }
        </div>
      </fieldset> : <div>
        <p className="text-sm font-semibold">Rôles attribués</p>
        <div className="mt-2"><RoleBadges roles={roles}/></div>
        <p className="mt-2 text-xs text-oriana-discret">Votre rôle permet uniquement de gérer l’état et les rattachements d’équipe.</p>
      </div>}

      {consultantSelected && <Field label="Master consultant" hint={eligibleMasters.length ? 'Seuls les masters actifs de la même agence sont proposés.' : 'Aucun master actif de cette agence n’est disponible.'}>
        <Select value={masterId} onChange={(event) => setMasterId(event.target.value)} disabled={!eligibleMasters.length}>
          <option value="">Non rattaché</option>
          {eligibleMasters.map((master) => <option key={master.id} value={master.id}>{fullName(master)}</option>)}
        </Select>
      </Field>}

      <div className="rounded-oriana border border-oriana-bordure bg-oriana-fond p-4">
        <Toggle checked={active} onChange={setActive} label={active ? 'Compte actif' : 'Compte bloqué'}/>
        <p className="mt-2 text-xs leading-5 text-oriana-discret">Bloquer un compte empêche sa prochaine authentification sans supprimer son historique.</p>
      </div>

      {canEditRoles && roles.length === 0 && <p role="alert" className="text-sm text-oriana-lavandeMoyen">Attribuez au moins un rôle avant d’enregistrer.</p>}
      <div className="flex justify-end gap-2 border-t border-oriana-bordure pt-5">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button disabled={pending || (canEditRoles && roles.length === 0)} onClick={submit}>{pending ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </div>
    </div>
  </Drawer>;
}

export function AdministrationPage({ user, client = utilisateursApi, readOnly = false }) {
  const [usersList, setUsersList] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  async function load() {
    setError('');
    try {
      const result = await client.list();
      setUsersList(Array.isArray(result.data) ? result.data : []);
      setStatus('ready');
      return result.data;
    } catch {
      setStatus('error');
      setError('Impossible de charger les utilisateurs administrables.');
      return null;
    }
  }

  useEffect(() => {
    let active = true;
    client.list()
      .then((result) => { if (active) { setUsersList(Array.isArray(result.data) ? result.data : []); setStatus('ready'); } })
      .catch(() => { if (active) { setStatus('error'); setError('Impossible de charger les utilisateurs administrables.'); } });
    return () => { active = false; };
  }, [client]);

  const masters = useMemo(() => usersList.filter((item) => hasRole(item, 'master_consultant') && item.actif), [usersList]);
  const consultants = useMemo(() => usersList.filter((item) => hasRole(item, 'consultant')), [usersList]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr-FR');
    return usersList.filter((item) => {
      const matchesQuery = !normalizedQuery || [fullName(item), item.email].some((value) => String(value || '').toLocaleLowerCase('fr-FR').includes(normalizedQuery));
      const matchesRole = roleFilter === 'all' || hasRole(item, roleFilter);
      const matchesState = stateFilter === 'all' || (stateFilter === 'active' ? item.actif : !item.actif);
      return matchesQuery && matchesRole && matchesState;
    });
  }, [query, roleFilter, stateFilter, usersList]);

  const unassigned = consultants.filter((item) => item.actif && !item.master_consultant_id).length;
  const title = user.role_actif === 'directeur_agence' ? 'Mon équipe' : 'Administration';

  async function update(id, data) {
    setPending(true); setError(''); setNotice('');
    try {
      await client.update(id, data);
      const reloaded = await load();
      if (reloaded) {
        setSelected(null);
        setNotice('Les habilitations ont été mises à jour. Elles seront relues par le serveur à la prochaine requête.');
      }
    } catch {
      setError('Modification refusée ou impossible. Vérifiez le niveau du compte et son agence.');
    } finally { setPending(false); }
  }

  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil', 'Administration']}/>
    <PageHeader eyebrow="Organisation" title={title} description={readOnly ? 'Prévisualisez les accès et les rattachements sans modifier les habilitations.' : 'Pilotez les accès et les rattachements avec les données réellement autorisées par le serveur.'}/>

    {readOnly && <Notification title="Administration en lecture seule" description="Les comptes fictifs sont consultables, mais aucune habilitation ne peut être modifiée."/>}
    {notice && <Notification title="Mise à jour enregistrée" description={notice}/>}
    {error && <div role="alert" className="flex flex-col gap-3 rounded-oriana border border-oriana-lavande/40 bg-oriana-surface p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm">{error}</p>{status === 'error' && <Button size="sm" variant="secondary" onClick={load}>Réessayer</Button>}</div>}

    {status === 'loading' ? <Card className="grid min-h-48 place-items-center"><Loader label="Chargement des habilitations…"/></Card> : status === 'error' ? null : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Comptes visibles" value={usersList.length} description="Selon votre niveau d’administration"/>
        <StatCard icon={UserRoundCheck} label="Comptes actifs" value={usersList.filter((item) => item.actif).length} description="Autorisés à se connecter"/>
        <StatCard icon={Network} label="Masters actifs" value={masters.length} description="Disponibles pour un rattachement"/>
        <StatCard icon={unassigned ? UserRoundX : ShieldCheck} label="À rattacher" value={unassigned} description="Consultants actifs sans master"/>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-titre text-2xl">Utilisateurs administrables</h2>
            <p className="mt-1 text-sm text-oriana-discret">Votre propre niveau et les niveaux supérieurs restent protégés par le backend.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[42rem]">
            <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom ou email"/>
            <Select aria-label="Filtrer par rôle" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">Tous les rôles</option>
              {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </Select>
            <Select aria-label="Filtrer par état" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              <option value="all">Tous les états</option>
              <option value="active">Actifs</option>
              <option value="blocked">Bloqués</option>
            </Select>
          </div>
        </div>

        {usersList.length === 0 ? <EmptyState title="Aucun compte administrable" description="Les comptes de votre niveau ou d’un niveau supérieur restent volontairement invisibles."/> : filtered.length === 0 ? <EmptyState title="Aucun résultat" description="Modifiez la recherche ou les filtres pour retrouver un utilisateur." action={<Button variant="secondary" onClick={() => { setQuery(''); setRoleFilter('all'); setStateFilter('all'); }}>Effacer les filtres</Button>}/> : <>
          <div className="hidden overflow-x-auto rounded-oriana border border-oriana-bordure lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-oriana-surfaceAlt text-xs uppercase tracking-wide text-oriana-discret"><tr><th className="px-4 py-3">Utilisateur</th><th className="px-4 py-3">Rôles</th><th className="px-4 py-3">Rattachement</th><th className="px-4 py-3">État</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-oriana-bordure">{filtered.map((item) => <tr className="hover:bg-oriana-surfaceAlt/60" key={item.id}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={fullName(item)}/><div><p className="font-semibold">{fullName(item)}</p><p className="text-xs text-oriana-discret">{item.email || `Agence ${item.agence_id || 'non rattachée'}`}</p></div></div></td>
                <td className="px-4 py-3"><RoleBadges roles={item.roles}/></td>
                <td className="px-4 py-3"><MasterAssignment item={item} masters={masters}/></td>
                <td className="px-4 py-3"><Badge variant={item.actif ? 'accent' : 'default'}>{item.actif ? 'Actif' : 'Bloqué'}</Badge></td>
                <td className="px-4 py-3 text-right">{canManage(item) && !readOnly ? <Button size="sm" variant="secondary" onClick={() => setSelected(item)}>Gérer</Button> : <Badge>{readOnly && canManage(item) ? 'Lecture seule' : 'Compte protégé'}</Badge>}</td>
              </tr>)}</tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">{filtered.map((item) => <article key={item.id} className="rounded-oriana border border-oriana-bordure bg-oriana-fond p-4">
            <div className="flex items-start gap-3"><Avatar name={fullName(item)}/><div className="min-w-0 flex-1"><p className="truncate font-semibold">{fullName(item)}</p><p className="truncate text-xs text-oriana-discret">{item.email || `Agence ${item.agence_id || 'non rattachée'}`}</p></div><Badge variant={item.actif ? 'accent' : 'default'}>{item.actif ? 'Actif' : 'Bloqué'}</Badge></div>
            <div className="mt-4"><RoleBadges roles={item.roles}/></div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-oriana-bordure pt-4"><p className="text-xs text-oriana-discret"><MasterAssignment item={item} masters={masters}/></p>{canManage(item) && !readOnly ? <Button size="sm" variant="secondary" onClick={() => setSelected(item)}>Gérer</Button> : <Badge>{readOnly && canManage(item) ? 'Lecture seule' : 'Compte protégé'}</Badge>}</div>
          </article>)}</div>
        </>}
      </Card>
    </>}

    {selected && !readOnly && <UserDrawer key={selected.id} item={selected} masters={masters} actorRole={user.role_actif} pending={pending} onClose={() => setSelected(null)} onSave={update}/>}
  </div>;
}

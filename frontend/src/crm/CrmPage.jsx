import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, ContactRound, Plus, SearchCheck } from 'lucide-react';
import { crmApi } from '../api/crm';
import { Badge, Breadcrumb, Button, Card, Drawer, EmptyState, Field, Input, Loader, Notification, PageHeader, SearchBar, Select, Textarea } from '../components/ui';

const configs = {
  societes: { singular: 'société', title: 'Sociétés', name: (x) => x.raison_sociale, icon: Building2 },
  contacts: { singular: 'contact', title: 'Contacts', name: (x) => `${x.prenom || ''} ${x.nom || ''}`.trim(), icon: ContactRound },
  demandes: { singular: 'demande', title: 'Demandes', name: (x) => `${x.nature_transaction || 'Demande'} · ${x.secteur_geo || 'secteur à préciser'}`, icon: SearchCheck },
};
const num = (value) => value === '' ? undefined : Number(value);

function Editor({ resource, record, data, selection, pending, onCancel, onSave }) {
  const [form, setForm] = useState(resource === 'societes' ? { raison_sociale: record?.raison_sociale || '', enseigne: record?.enseigne || '', type_relation: record?.type_relation || 'prospect', siren: record?.siren || '' } : resource === 'contacts' ? { nom: record?.nom || '', prenom: record?.prenom || '', fonction: record?.fonction || '', email: record?.email || '', tel: record?.tel || '', societe_id: record?.societe_id || selection.societeId || '' } : { societe_id: record?.societe_id || selection.societeId || '', contact_id: record?.contact_id || selection.contactId || '', nature_transaction: record?.nature_transaction || 'location', surface_min: record?.surface_min ?? '', surface_max: record?.surface_max ?? '', budget_min: record?.budget_min ?? '', budget_max: record?.budget_max ?? '', secteur_geo: record?.secteur_geo || '', criteres_specifiques: record?.criteres_specifiques || '' });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => onSave(resource === 'demandes' ? { ...form, societe_id: Number(form.societe_id), contact_id: Number(form.contact_id), surface_min: num(form.surface_min), surface_max: num(form.surface_max), budget_min: num(form.budget_min), budget_max: num(form.budget_max) } : resource === 'contacts' ? { ...form, societe_id: Number(form.societe_id) } : form);
  return <div className="space-y-4">{resource === 'societes' && <><Field label="Raison sociale"><Input value={form.raison_sociale} onChange={(e) => set('raison_sociale', e.target.value)}/></Field><Field label="Enseigne"><Input value={form.enseigne} onChange={(e) => set('enseigne', e.target.value)}/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="SIREN"><Input value={form.siren} onChange={(e) => set('siren', e.target.value)}/></Field><Field label="Relation"><Select value={form.type_relation} onChange={(e) => set('type_relation', e.target.value)}><option value="prospect">Prospect</option><option value="proprietaire">Propriétaire</option><option value="preneur">Preneur</option><option value="partenaire">Partenaire</option></Select></Field></div></>}{resource === 'contacts' && <><Field label="Société"><Select value={form.societe_id} onChange={(e) => set('societe_id', e.target.value)}><option value="">Sélectionner</option>{data.societes.map((x) => <option key={x.id} value={x.id}>{x.raison_sociale}</option>)}</Select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Prénom"><Input value={form.prenom} onChange={(e) => set('prenom', e.target.value)}/></Field><Field label="Nom"><Input value={form.nom} onChange={(e) => set('nom', e.target.value)}/></Field><Field label="Fonction"><Input value={form.fonction} onChange={(e) => set('fonction', e.target.value)}/></Field><Field label="Téléphone"><Input value={form.tel} onChange={(e) => set('tel', e.target.value)}/></Field></div><Field label="Email"><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}/></Field></>}{resource === 'demandes' && <><div className="grid gap-4 sm:grid-cols-2"><Field label="Société"><Select value={form.societe_id} onChange={(e) => set('societe_id', e.target.value)}><option value="">Sélectionner</option>{data.societes.map((x) => <option key={x.id} value={x.id}>{x.raison_sociale}</option>)}</Select></Field><Field label="Contact"><Select value={form.contact_id} onChange={(e) => set('contact_id', e.target.value)}><option value="">Sélectionner</option>{data.contacts.filter((x) => !form.societe_id || Number(x.societe_id) === Number(form.societe_id)).map((x) => <option key={x.id} value={x.id}>{configs.contacts.name(x)}</option>)}</Select></Field><Field label="Transaction"><Select value={form.nature_transaction} onChange={(e) => set('nature_transaction', e.target.value)}><option value="vente">Vente</option><option value="location">Location</option><option value="les_deux">Les deux</option></Select></Field><Field label="Secteur géographique"><Input value={form.secteur_geo} onChange={(e) => set('secteur_geo', e.target.value)}/></Field>{[['surface_min','Surface min.'],['surface_max','Surface max.'],['budget_min','Budget min.'],['budget_max','Budget max.']].map(([k,l]) => <Field key={k} label={l}><Input type="number" min="0" value={form[k]} onChange={(e) => set(k,e.target.value)}/></Field>)}</div><Field label="Critères spécifiques"><Textarea value={form.criteres_specifiques} onChange={(e) => set('criteres_specifiques', e.target.value)}/></Field></>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onCancel}>Annuler</Button><Button disabled={pending} onClick={submit}>Enregistrer</Button></div></div>;
}

export function CrmPage({ createSocieteRequest = 0, readOnly = false }) {
  const [data, setData] = useState({ societes: [], contacts: [], demandes: [], lots: [] });
  const [selection, setSelection] = useState({ societeId: null, contactId: null, demandeId: null });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [editor, setEditor] = useState(!readOnly && createSocieteRequest > 0 ? { resource: 'societes', record: null } : null);
  const [pending, setPending] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const result = await crmApi.listAll();
      setData(result);
      setSelection((current) => result.societes.some((societe) => societe.id === current.societeId)
        ? current : { societeId: null, contactId: null, demandeId: null });
    } catch { setError('Le CRM n’a pas pu être chargé.'); } finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    crmApi.listAll().then((result) => {
      if (active) setData(result);
    }).catch(() => active && setError('Le CRM n’a pas pu être chargé.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const selectedSociete = data.societes.find((entry) => entry.id === selection.societeId);
  const selectedContact = data.contacts.find((entry) => entry.id === selection.contactId);
  const selectedDemande = data.demandes.find((entry) => entry.id === selection.demandeId);
  const societes = data.societes.filter((entry) => configs.societes.name(entry)
    .toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')));
  const contacts = data.contacts.filter((entry) => Number(entry.societe_id) === Number(selection.societeId));
  const demandes = data.demandes.filter((entry) => Number(entry.societe_id) === Number(selection.societeId)
    && (!selection.contactId || Number(entry.contact_id) === Number(selection.contactId)));
  const transactionLabels = { vente: 'Vente', location: 'Location', les_deux: 'Vente ou location' };

  function selectSociete(id) {
    setSelection({ societeId: id, contactId: null, demandeId: null });
    setMatches([]);
  }

  function selectContact(id) {
    setSelection((current) => ({ ...current, contactId: id, demandeId: null }));
    setMatches([]);
  }

  async function selectDemande(id) {
    setSelection((current) => ({ ...current, demandeId: id }));
    setMatches([]);
    setMatchingLoading(true);
    try {
      const result = await crmApi.matching(id);
      setMatches(result.data);
    } catch { setError('Le matching n’a pas pu être chargé.'); } finally { setMatchingLoading(false); }
  }

  async function save(payload) {
    if (readOnly) { setError('La prévisualisation ne permet pas de modifier les données.'); return; }
    setPending(true);
    try {
      if (editor.record) await crmApi.update(editor.resource, editor.record.id, payload);
      else await crmApi.create(editor.resource, payload);
      await load(); setEditor(null);
    } catch { setError('L’enregistrement a échoué.'); } finally { setPending(false); }
  }

  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil', 'CRM']}/>
    <PageHeader eyebrow="Relations & besoins" title="CRM" description="Sélectionnez une société, retrouvez ses interlocuteurs puis qualifiez chaque demande et ses rapprochements." actions={readOnly ? <Badge variant="accent">Prévisualisation · lecture seule</Badge> : <Button onClick={() => setEditor({ resource: 'societes', record: null })}><Plus size={16}/>Nouvelle société</Button>}/>
    {readOnly && <Notification title="Données fictives en lecture seule" description="Explorez les sociétés, contacts, demandes et rapprochements sans modifier les données."/>}
    {error && <Notification title="Action impossible" description={error}/>}
    {loading ? <Loader/> : <div className="grid gap-4 lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,2fr)]">
      <Card className={selection.societeId ? 'hidden self-start p-3 lg:block' : 'self-start p-3'}>
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-oriana-lavande">Répertoire</p><h2 className="mt-1 font-titre text-2xl">Sociétés</h2></div><Badge>{data.societes.length}</Badge></div>
        <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une société"/>
        <div className="mt-3 space-y-2">{societes.map((societe) => <button type="button" key={societe.id} aria-pressed={societe.id === selection.societeId} onClick={() => selectSociete(societe.id)} className={`flex w-full items-center gap-3 rounded-oriana border p-3 text-left transition ${societe.id === selection.societeId ? 'border-oriana-lavande bg-oriana-violet/15' : 'border-oriana-bordure hover:bg-oriana-surfaceAlt'}`}><Building2 size={17} className="shrink-0 text-oriana-lavande"/><span className="min-w-0 flex-1 text-sm font-semibold">{configs.societes.name(societe)}</span><ArrowRight size={14} className="shrink-0"/></button>)}{!societes.length && <p className="p-4 text-center text-xs text-oriana-discret">Aucune société ne correspond à cette recherche.</p>}</div>
      </Card>
      <div className={selection.societeId ? 'space-y-4' : 'hidden lg:block'}>
        {!selectedSociete ? <EmptyState title="Sélectionnez une société" description="Sa fiche rassemblera ses contacts, ses demandes et les rapprochements disponibles."/> : <>
          <Card>
            <Button className="mb-4 lg:hidden" variant="ghost" size="sm" onClick={() => setSelection({ societeId: null, contactId: null, demandeId: null })}><ArrowLeft size={15}/>Retour aux sociétés</Button>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-oriana-lavande">Société sélectionnée</p><h2 className="mt-1 font-titre text-3xl">{selectedSociete.raison_sociale}</h2>{selectedSociete.enseigne && <p className="mt-1 text-sm text-oriana-discret">Enseigne : {selectedSociete.enseigne}</p>}</div><Badge variant="accent">{selectedSociete.type_relation || 'Relation à préciser'}</Badge></div>
            <div className="mt-6 flex items-center justify-between gap-3"><div><h3 className="font-titre text-xl">Contacts</h3><p className="text-xs text-oriana-discret">Filtrez les demandes par interlocuteur.</p></div>{!readOnly && <Button variant="ghost" size="sm" aria-label="Créer un contact" onClick={() => setEditor({ resource: 'contacts', record: null })}><Plus size={15}/></Button>}</div>
            <div className="mt-3 flex flex-wrap gap-2"><button type="button" aria-pressed={!selection.contactId} onClick={() => selectContact(null)} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${!selection.contactId ? 'border-oriana-lavande bg-oriana-violet/15' : 'border-oriana-bordure hover:bg-oriana-surfaceAlt'}`}>Tous</button>{contacts.map((contact) => <button type="button" key={contact.id} aria-pressed={contact.id === selection.contactId} onClick={() => selectContact(contact.id)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${contact.id === selection.contactId ? 'border-oriana-lavande bg-oriana-violet/15' : 'border-oriana-bordure hover:bg-oriana-surfaceAlt'}`}><ContactRound size={15}/>{configs.contacts.name(contact)}</button>)}</div>
            {selectedContact && <p className="mt-3 text-xs text-oriana-discret">{selectedContact.fonction || 'Fonction à préciser'} · {selectedContact.email || 'Adresse à préciser'}</p>}
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-titre text-2xl">Demandes</h3><p className="mt-1 text-sm text-oriana-discret">{selection.contactId ? `Demandes de ${configs.contacts.name(selectedContact)}` : 'Toutes les demandes de la société'}</p></div>{!readOnly && <Button variant="ghost" size="sm" aria-label="Créer une demande" onClick={() => setEditor({ resource: 'demandes', record: null })}><Plus size={15}/></Button>}</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{demandes.map((demande) => <button type="button" key={demande.id} aria-label={`${transactionLabels[demande.nature_transaction] || demande.nature_transaction} · ${demande.secteur_geo || 'Secteur à préciser'}`} aria-pressed={demande.id === selection.demandeId} onClick={() => selectDemande(demande.id)} className={`flex min-h-24 items-start gap-3 rounded-oriana border p-4 text-left transition ${demande.id === selection.demandeId ? 'border-oriana-lavande bg-oriana-violet/15' : 'border-oriana-bordure hover:bg-oriana-surfaceAlt'}`}><SearchCheck size={18} className="mt-0.5 shrink-0 text-oriana-lavande"/><span className="min-w-0 flex-1"><strong className="block text-sm">{transactionLabels[demande.nature_transaction] || demande.nature_transaction}</strong><span className="mt-1 block text-xs leading-5 text-oriana-discret">{demande.secteur_geo || 'Secteur à préciser'}</span></span><ArrowRight size={14} className="mt-1 shrink-0"/></button>)}{!demandes.length && <p className="col-span-full p-6 text-center text-sm text-oriana-discret">Aucune demande pour cette sélection.</p>}</div>
          </Card>
          {selectedDemande && <Card>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-oriana-lavande">Demande sélectionnée</p><h3 className="mt-1 font-titre text-2xl">{transactionLabels[selectedDemande.nature_transaction] || selectedDemande.nature_transaction} · {selectedDemande.secteur_geo}</h3></div><Badge>{configs.contacts.name(data.contacts.find((contact) => contact.id === selectedDemande.contact_id) || {}) || 'Contact à préciser'}</Badge></div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Surface minimale', selectedDemande.surface_min && `${selectedDemande.surface_min.toLocaleString('fr-FR')} m²`], ['Surface maximale', selectedDemande.surface_max && `${selectedDemande.surface_max.toLocaleString('fr-FR')} m²`], ['Budget minimal', selectedDemande.budget_min && `${selectedDemande.budget_min.toLocaleString('fr-FR')} €`], ['Budget maximal', selectedDemande.budget_max && `${selectedDemande.budget_max.toLocaleString('fr-FR')} €`]].map(([label, value]) => <div key={label} className="rounded-oriana bg-oriana-surfaceAlt p-3"><dt className="text-xs text-oriana-discret">{label}</dt><dd className="mt-1 text-sm font-semibold">{value || 'À préciser'}</dd></div>)}</dl>
            {selectedDemande.criteres_specifiques && <div className="mt-4 rounded-oriana border border-oriana-bordure p-4"><p className="text-xs font-bold uppercase tracking-wide text-oriana-discret">Critères spécifiques</p><p className="mt-2 text-sm leading-6">{selectedDemande.criteres_specifiques}</p></div>}
            <div className="mt-6"><h4 className="font-titre text-xl">Rapprochements disponibles</h4>{matchingLoading ? <div className="mt-4"><Loader label="Chargement des rapprochements"/></div> : matches.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{matches.map((matching, index) => <div key={matching.id} className="flex items-center justify-between rounded-oriana bg-oriana-surfaceAlt p-4"><div><Badge>#{index + 1}</Badge><p className="mt-2 font-semibold">{data.lots.find((lot) => Number(lot.id) === Number(matching.lot_id))?.nom || `Lot #${matching.lot_id}`}</p></div><strong className="font-titre text-2xl text-oriana-lavande">{matching.score_global}%</strong></div>)}</div> : <p className="mt-3 rounded-oriana border border-dashed border-oriana-bordure p-5 text-sm text-oriana-discret">Aucun rapprochement disponible pour cette demande.</p>}</div>
          </Card>}
        </>}
      </div>
    </div>}
    <Drawer open={Boolean(editor)} onClose={() => setEditor(null)} title={editor ? `${editor.record ? 'Modifier' : 'Créer'} ${configs[editor.resource].singular}` : ''}>{editor && <Editor {...editor} data={data} selection={selection} pending={pending} onCancel={() => setEditor(null)} onSave={save}/>}</Drawer>
  </div>;
}

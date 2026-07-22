import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BadgeEuro, Building, CalendarDays, ChevronRight, FileText, MapPin,
  Pencil, Plus, RefreshCw, Ruler, Users,
} from 'lucide-react';
import { offresApi } from '../api/offres';
import {
  Badge, Breadcrumb, Button, Card, Drawer, EmptyState, Field, Input, Loader,
  Notification, PageHeader, SearchBar, Select, Tabs,
} from '../components/ui';

const natureLabels = { vente: 'Vente', location: 'Location', vente_et_location: 'Vente & location' };
const typeBienLabels = {
  activite: 'Activité', bureaux: 'Bureaux', commerce: 'Commerce', logistique: 'Logistique', terrain: 'Terrain',
};
const tabItems = [
  { id: 'synthese', label: 'Synthèse' },
  { id: 'bien', label: 'Bien & surfaces' },
  { id: 'finances', label: 'Finances' },
  { id: 'mandats', label: 'Mandats' },
  { id: 'actions', label: 'Actions' },
  { id: 'visites', label: 'Visites' },
  { id: 'documents', label: 'Documents' },
  { id: 'transactions', label: 'Transactions' },
];
const emptyData = {
  source: 'metier', offers: [], conditions: [], lots: [], sites: [], buildings: [],
  cells: [], addresses: [], mandates: [], media: [],
};

const conditionTypes = (nature) => nature === 'vente_et_location' ? ['vente', 'location'] : [nature];
const money = (value) => value || value === 0 ? `${Number(value).toLocaleString('fr-FR')} €` : 'À renseigner';
const surface = (value) => value || value === 0 ? `${Number(value).toLocaleString('fr-FR')} m²` : 'À renseigner';
const optionalNumber = (value) => value === '' ? undefined : Number(value);
const listIds = (value) => Array.isArray(value) ? value.filter((item) => item !== 'L').map(Number) : [];
const normalizeTypeBien = (value) => typeof value === 'string' ? value.trim().toLocaleLowerCase('fr') : '';

function offerTypeBiens(offer, data) {
  const lot = data.lots.find((item) => Number(item.id) === Number(offer.lot_id));
  const cellIds = listIds(lot?.cellules);
  return [...new Set(data.cells
    .filter((cell) => cellIds.includes(Number(cell.id)))
    .map((cell) => normalizeTypeBien(cell.type_bien))
    .filter(Boolean))];
}

function OfferEditor({ record, lots, pending, onCancel, onSave }) {
  const [form, setForm] = useState({
    numero: record?.numero || '', nom: record?.nom || '', lot_id: record?.lot_id || '',
    nature: record?.nature || 'vente', type_contrat: record?.type_contrat || '',
    occupation: record?.occupation || 'libre',
    stade_commercialisation: record?.stade_commercialisation || '',
  });
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nom"><Input autoFocus value={form.nom} onChange={(event) => set('nom', event.target.value)}/></Field>
      <Field label="Numéro"><Input value={form.numero} onChange={(event) => set('numero', event.target.value)}/></Field>
    </div>
    <Field label="Lot commercialisé"><Select value={form.lot_id} onChange={(event) => set('lot_id', event.target.value)}>
      <option value="">Sélectionner un lot</option>
      {lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.nom || `Lot #${lot.id}`}</option>)}
    </Select></Field>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nature"><Select value={form.nature} onChange={(event) => set('nature', event.target.value)}>
        <option value="vente">Vente</option><option value="location">Location</option>
        <option value="vente_et_location">Vente & location</option>
      </Select></Field>
      <Field label="Occupation"><Select value={form.occupation} onChange={(event) => set('occupation', event.target.value)}>
        <option value="libre">Libre</option><option value="occupe">Occupé</option>
      </Select></Field>
      <Field label="Type de contrat"><Input value={form.type_contrat} onChange={(event) => set('type_contrat', event.target.value)}/></Field>
      <Field label="Stade de commercialisation"><Input value={form.stade_commercialisation} onChange={(event) => set('stade_commercialisation', event.target.value)}/></Field>
    </div>
    <div className="flex justify-end gap-2 border-t border-oriana-bordure pt-4">
      <Button variant="secondary" onClick={onCancel}>Annuler</Button>
      <Button disabled={!form.lot_id || pending} onClick={() => onSave({ ...form, lot_id: Number(form.lot_id) })}>
        {pending ? 'Enregistrement…' : 'Enregistrer l’offre'}
      </Button>
    </div>
  </div>;
}

function ConditionCard({ type, offerId, record, onSaved, readOnly }) {
  const [editing, setEditing] = useState(!record && !readOnly);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    prix_vente: record?.prix_vente ?? '', loyer_ht_m2_an: record?.loyer_ht_m2_an ?? '',
    loyer_global_an: record?.loyer_global_an ?? '', charges_ht_m2_an: record?.charges_ht_m2_an ?? '',
    depot_garantie: record?.depot_garantie ?? '', taxe_fonciere: record?.taxe_fonciere ?? '',
    teom: record?.teom ?? '', cfe: record?.cfe ?? '', taux_net_initial: record?.taux_net_initial ?? '',
    taux_net_potentiel: record?.taux_net_potentiel ?? '', disponibilite: record?.disponibilite || '',
  });
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  async function save() {
    setPending(true); setError('');
    const data = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '').map(
      ([field, value]) => [field, field === 'disponibilite' ? value : optionalNumber(value)],
    ));
    try {
      if (record) await offresApi.updateCondition(record.id, data);
      else await offresApi.createCondition({ offre_id: offerId, type, ...data });
      setEditing(false); await onSaved();
    } catch {
      setError('Les conditions financières n’ont pas pu être enregistrées.');
    } finally { setPending(false); }
  }
  return <Card className="shadow-none">
    <div className="flex items-center justify-between gap-3">
      <div><Badge variant="accent">{natureLabels[type]}</Badge><h3 className="mt-2 font-titre text-xl">Conditions de {type}</h3></div>
      {record && !editing && !readOnly && <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil size={15}/>Modifier</Button>}
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-oriana-lavandeClair">{error}</p>}
    {!editing ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Metric label={type === 'vente' ? 'Prix de vente' : 'Loyer HT/m²/an'} value={type === 'vente' ? money(record?.prix_vente) : money(record?.loyer_ht_m2_an)}/>
      {type === 'location' && <Metric label="Loyer global annuel" value={money(record?.loyer_global_an)}/>}
      <Metric label="Disponibilité" value={record?.disponibilite || 'À préciser'}/>
      <Metric label="Taxe foncière" value={money(record?.taxe_fonciere)}/>
      {type === 'location' && <Metric label="Charges HT/m²/an" value={money(record?.charges_ht_m2_an)}/>}
      {type === 'vente' && <Metric label="Taux net potentiel" value={record?.taux_net_potentiel ? `${record.taux_net_potentiel} %` : 'À renseigner'}/>}
    </div> : <div className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {type === 'vente' ? <Field label="Prix de vente (€)"><Input type="number" min="0" value={form.prix_vente} onChange={(event) => set('prix_vente', event.target.value)}/></Field> : <>
          <Field label="Loyer HT/m²/an (€)"><Input type="number" min="0" value={form.loyer_ht_m2_an} onChange={(event) => set('loyer_ht_m2_an', event.target.value)}/></Field>
          <Field label="Loyer global annuel (€)"><Input type="number" min="0" value={form.loyer_global_an} onChange={(event) => set('loyer_global_an', event.target.value)}/></Field>
          <Field label="Charges HT/m²/an (€)"><Input type="number" min="0" value={form.charges_ht_m2_an} onChange={(event) => set('charges_ht_m2_an', event.target.value)}/></Field>
          <Field label="Dépôt de garantie (€)"><Input type="number" min="0" value={form.depot_garantie} onChange={(event) => set('depot_garantie', event.target.value)}/></Field>
        </>}
        <Field label="Taxe foncière (€)"><Input type="number" min="0" value={form.taxe_fonciere} onChange={(event) => set('taxe_fonciere', event.target.value)}/></Field>
        <Field label="TEOM (€)"><Input type="number" min="0" value={form.teom} onChange={(event) => set('teom', event.target.value)}/></Field>
        <Field label="CFE (€)"><Input type="number" min="0" value={form.cfe} onChange={(event) => set('cfe', event.target.value)}/></Field>
        {type === 'vente' && <><Field label="Taux net initial (%)"><Input type="number" step="any" value={form.taux_net_initial} onChange={(event) => set('taux_net_initial', event.target.value)}/></Field><Field label="Taux net potentiel (%)"><Input type="number" step="any" value={form.taux_net_potentiel} onChange={(event) => set('taux_net_potentiel', event.target.value)}/></Field></>}
        <Field label="Disponibilité"><Input value={form.disponibilite} onChange={(event) => set('disponibilite', event.target.value)}/></Field>
      </div>
      <div className="flex justify-end gap-2">{record && <Button variant="secondary" onClick={() => setEditing(false)}>Annuler</Button>}<Button disabled={pending} onClick={save}>{pending ? 'Enregistrement…' : 'Enregistrer les conditions'}</Button></div>
    </div>}
  </Card>;
}

function Metric({ label, value }) {
  return <p className="text-sm"><span className="block text-xs text-oriana-discret">{label}</span><strong>{value}</strong></p>;
}

function UnavailablePanel({ title, description }) {
  return <div className="pt-5"><EmptyState title={title} description={description}/></div>;
}

function OfferTabPanel({ active, selected, relations, data, load, sandbox }) {
  const { lot, site, building, cells, address, mandates, media } = relations;
  if (active === 'synthese') return <div className="grid gap-5 pt-5 md:grid-cols-2 xl:grid-cols-4">
    <Card className="shadow-none"><MapPin className="text-oriana-lavande" size={20}/><Metric label="Localisation" value={[selected.ville, selected.code_postal].filter(Boolean).join(' — ') || address?.libelle || 'À renseigner'}/></Card>
    <Card className="shadow-none"><Ruler className="text-oriana-lavande" size={20}/><Metric label="Surface commercialisée" value={surface(lot?.surface)}/></Card>
    <Card className="shadow-none"><Building className="text-oriana-lavande" size={20}/><Metric label="Occupation" value={selected.occupation === 'occupe' ? 'Occupé' : 'Libre'}/></Card>
    <Card className="shadow-none"><CalendarDays className="text-oriana-lavande" size={20}/><Metric label="Stade" value={selected.stade_commercialisation || 'À renseigner'}/></Card>
  </div>;
  if (active === 'bien') return <div className="grid gap-5 pt-5 lg:grid-cols-2">
    <Card className="shadow-none"><h3 className="font-titre text-xl">Patrimoine rattaché</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><Metric label="Site" value={site?.nom || 'À renseigner'}/><Metric label="Bâtiment" value={building?.nom || 'À renseigner'}/><Metric label="Lot" value={lot?.nom || 'À renseigner'}/><Metric label="Parking" value={lot?.nombre_parking ?? 'À renseigner'}/><Metric label="Surface terrain" value={surface(site?.surface_terrain)}/><Metric label="Surface bâtiment" value={surface(building?.surface_totale)}/></div></Card>
    <Card className="shadow-none"><h3 className="font-titre text-xl">Surfaces par cellule</h3><div className="mt-4 space-y-3">{cells.length ? cells.map((cell) => <div className="flex items-center justify-between gap-3 border-b border-oriana-bordure pb-3 last:border-0" key={cell.id}><span><strong className="block text-sm">{cell.nom}</strong><span className="text-xs text-oriana-discret">{cell.etage?.replaceAll('_', ' ')}</span></span><Badge>{surface(cell.surface)}</Badge></div>) : <p className="text-sm text-oriana-discret">Aucune cellule rattachée.</p>}</div></Card>
  </div>;
  if (active === 'finances') return <div className={`grid gap-5 pt-5 ${selected.nature === 'vente_et_location' ? 'xl:grid-cols-2' : ''}`}>{conditionTypes(selected.nature).map((type) => <ConditionCard key={`${selected.id}-${type}`} type={type} offerId={selected.id} record={data.conditions.find((item) => Number(item.offre_id) === Number(selected.id) && item.type === type)} onSaved={load} readOnly={sandbox}/>)}</div>;
  if (active === 'mandats') return <div className="grid gap-4 pt-5 md:grid-cols-2">{mandates.length ? mandates.map((mandate) => <Card className="shadow-none" key={mandate.id}><div className="flex items-start justify-between gap-3"><div><Badge variant="accent">{mandate.type}</Badge><h3 className="mt-3 font-titre text-xl">{mandate.numero}</h3></div><FileText className="text-oriana-lavande" size={20}/></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Metric label="Registre" value={mandate.numero_registre}/><Metric label="Avancement" value={mandate.avancement}/><Metric label="Début" value={mandate.date_debut}/><Metric label="Fin" value={mandate.date_fin}/></div></Card>) : <UnavailablePanel title="Aucun mandat lié" description="Les mandats apparaîtront ici lorsqu’ils seront rattachés à l’offre."/>}</div>;
  if (active === 'documents') return <div className="grid gap-5 pt-5 md:grid-cols-2">{media.length ? media.map((item) => <Card className="overflow-hidden p-0 shadow-none" key={item.id}><img className="aspect-[3/2] w-full object-cover" src={item.url} alt={item.alt}/><div className="p-4"><h3 className="font-semibold">Photographie principale</h3><p className="mt-1 text-xs text-oriana-discret">{item.provenance}</p></div></Card>) : <UnavailablePanel title="Aucun document disponible" description="Les documents et diagnostics ne sont pas encore rattachés à cette offre."/>}</div>;
  const copy = {
    actions: ['Actions non encore disponibles', 'Le contrat des actions doit être validé avant leur activation.'],
    visites: ['Visites non encore disponibles', 'La planification et le suivi des visites restent à spécifier.'],
    transactions: ['Transactions non encore disponibles', 'Aucune transaction fictive n’est présentée comme une opération réelle.'],
  }[active];
  return <UnavailablePanel title={copy[0]} description={copy[1]}/>;
}

export function OffresPage() {
  const sandbox = useMemo(() => new URLSearchParams(window.location.search).get('sandbox') === '1', []);
  const [data, setData] = useState(emptyData);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('synthese');
  const [query, setQuery] = useState('');
  const [natureFilter, setNatureFilter] = useState('toutes');
  const [typeBienFilter, setTypeBienFilter] = useState('tous');
  const [mobileDetail, setMobileDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null);
  const [pending, setPending] = useState(false);
  async function load() {
    setLoading(true); setError('');
    try {
      const result = await offresApi.listAll({ sandbox });
      setData({ ...emptyData, ...result });
      setSelectedId((current) => result.offers.some((offer) => offer.id === current)
        ? current : result.offers[0]?.id || null);
    } catch {
      setError(sandbox ? 'Le bac à sable n’est pas disponible sur ce backend.' : 'Les offres n’ont pas pu être chargées.');
    } finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    offresApi.listAll({ sandbox }).then((result) => {
      if (!active) return;
      setData({ ...emptyData, ...result }); setSelectedId(result.offers[0]?.id || null);
    }).catch(() => {
      if (active) setError(sandbox ? 'Le bac à sable n’est pas disponible sur ce backend.' : 'Les offres n’ont pas pu être chargées.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sandbox]);
  const visibleOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    return data.offers.filter((offer) => {
      const matchesNature = natureFilter === 'toutes' || offer.nature === natureFilter;
      const matchesTypeBien = typeBienFilter === 'tous' || offerTypeBiens(offer, data).includes(typeBienFilter);
      const searchable = [offer.nom, offer.numero, offer.ville, offer.code_postal]
        .filter(Boolean).join(' ').toLocaleLowerCase('fr');
      return matchesNature && matchesTypeBien && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [data, natureFilter, query, typeBienFilter]);
  const availableTypeBiens = useMemo(() => [...new Set(data.offers.flatMap(
    (offer) => offerTypeBiens(offer, data),
  ))].filter((type) => typeBienLabels[type]).sort((a, b) => typeBienLabels[a].localeCompare(typeBienLabels[b], 'fr')), [data]);
  const hasActiveFilters = Boolean(query.trim()) || natureFilter !== 'toutes' || typeBienFilter !== 'tous';
  const effectiveSelectedId = visibleOffers.some((offer) => offer.id === selectedId)
    ? selectedId : visibleOffers[0]?.id || null;
  const selected = data.offers.find((offer) => offer.id === effectiveSelectedId);
  const relations = useMemo(() => {
    const lot = data.lots.find((item) => Number(item.id) === Number(selected?.lot_id));
    const cellIds = listIds(lot?.cellules);
    const cells = data.cells.filter((item) => cellIds.includes(Number(item.id)));
    const building = data.buildings.find((item) => cells.some((cell) => Number(cell.batiment_id) === Number(item.id)));
    const site = data.sites.find((item) => Number(item.id) === Number(building?.site_id ?? lot?.site_id));
    const address = data.addresses.find((item) => Number(item.id) === Number(site?.adresse_id));
    return {
      lot, cells, building, site, address,
      mandates: data.mandates.filter((item) => Number(item.offre_id) === Number(selected?.id)),
      media: data.media.filter((item) => Number(item.offre_id) === Number(selected?.id)),
    };
  }, [data, selected]);
  function chooseOffer(id) {
    setSelectedId(id);
    setActiveTab('synthese');
    setMobileDetail(true);
  }
  function resetFilters() {
    setQuery('');
    setNatureFilter('toutes');
    setTypeBienFilter('tous');
  }
  async function saveOffer(payload) {
    setPending(true);
    try {
      const response = editor?.id ? await offresApi.updateOffer(editor.id, payload) : await offresApi.createOffer(payload);
      await load(); setSelectedId(response.data.id); setEditor(null);
    } catch { setError('L’offre n’a pas pu être enregistrée.'); } finally { setPending(false); }
  }
  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil', 'Offres']}/>
    <PageHeader eyebrow={sandbox ? 'Démonstration fictive' : 'Commercialisation'} title="Offres" description={sandbox ? 'Explorez cinq offres fictives du Val-d’Oise et du nord de la Seine-et-Marne.' : 'Pilotez chaque offre et ses conditions de vente ou de location depuis une fiche unique.'} actions={<><Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Actualiser</Button>{!sandbox && <Button onClick={() => setEditor({})}><Plus size={17}/>Nouvelle offre</Button>}</>}/>
    {sandbox && <Notification title="Bac à sable en lecture seule" description="Toutes les offres, identités, adresses précises, photographies et valeurs présentées sont fictives."/>}
    {error && <Notification title="Action impossible" description={error}/>}
    {loading ? <Loader label="Chargement des offres…"/> : data.offers.length === 0 ? <EmptyState title="Aucune offre dans votre périmètre" description="Créez une offre à partir d’un lot patrimonial." action={!sandbox && <Button onClick={() => setEditor({})}><Plus size={16}/>Créer une offre</Button>}/> : <Card className="p-0">
      <div className="grid gap-4 p-3 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,2fr)] lg:p-4">
        <section aria-label="Liste des offres" className={mobileDetail ? 'hidden self-start lg:block' : 'self-start'}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-oriana-lavande">Portefeuille commercial</p><h2 className="mt-1 font-titre text-2xl">Offres</h2></div>
            <Badge><span aria-live="polite">{visibleOffers.length} {visibleOffers.length === 1 ? 'offre trouvée' : 'offres trouvées'} sur {data.offers.length}</span></Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, numéro ou ville"/>
            <Select aria-label="Filtrer par nature" value={natureFilter} onChange={(event) => setNatureFilter(event.target.value)}>
              <option value="toutes">Toutes les natures</option><option value="vente">Vente</option>
              <option value="location">Location</option><option value="vente_et_location">Vente & location</option>
            </Select>
            <Select aria-label="Filtrer par type de bien" value={typeBienFilter} onChange={(event) => setTypeBienFilter(event.target.value)}>
              <option value="tous">Tous les types de bien</option>
              {availableTypeBiens.map((type) => <option key={type} value={type}>{typeBienLabels[type]}</option>)}
            </Select>
          </div>
          {hasActiveFilters && <div aria-label="Filtres actifs" className="mt-3 flex flex-wrap items-center gap-2">
            {query.trim() && <button type="button" className="rounded-full border border-oriana-bordure bg-oriana-surfaceAlt px-3 py-1 text-xs hover:border-oriana-lavande" onClick={() => setQuery('')}>Recherche : {query.trim()} ×</button>}
            {natureFilter !== 'toutes' && <button type="button" className="rounded-full border border-oriana-bordure bg-oriana-surfaceAlt px-3 py-1 text-xs hover:border-oriana-lavande" onClick={() => setNatureFilter('toutes')}>Nature : {natureLabels[natureFilter]} ×</button>}
            {typeBienFilter !== 'tous' && <button type="button" className="rounded-full border border-oriana-bordure bg-oriana-surfaceAlt px-3 py-1 text-xs hover:border-oriana-lavande" onClick={() => setTypeBienFilter('tous')}>Type : {typeBienLabels[typeBienFilter]} ×</button>}
            <button type="button" className="px-2 py-1 text-xs font-semibold text-oriana-lavande hover:underline" onClick={resetFilters}>Réinitialiser les filtres</button>
          </div>}
          <div className="mt-3 max-h-[42rem] space-y-2 overflow-y-auto pr-1">
            {visibleOffers.map((offer) => <button type="button" key={offer.id} aria-pressed={offer.id === effectiveSelectedId} onClick={() => chooseOffer(offer.id)} className={`w-full overflow-hidden rounded-oriana border text-left transition ${offer.id === effectiveSelectedId ? 'border-oriana-lavande bg-oriana-violet/15 shadow-oriana' : 'border-oriana-bordure bg-oriana-surface hover:bg-oriana-surfaceAlt'}`}>{offer.photo && <img className="aspect-[4/1] w-full object-cover" src={offer.photo} alt=""/>}<span className="flex items-start gap-3 p-3"><span className="mt-0.5 rounded-lg bg-oriana-violet/15 p-2 text-oriana-lavande"><BadgeEuro size={17}/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{offer.nom || offer.numero || `Offre #${offer.id}`}</span><span className="mt-1 block truncate text-xs text-oriana-discret">{[natureLabels[offer.nature], offer.ville].filter(Boolean).join(' · ')}</span></span><ChevronRight className="mt-2 shrink-0 text-oriana-discret" size={15}/></span></button>)}
            {visibleOffers.length === 0 && <div className="rounded-lg border border-dashed border-oriana-bordure p-6 text-center"><h3 className="text-sm font-semibold">Aucune offre trouvée</h3><p className="mt-1 text-xs text-oriana-discret">Modifiez la recherche ou les filtres pour retrouver une offre.</p><Button className="mt-4" variant="secondary" size="sm" onClick={resetFilters}>Réinitialiser les filtres</Button></div>}
          </div>
        </section>
        <section aria-label="Fiche de l’offre sélectionnée" className={mobileDetail ? 'min-w-0 space-y-5' : 'hidden min-w-0 space-y-5 lg:block'}>
          {selected ? <>
            <Card className="overflow-hidden p-0"><div className="grid md:grid-cols-[minmax(240px,38%)_1fr]">{selected.photo ? <img className="h-full min-h-56 w-full object-cover" src={selected.photo} alt={selected.photo_alt || ''}/> : <div className="grid min-h-48 place-items-center bg-oriana-surfaceAlt text-oriana-discret"><Building size={36}/></div>}<div className="p-5 md:p-6"><div className="flex flex-wrap gap-2"><Badge variant="accent">{natureLabels[selected.nature]}</Badge>{selected.numero && <Badge>{selected.numero}</Badge>}{sandbox && <Badge>Données fictives</Badge>}</div><h2 className="mt-3 font-titre text-3xl">{selected.nom || `Offre #${selected.id}`}</h2><p className="mt-2 flex items-center gap-2 text-sm text-oriana-discret"><MapPin size={15}/>{selected.ville ? `${selected.code_postal} ${selected.ville}` : relations.lot?.nom || `Lot #${selected.lot_id}`}</p><div className="mt-5 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 text-sm"><Users size={16} className="text-oriana-lavande"/>Gestion fictive anonymisée</span>{!sandbox && <Button variant="secondary" onClick={() => setEditor(selected)}><Pencil size={16}/>Modifier l’offre</Button>}</div></div></div></Card>
            <Card><Button className="mb-4 lg:hidden" variant="ghost" size="sm" onClick={() => setMobileDetail(false)}><ArrowLeft size={15}/>Retour aux offres</Button><Tabs tabs={tabItems} active={activeTab} onChange={setActiveTab} ariaLabel="Vues de la fiche Offre"><OfferTabPanel active={activeTab} selected={selected} relations={relations} data={data} load={load} sandbox={sandbox}/></Tabs></Card>
          </> : <EmptyState title="Sélectionnez une offre" description="Sa fiche commerciale apparaîtra ici sans perdre votre recherche."/>}
        </section>
      </div>
    </Card>}
    <Drawer open={Boolean(editor)} onClose={() => !pending && setEditor(null)} title={editor?.id ? `Modifier ${editor.nom || 'l’offre'}` : 'Créer une offre'}>{editor && <OfferEditor record={editor.id ? editor : null} lots={data.lots} pending={pending} onCancel={() => setEditor(null)} onSave={saveOffer}/>}</Drawer>
  </div>;
}

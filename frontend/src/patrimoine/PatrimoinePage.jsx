import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, ChevronRight, Factory, LandPlot, Pencil, Plus, RefreshCw, Warehouse } from 'lucide-react';
import { patrimoineApi } from '../api/patrimoine';
import { Badge, Breadcrumb, Button, Card, Checkbox, Drawer, EmptyState, Field, Input, Loader, Notification, PageHeader, SearchBar, Select, Tabs, Textarea } from '../components/ui';
import { QualificationPanel } from './QualificationPanel';

const emptyData = { sites: [], batiments: [], cellules: [], lots: [] };
const levels = [
  { key: 'sites', selectionKey: 'siteId', singular: 'site', label: 'Sites', icon: LandPlot },
  { key: 'batiments', selectionKey: 'batimentId', singular: 'bâtiment', label: 'Bâtiments', icon: Building2 },
  { key: 'cellules', selectionKey: 'celluleId', singular: 'cellule', label: 'Cellules', icon: Factory },
  { key: 'lots', selectionKey: 'lotId', singular: 'lot', label: 'Lots', icon: Warehouse },
];

function numberOrEmpty(value) { return value === '' ? '' : Number(value); }
function listIds(value) { return Array.isArray(value) ? value.filter((item) => item !== 'L').map(Number) : []; }
function formatSurface(value) { return value || value === 0 ? `${Number(value).toLocaleString('fr-FR')} m²` : 'Surface non renseignée'; }
function qualificationContext(entry, data) {
  if (!entry) return null;
  if (entry.resource === 'cellules') return entry.record.type_bien ? { niveau: 'cellule', famille: entry.record.type_bien } : null;
  const relatedCells = entry.resource === 'lots'
    ? data.cellules.filter((item) => listIds(entry.record.cellules).includes(Number(item.id)))
    : entry.resource === 'batiments' ? data.cellules.filter((item) => Number(item.batiment_id) === Number(entry.record.id)) : [];
  const families = [...new Set(relatedCells.map((item) => item.type_bien).filter(Boolean))];
  return families.length === 1 ? { niveau: entry.resource === 'lots' ? 'lot' : 'batiment', famille: families[0] } : null;
}

function initialForm(resource, record, selection) {
  const base = { nom: record?.nom || '', numero: record?.numero || '', surface: record?.surface ?? '', divisible: Boolean(record?.divisible), en_bloc: Boolean(record?.en_bloc) };
  if (resource === 'sites') return { ...base, surface_terrain: record?.surface_terrain ?? '', section_cadastrale: record?.section_cadastrale || '', servitudes: record?.servitudes || '', reserve_fonciere: Boolean(record?.reserve_fonciere) };
  if (resource === 'batiments') return { ...base, site_id: record?.site_id || selection.siteId || '', surface_totale: record?.surface_totale ?? '', annee_construction: record?.annee_construction ?? '', etat: record?.etat || '' };
  if (resource === 'cellules') return { ...base, batiment_id: record?.batiment_id || selection.batimentId || '', etage: record?.etage || '', type_bien: record?.type_bien || '' };
  return { ...base, cellule_id: listIds(record?.cellules)[0] || selection.celluleId || '', site_id: record?.site_id || selection.siteId || '', nombre_parking: record?.nombre_parking ?? '' };
}

function payloadFor(resource, form) {
  const common = { nom: form.nom.trim(), ...(form.numero ? { numero: form.numero.trim() } : {}) };
  if (resource === 'sites') return { ...common, surface_terrain: numberOrEmpty(form.surface_terrain), section_cadastrale: form.section_cadastrale, servitudes: form.servitudes, divisible: form.divisible, reserve_fonciere: form.reserve_fonciere, en_bloc: form.en_bloc };
  if (resource === 'batiments') return { ...common, site_id: Number(form.site_id), surface_totale: numberOrEmpty(form.surface_totale), annee_construction: numberOrEmpty(form.annee_construction), etat: form.etat, divisible: form.divisible };
  if (resource === 'cellules') return { ...common, batiment_id: Number(form.batiment_id), surface: numberOrEmpty(form.surface), etage: form.etage, ...(form.type_bien ? { type_bien: Number(form.type_bien) } : {}) };
  return { ...common, cellules: form.cellule_id ? [Number(form.cellule_id)] : [], site_id: form.cellule_id ? '' : Number(form.site_id), surface: numberOrEmpty(form.surface), divisible: form.divisible, nombre_parking: numberOrEmpty(form.nombre_parking), en_bloc: form.en_bloc };
}

function RecordButton({ record, active, onClick, icon: Icon, subtitle }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`w-full rounded-oriana border p-3 text-left transition ${active ? 'border-oriana-lavande bg-oriana-violet/15 shadow-oriana' : 'border-oriana-bordure bg-oriana-surface hover:bg-oriana-surfaceAlt'}`}>
    <span className="flex items-start gap-3"><span className="mt-0.5 rounded-lg bg-oriana-violet/15 p-2 text-oriana-lavande"><Icon size={17}/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{record.nom || `${record.numero || 'Sans nom'}`}</span><span className="mt-1 block truncate text-xs text-oriana-discret">{subtitle}</span></span><ChevronRight className="mt-2 shrink-0 text-oriana-discret" size={15}/></span>
  </button>;
}

function HeritageForm({ resource, record, selection, data, pending, onCancel, onSave }) {
  const [form, setForm] = useState(() => initialForm(resource, record, selection));
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const title = levels.find((level) => level.key === resource)?.singular;
  const parentRequired = resource === 'batiments' ? !form.site_id : resource === 'cellules' ? !form.batiment_id : resource === 'lots' ? !form.cellule_id && !form.site_id : false;
  const invalid = !form.nom.trim() || parentRequired;

  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Nom"><Input value={form.nom} onChange={(event) => set('nom', event.target.value)} autoFocus/></Field>{resource !== 'sites' && <Field label="Numéro"><Input value={form.numero} onChange={(event) => set('numero', event.target.value)}/></Field>}</div>
    {resource === 'batiments' && <Field label="Site parent"><Select value={form.site_id} onChange={(event) => set('site_id', event.target.value)}><option value="">Sélectionner un site</option>{data.sites.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</Select></Field>}
    {resource === 'cellules' && <Field label="Bâtiment parent"><Select value={form.batiment_id} onChange={(event) => set('batiment_id', event.target.value)}><option value="">Sélectionner un bâtiment</option>{data.batiments.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</Select></Field>}
    {resource === 'lots' && <><Field label="Cellule rattachée" hint="Laissez vide pour un lot de terrain nu."><Select value={form.cellule_id} onChange={(event) => set('cellule_id', event.target.value)}><option value="">Aucune — terrain nu</option>{data.cellules.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</Select></Field>{!form.cellule_id && <Field label="Site du terrain"><Select value={form.site_id} onChange={(event) => set('site_id', event.target.value)}><option value="">Sélectionner un site</option>{data.sites.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</Select></Field>}</>}
    <div className="grid gap-4 sm:grid-cols-2">
      {resource === 'sites' && <><Field label="Surface terrain (m²)"><Input type="number" min="0" value={form.surface_terrain} onChange={(event) => set('surface_terrain', event.target.value)}/></Field><Field label="Section cadastrale"><Input value={form.section_cadastrale} onChange={(event) => set('section_cadastrale', event.target.value)}/></Field></>}
      {resource === 'batiments' && <><Field label="Surface totale (m²)"><Input type="number" min="0" value={form.surface_totale} onChange={(event) => set('surface_totale', event.target.value)}/></Field><Field label="Année de construction"><Input type="number" min="1000" max="2200" value={form.annee_construction} onChange={(event) => set('annee_construction', event.target.value)}/></Field><Field label="État"><Input value={form.etat} onChange={(event) => set('etat', event.target.value)} placeholder="Bon, à rénover…"/></Field></>}
      {(resource === 'cellules' || resource === 'lots') && <Field label="Surface (m²)"><Input type="number" min="0" value={form.surface} onChange={(event) => set('surface', event.target.value)}/></Field>}
      {resource === 'cellules' && <><Field label="Étage"><Input value={form.etage} onChange={(event) => set('etage', event.target.value)}/></Field><Field label="Identifiant famille"><Input type="number" min="1" value={form.type_bien} onChange={(event) => set('type_bien', event.target.value)}/></Field></>}
      {resource === 'lots' && <Field label="Places de parking"><Input type="number" min="0" value={form.nombre_parking} onChange={(event) => set('nombre_parking', event.target.value)}/></Field>}
    </div>
    {resource === 'sites' && <Field label="Servitudes"><Textarea value={form.servitudes} onChange={(event) => set('servitudes', event.target.value)}/></Field>}
    <div className="flex flex-wrap gap-4">{['sites', 'batiments', 'lots'].includes(resource) && <Checkbox label="Divisible" checked={form.divisible} onChange={(event) => set('divisible', event.target.checked)}/>} {['sites', 'lots'].includes(resource) && <Checkbox label="En bloc" checked={form.en_bloc} onChange={(event) => set('en_bloc', event.target.checked)}/>} {resource === 'sites' && <Checkbox label="Réserve foncière" checked={form.reserve_fonciere} onChange={(event) => set('reserve_fonciere', event.target.checked)}/>}</div>
    {parentRequired && <p role="alert" className="text-sm text-oriana-lavandeClair">Sélectionnez un parent pour ce {title}.</p>}
    <div className="flex justify-end gap-2 border-t border-oriana-bordure pt-4"><Button variant="secondary" onClick={onCancel}>Annuler</Button><Button disabled={invalid || pending} onClick={() => onSave(payloadFor(resource, form))}>{pending ? 'Enregistrement…' : record ? 'Enregistrer' : `Créer le ${title}`}</Button></div>
  </div>;
}

export function PatrimoinePage({ readOnly = false }) {
  const [data, setData] = useState(emptyData);
  const [selection, setSelection] = useState({ siteId: null, batimentId: null, celluleId: null, lotId: null });
  const [activeLevel, setActiveLevel] = useState('sites');
  const [query, setQuery] = useState('');
  const [mobileDetail, setMobileDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null);
  const [pending, setPending] = useState(false);

  async function load() { setLoading(true); setError(''); try { const result = await patrimoineApi.listAll(); setData(result); setSelection((current) => ({ ...current, siteId: current.siteId || result.sites[0]?.id || null })); } catch { setError('Le patrimoine n’a pas pu être chargé.'); } finally { setLoading(false); } }
  useEffect(() => {
    let active = true;
    patrimoineApi.listAll().then((result) => {
      if (!active) return;
      setData(result);
      setSelection((current) => ({ ...current, siteId: current.siteId || result.sites[0]?.id || null }));
    }).catch(() => {
      if (active) setError('Le patrimoine n’a pas pu être chargé.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => ({
    sites: data.sites,
    batiments: selection.siteId ? data.batiments.filter((item) => Number(item.site_id) === Number(selection.siteId)) : [],
    cellules: selection.batimentId ? data.cellules.filter((item) => Number(item.batiment_id) === Number(selection.batimentId)) : [],
    lots: selection.celluleId ? data.lots.filter((item) => listIds(item.cellules).includes(Number(selection.celluleId))) : selection.siteId ? data.lots.filter((item) => Number(item.site_id) === Number(selection.siteId)) : [],
  }), [data, selection]);

  function select(resource, id) {
    if (resource === 'sites') setSelection({ siteId: id, batimentId: null, celluleId: null, lotId: null });
    if (resource === 'batiments') setSelection((current) => ({ ...current, batimentId: id, celluleId: null, lotId: null }));
    if (resource === 'cellules') setSelection((current) => ({ ...current, celluleId: id, lotId: null }));
    if (resource === 'lots') setSelection((current) => ({ ...current, lotId: id }));
    setMobileDetail(true);
  }

  const activeLevelConfig = levels.find((level) => level.key === activeLevel);
  const activeLevelIndex = levels.findIndex((level) => level.key === activeLevel);
  const activeRecords = visible[activeLevel].filter((record) => `${record.nom || ''} ${record.numero || ''}`.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')));
  const activeRecord = data[activeLevel].find((record) => record.id === selection[activeLevelConfig.selectionKey]);
  const selectedEntry = activeRecord ? { resource: activeLevel, record: activeRecord } : null;
  const selectedPath = levels.slice(0, activeLevelIndex + 1).map((level) => ({ ...level, record: data[level.key].find((record) => record.id === selection[level.selectionKey]) })).filter((level) => level.record);
  const qualification = qualificationContext(selectedEntry, data);
  async function save(payload) { setPending(true); setError(''); try { const response = editor.record ? await patrimoineApi.update(editor.resource, editor.record.id, payload) : await patrimoineApi.create(editor.resource, payload); await load(); setEditor(null); setActiveLevel(editor.resource); select(editor.resource, response.data.id); } catch { setError('L’enregistrement a échoué. Vérifiez les informations et votre périmètre.'); } finally { setPending(false); } }

  function changeLevel(resource) {
    setActiveLevel(resource);
    setQuery('');
    setMobileDetail(false);
  }

  return <div className="space-y-7 animate-enter">
    <Breadcrumb items={['Accueil', 'Patrimoine']}/>
    <PageHeader eyebrow="Actifs immobiliers" title="Patrimoine" description={readOnly ? 'Prévisualisez la hiérarchie complète, du site jusqu’au lot commercialisable.' : 'Parcourez et maintenez la hiérarchie complète, du site jusqu’au lot commercialisable.'} actions={<><Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Actualiser</Button>{!readOnly && <Button onClick={() => setEditor({ resource: 'sites', record: null })}><Plus size={17}/>Nouveau site</Button>}</>}/>
    {readOnly && <Notification title="Données fictives en lecture seule" description="Vous pouvez parcourir et qualifier visuellement les actifs sans modifier les données."/>}
    {error && <Notification title="Action impossible" description={error}/>} {loading && <Loader label="Chargement du patrimoine…"/>}
    {!loading && data.sites.length === 0 ? <EmptyState title="Aucun site dans votre périmètre" description={readOnly ? 'Aucune donnée fictive n’est disponible pour cette prévisualisation.' : 'Créez le premier site pour commencer la hiérarchie patrimoniale.'} action={!readOnly ? <Button onClick={() => setEditor({ resource: 'sites', record: null })}><Plus size={16}/>Créer un site</Button> : undefined}/> : !loading && <Card className="p-0">
      <Tabs tabs={levels.map((level) => ({ id: level.key, label: `${level.label} · ${visible[level.key].length}` }))} active={activeLevel} onChange={changeLevel} ariaLabel="Niveaux du patrimoine">
        <div className="grid gap-4 p-3 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,2fr)] lg:p-4">
          <section aria-label={`Liste des ${activeLevelConfig.label.toLocaleLowerCase('fr')}`} className={mobileDetail ? 'hidden self-start lg:block' : 'self-start'}>
            <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-oriana-lavande">Niveau {activeLevelIndex + 1} sur 4</p><h2 className="mt-1 font-titre text-2xl">{activeLevelConfig.label}</h2></div><div className="flex items-center gap-2"><Badge>{visible[activeLevel].length}</Badge>{!readOnly && <Button variant="ghost" size="sm" aria-label={`Créer un ${activeLevelConfig.singular}`} onClick={() => setEditor({ resource: activeLevel, record: null })}><Plus size={16}/></Button>}</div></div>
            <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Rechercher dans les ${activeLevelConfig.label.toLocaleLowerCase('fr')}`}/>
            <div className="mt-3 max-h-[34rem] space-y-2 overflow-y-auto pr-1">{activeRecords.map((record) => <RecordButton key={record.id} record={record} icon={activeLevelConfig.icon} active={record.id === selection[activeLevelConfig.selectionKey]} onClick={() => select(activeLevel, record.id)} subtitle={activeLevel === 'sites' ? formatSurface(record.surface_terrain) : activeLevel === 'batiments' ? formatSurface(record.surface_totale) : formatSurface(record.surface)}/>)}{activeRecords.length === 0 && <p className="rounded-lg border border-dashed border-oriana-bordure p-6 text-center text-sm text-oriana-discret">{query ? 'Aucun élément ne correspond à cette recherche.' : 'Aucun élément dans ce contexte.'}</p>}</div>
          </section>
          <section aria-label="Fiche de l’actif sélectionné" className={mobileDetail ? 'space-y-4' : 'hidden space-y-4 lg:block'}>
            {!selectedEntry ? <EmptyState title={`Sélectionnez un ${activeLevelConfig.singular}`} description={`Sa fiche et son rattachement apparaîtront ici sans perdre la liste des ${activeLevelConfig.label.toLocaleLowerCase('fr')}.`}/> : <>
              <Card>
                <Button className="mb-4 lg:hidden" variant="ghost" size="sm" onClick={() => setMobileDetail(false)}><ArrowLeft size={15}/>Retour à la liste</Button>
                <nav aria-label="Rattachement de l’actif" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-oriana-discret">{selectedPath.map((level, index) => <span className="inline-flex items-center gap-2" key={level.key}>{index > 0 && <ChevronRight size={12}/>}<span>{level.record.nom || level.label}</span></span>)}</nav>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="accent">{activeLevelConfig.singular}</Badge>{selectedEntry.record.numero && <Badge>N° {selectedEntry.record.numero}</Badge>}</div><h2 className="mt-3 font-titre text-3xl">{selectedEntry.record.nom}</h2><p className="mt-2 text-sm text-oriana-discret">{formatSurface(selectedEntry.record.surface ?? selectedEntry.record.surface_totale ?? selectedEntry.record.surface_terrain)}</p></div>{!readOnly && <Button variant="secondary" onClick={() => setEditor(selectedEntry)}><Pencil size={16}/>Modifier la fiche</Button>}</div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-oriana-discret"><span className="rounded-full bg-oriana-surfaceAlt px-3 py-1.5">Gestionnaire #{selectedEntry.record.gestionnaire || '—'}</span><span className="rounded-full bg-oriana-surfaceAlt px-3 py-1.5">Agence #{selectedEntry.record.agence_id || '—'}</span>{selectedEntry.record.divisible && <span className="rounded-full bg-oriana-violet/15 px-3 py-1.5 text-oriana-lavandeClair">Divisible</span>}</div>
                {activeLevel !== 'lots' && <div className="mt-6 border-t border-oriana-bordure pt-4"><Button variant="secondary" onClick={() => changeLevel(levels[activeLevelIndex + 1].key)}>Explorer les {levels[activeLevelIndex + 1].label.toLocaleLowerCase('fr')}<ChevronRight size={15}/></Button></div>}
              </Card>
              {qualification && <QualificationPanel key={`${qualification.niveau}-${selectedEntry.record.id}-${qualification.famille}`} niveau={qualification.niveau} bienId={selectedEntry.record.id} famille={qualification.famille} readOnly={readOnly}/>}
            </>}
          </section>
        </div>
      </Tabs>
    </Card>}
    {!readOnly && <Drawer open={Boolean(editor)} onClose={() => !pending && setEditor(null)} title={editor?.record ? `Modifier ${editor.record.nom}` : `Créer un ${levels.find((level) => level.key === editor?.resource)?.singular || ''}`}>{editor && <HeritageForm key={`${editor.resource}-${editor.record?.id || 'new'}`} {...editor} selection={selection} data={data} pending={pending} onCancel={() => setEditor(null)} onSave={save}/>}</Drawer>}
  </div>;
}

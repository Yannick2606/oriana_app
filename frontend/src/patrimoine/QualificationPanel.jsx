import { useEffect, useState } from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';
import { qualificationApi } from '../api/qualification';
import { Button, Card, Checkbox, Field, Input, Loader } from '../components/ui';

function valueField(type) { return type === 'bool' ? 'valeur_bool' : type === 'nombre' ? 'valeur_nombre' : 'valeur_texte'; }
function initialValues(dictionary, records) {
  return Object.fromEntries(dictionary.map((characteristic) => {
    const field = valueField(characteristic.type_valeur);
    const existing = records.find((record) => Number(record.caracteristique_id) === Number(characteristic.id));
    return [characteristic.id, existing?.[field] ?? (characteristic.type_valeur === 'bool' ? false : '')];
  }));
}

export function QualificationPanel({ niveau, bienId, famille, readOnly = false }) {
  const [dictionary, setDictionary] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([qualificationApi.dictionary(famille, niveau), qualificationApi.values(niveau, bienId)])
      .then(([dictionaryPayload, valuesPayload]) => {
        if (!active) return;
        setDictionary(dictionaryPayload.data);
        setValues(initialValues(dictionaryPayload.data, valuesPayload.data));
      })
      .catch(() => { if (active) setFeedback('La qualification n’a pas pu être chargée.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bienId, famille, niveau]);

  async function save() {
    setPending(true); setFeedback('');
    try {
      const assetField = `${niveau}_id`;
      const entries = dictionary.filter((item) => item.type_valeur === 'bool' || values[item.id] !== '');
      await Promise.all(entries.map((item) => {
        const field = valueField(item.type_valeur);
        const raw = values[item.id];
        return qualificationApi.save({ caracteristique_id: item.id, niveau, [assetField]: bienId, [field]: item.type_valeur === 'nombre' ? Number(raw) : raw });
      }));
      setFeedback('Qualification enregistrée.');
    } catch { setFeedback('L’enregistrement de la qualification a échoué.'); }
    finally { setPending(false); }
  }

  return <Card>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-oriana-lavande"><SlidersHorizontal size={15}/>Qualification dynamique</p><h2 className="mt-2 font-titre text-xl">Caractéristiques du bien</h2><p className="mt-1 text-xs text-oriana-discret">{readOnly ? 'Prévisualisation : qualification en lecture seule.' : 'Les champs proviennent du dictionnaire de la famille sélectionnée.'}</p></div>{feedback && <p role="status" className="flex items-center gap-2 text-sm text-oriana-lavandeClair"><Check size={15}/>{feedback}</p>}</div>
    {loading ? <div className="mt-5"><Loader label="Chargement des caractéristiques…"/></div> : dictionary.length === 0 ? <p className="mt-5 rounded-oriana border border-dashed border-oriana-bordure p-4 text-sm text-oriana-discret">Aucune caractéristique n’est définie pour cette famille et ce niveau.</p> : <div className="mt-5 space-y-5"><div className="grid gap-4 md:grid-cols-2">{dictionary.sort((a, b) => Number(a.ordre || 0) - Number(b.ordre || 0)).map((item) => item.type_valeur === 'bool' ? <div className="rounded-oriana border border-oriana-bordure p-3" key={item.id}><Checkbox label={item.libelle} checked={Boolean(values[item.id])} disabled={readOnly} onChange={(event) => setValues((current) => ({ ...current, [item.id]: event.target.checked }))}/></div> : <Field key={item.id} label={item.libelle} hint={item.unite ? `Unité : ${item.unite}` : item.type_valeur === 'liste' ? 'Choisissez une valeur prévue par le référentiel.' : undefined}><Input type={item.type_valeur === 'nombre' ? 'number' : 'text'} step="any" value={values[item.id] ?? ''} disabled={readOnly} onChange={(event) => setValues((current) => ({ ...current, [item.id]: event.target.value }))}/></Field>)}</div>{!readOnly && <div className="flex justify-end"><Button onClick={save} disabled={pending}>{pending ? 'Enregistrement…' : 'Enregistrer la qualification'}</Button></div>}</div>}
  </Card>;
}

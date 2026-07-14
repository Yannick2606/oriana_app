export function Logo({ compact = false }) {
  return <div aria-label="orIAna — From data to deals" className="select-none">
    <div className="font-titre text-2xl tracking-tight text-oriana-texte">or<span className="bg-gradient-to-r from-oriana-lavandeClair via-oriana-lavandeMoyen to-oriana-lavande bg-clip-text font-bold text-transparent">IA</span>{compact ? '' : 'na'}</div>
    {!compact && <div className="mt-0.5 text-[8px] tracking-[0.26em] text-oriana-lavande">FROM DATA TO DEALS</div>}
  </div>;
}

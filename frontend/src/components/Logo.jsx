export function Logo({ compact = false, inverse = false }) {
  return <div aria-label="orIAna — From data to deals" className="min-w-0 select-none">
    <div data-logo-word className={`whitespace-nowrap font-titre tracking-tight ${compact ? 'text-base' : 'text-2xl'} ${inverse ? 'text-oriana-navigationText' : 'text-oriana-texte'}`}>or<span className="bg-gradient-to-r from-oriana-lavandeClair via-oriana-lavandeMoyen to-oriana-lavande bg-clip-text font-bold text-transparent">IA</span>na</div>
    {!compact && <div className="mt-0.5 text-[8px] tracking-[0.26em] text-oriana-lavande">FROM DATA TO DEALS</div>}
  </div>;
}

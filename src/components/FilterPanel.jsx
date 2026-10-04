import { CaretDown, Check } from '@phosphor-icons/react'
import { Swatch } from './ui'

export default function FilterPanel({ facets, filters, onToggle }) {
  return (
    <div className="flex flex-col">
      {facets.map((g, gi) => {
        const selected = filters[g.key] || []
        return (
          <details key={g.key} open={gi < 4 || selected.length > 0} className="group border-b border-line py-1 last:border-0">
            <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-extrabold">
              <span>{g.label}{selected.length > 0 && <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] text-white">{selected.length}</span>}</span>
              <CaretDown size={14} className="text-muted transition group-open:rotate-180" />
            </summary>
            {g.chips ? (
              <div className="flex flex-wrap gap-2 pb-4">
                {g.options.map((o) => (
                  <button key={o.id} type="button" onClick={() => onToggle(g.key, o.id, g.single)} aria-pressed={selected.includes(o.id)} className={`chip ${selected.includes(o.id) ? 'chip-active' : ''}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <ul className={`flex flex-col pb-3 ${g.options.length > 7 ? 'max-h-64 overflow-y-auto pr-1' : ''}`}>
                {g.options.map((o) => {
                  const on = selected.includes(o.id)
                  return (
                    <li key={o.id}>
                      <button type="button" onClick={() => onToggle(g.key, o.id, g.single)} aria-pressed={on} className="flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left text-sm hover:text-coral-700">
                        <span className={`grid h-[18px] w-[18px] shrink-0 place-items-center border-2 ${g.single ? 'rounded-full' : 'rounded-md'} ${on ? 'border-brand bg-brand text-white' : 'border-ink/25 bg-surface'}`}>
                          {on && <Check size={11} weight="bold" />}
                        </span>
                        {g.swatches && <Swatch colour={o.id} size="sm" />}
                        <span className={`flex-1 ${on ? 'font-bold' : ''}`}>{o.label}</span>
                        <span className="text-xs text-muted">{o.count}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </details>
        )
      })}
    </div>
  )
}

import { Sun, Moon, Desktop } from '@phosphor-icons/react'
import { useTheme, resolveTheme } from '../lib/theme'

const OPTIONS = [['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'Auto', Desktop]]

// Three-way switch for the footer and the mobile menu. "Auto" follows the phone or laptop setting.
export default function ThemeSwitch({ className = '' }) {
  const pref = useTheme((s) => s.pref)
  const setPref = useTheme((s) => s.setPref)
  return (
    <div role="radiogroup" aria-label="Colour theme" className={`inline-flex rounded-full border border-line bg-cream p-1 ${className}`}>
      {OPTIONS.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={pref === id}
          onClick={() => setPref(id)}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${pref === id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  )
}

// One-tap toggle for the desktop header.
export function ThemeToggle({ className = '' }) {
  const pref = useTheme((s) => s.pref)
  const setPref = useTheme((s) => s.setPref)
  const dark = resolveTheme(pref) === 'dark'
  return (
    <button
      type="button"
      onClick={() => setPref(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-ink/5 ${className}`}
    >
      {dark ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  )
}

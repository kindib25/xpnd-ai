'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const ACCENT_COLORS = [
  { id: 'violet',  name: 'Violet',  hex: '#724bf6' },
  { id: 'blue',    name: 'Blue',    hex: '#3b82f6' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'rose',    name: 'Rose',    hex: '#f43f5e' },
  { id: 'orange',  name: 'Orange',  hex: '#f97316' },
  { id: 'cyan',    name: 'Cyan',    hex: '#06b6d4' },
  { id: 'lime',    name: 'Lime',    hex: '#9ee82d' },
]

interface AppearanceSettingsProps {
  initialTheme?: string
  initialAccent?: string
}

export function AppearanceSettings({
  initialTheme = 'system',
  initialAccent = 'violet',
}: AppearanceSettingsProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accent, setAccent] = useState(initialAccent)
  const [isSaving, setIsSaving] = useState(false)

  // ─── On mount: sync DB → localStorage → DOM ─────────────────────
  useEffect(() => {
    setMounted(true)

    // Trust the DB (props) as source of truth on settings load.
    // If DB has never been set, fall back to localStorage.
    const savedAccent = initialAccent || localStorage.getItem('app-accent') || 'violet'

    setAccent(savedAccent)
    localStorage.setItem('app-accent', savedAccent)
    document.documentElement.setAttribute('data-accent', savedAccent)
  }, [initialAccent])

  // ─── Save helper: writes to Supabase + localStorage ─────────────
  const savePreference = async (patch: {
    theme_preference?: string
    accent_color?: string
  }) => {
    // 1. Apply immediately to localStorage + DOM (instant feedback)
    if (patch.accent_color) {
      localStorage.setItem('app-accent', patch.accent_color)
      document.documentElement.setAttribute('data-accent', patch.accent_color)
    }

    // 2. Persist to Supabase
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // not logged in — localStorage alone is fine

      const { error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', user.id)

      if (error) throw error
    } catch (err) {
      console.error('[appearance] Failed to save preference:', err)
      toast.error('Could not save your preference. It will still apply to this device.')
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Change handlers ────────────────────────────────────────────
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)                // next-themes handles .dark class + localStorage
    savePreference({ theme_preference: newTheme })
  }

  const handleAccentChange = (colorId: string) => {
    setAccent(colorId)                // instant UI update
    savePreference({ accent_color: colorId })
  }

  if (!mounted) return null

  return (
    <div className="space-y-8">

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Saving preference…
        </div>
      )}

      {/* ─── Display Mode ─── */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Display Mode</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { id: 'dark',   icon: Moon,    label: 'Dark' },
            { id: 'light',  icon: Sun,     label: 'Light' },
            { id: 'system', icon: Monitor, label: 'System' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleThemeChange(id)}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all duration-300 ${
                theme === id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
              }`}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{label}</span>
              {theme === id && <span className="text-[10px] text-primary">Selected</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Accent Color ─── */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Accent Color</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose your preferred application accent color.
        </p>
        <div className="flex flex-wrap gap-4">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleAccentChange(color.id)}
              className="group flex flex-col items-center gap-2"
            >
              <div
                className={`size-8 rounded-full flex items-center justify-center transition-transform ${
                  accent === color.id
                    ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {accent === color.id && <div className="size-2 bg-white rounded-full" />}
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Preview Card ─── */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Preview</h3>
        <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-foreground">Xpnd AI</span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-foreground mb-2">₱12,500.00</p>
              <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 rounded-full" />
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:opacity-90">
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
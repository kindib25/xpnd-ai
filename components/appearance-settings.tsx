'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'

const ACCENT_COLORS = [
  { id: 'violet', name: 'Violet', hex: '#724bf6' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
  { id: 'orange', name: 'Orange', hex: '#f97316' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4' },
  { id: 'lime', name: 'Lime', hex: '#9ee82d' }, 
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accent, setAccent] = useState('violet')

  useEffect(() => {
    setMounted(true)
    const savedAccent = localStorage.getItem('app-accent') || 'violet'
    setAccent(savedAccent)
    document.documentElement.setAttribute('data-accent', savedAccent)
  }, [])

  const handleAccentChange = (colorId: string) => {
    setAccent(colorId)
    localStorage.setItem('app-accent', colorId)
    document.documentElement.setAttribute('data-accent', colorId)
  }

  if (!mounted) return null

  return (
    <div className="space-y-8">
      {/* Display Mode */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Display Mode</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all duration-300 ${
              theme === 'dark'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
            }`}
          >
            <Moon className="size-5" />
            <span className="text-xs font-medium">Dark</span>
            {theme === 'dark' && <span className="text-[10px] text-primary">Selected</span>}
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all duration-300 ${
              theme === 'light'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
            }`}
          >
            <Sun className="size-5" />
            <span className="text-xs font-medium">Light</span>
            {theme === 'light' && <span className="text-[10px] text-primary">Selected</span>}
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all duration-300 ${
              theme === 'system'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
            }`}
          >
            <Monitor className="size-5" />
            <span className="text-xs font-medium">System</span>
            {theme === 'system' && <span className="text-[10px] text-primary">Selected</span>}
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Accent Color</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose your preferred application accent color.</p>
        <div className="flex flex-wrap gap-4">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleAccentChange(color.id)}
              className="group flex flex-col items-center gap-2"
            >
              <div
                className={`size-8 rounded-full flex items-center justify-center transition-transform ${
                  accent === color.id ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {accent === color.id && <div className="size-2 bg-white rounded-full" />}
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Card */}
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
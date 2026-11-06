import { createContext, useContext, useMemo } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'

export interface Palette {
  dark: boolean
  bg: string
  card: string
  cardPressed: string
  text: string
  text2: string
  text3: string
  sep: string
  accent: string
  onAccent: string
  accentSoft: string
  danger: string
  bar: string
  field: string
  backdrop: string
  snackbar: string
  snackbarText: string
  snackbarAction: string
  ripple: string
  flash: string
}

export const light: Palette = {
  dark: false,
  bg: '#f4f5f2',
  card: '#ffffff',
  cardPressed: '#eceeea',
  text: '#16181a',
  text2: '#5f6368',
  text3: '#a3a7ab',
  sep: 'rgba(0,0,0,0.08)',
  accent: '#1f9d5c',
  onAccent: '#ffffff',
  accentSoft: 'rgba(31,157,92,0.12)',
  danger: '#d93838',
  bar: '#f4f5f2',
  field: '#ffffff',
  backdrop: 'rgba(0,0,0,0.32)',
  snackbar: '#2b2f2d',
  snackbarText: '#f2f4f1',
  snackbarAction: '#7ee2a8',
  ripple: 'rgba(0,0,0,0.08)',
  flash: '#d9f0e2',
}

export const dark: Palette = {
  dark: true,
  bg: '#0f1110',
  card: '#1c1f1d',
  cardPressed: '#262a28',
  text: '#eef1ee',
  text2: '#a2a8a4',
  text3: '#636a66',
  sep: 'rgba(255,255,255,0.08)',
  accent: '#3ccf84',
  onAccent: '#04210f',
  accentSoft: 'rgba(60,207,132,0.16)',
  danger: '#ff6b6b',
  bar: '#0f1110',
  field: '#1c1f1d',
  backdrop: 'rgba(0,0,0,0.55)',
  snackbar: '#e7ebe8',
  snackbarText: '#1a1d1b',
  snackbarAction: '#137a45',
  ripple: 'rgba(255,255,255,0.1)',
  flash: '#1d3a2a',
}

export const ThemeContext = createContext<Palette>(light)
export const useColors = () => useContext(ThemeContext)

export const radius = 16
export const gutter = 16

/** Faktor für alle Schriftgrößen der App (Schalter A− und A+ auf dem Startbildschirm). */
export const FontScaleContext = createContext(1)

const round = (n: number) => Math.round(n * 10) / 10

/** Rechnet eine Schriftgröße mit der gewählten Stufe um. */
export function useFont(): (size: number) => number {
  const scale = useContext(FontScaleContext)
  return (size: number) => round(size * scale)
}

type Styles = Record<string, object>
const scaledCache = new WeakMap<Styles, Map<number, Styles>>()

/**
 * Gibt die Styles einer Komponente mit umgerechneter Schrift zurück: fontSize und lineHeight
 * wachsen mit der gewählten Stufe. Je Stufe wird nur einmal gerechnet, nicht für jede Zeile.
 */
export function useScaled<T extends Styles>(styles: T): T {
  const scale = useContext(FontScaleContext)
  return useMemo(() => {
    if (scale === 1) return styles
    let byScale = scaledCache.get(styles)
    if (!byScale) scaledCache.set(styles, (byScale = new Map()))
    let scaled = byScale.get(scale)
    if (!scaled) {
      scaled = {}
      for (const [name, style] of Object.entries(styles)) {
        const s = style as { fontSize?: number; lineHeight?: number }
        scaled[name] =
          s.fontSize === undefined && s.lineHeight === undefined
            ? style
            : {
                ...style,
                ...(s.fontSize !== undefined && { fontSize: round(s.fontSize * scale) }),
                ...(s.lineHeight !== undefined && { lineHeight: round(s.lineHeight * scale) }),
              }
      }
      byScale.set(scale, scaled)
    }
    return scaled as T
  }, [styles, scale])
}

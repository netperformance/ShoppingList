import type { Repository } from '../data/repository'
import { isLang, type Lang } from '../domain/lang'
import type { ThemeMode } from './theme'

/**
 * Einstellungen, die nur dieses Handy betreffen. Sie liegen in der Datenbank des Handys
 * (Tabelle meta) und werden nicht synchronisiert. Beim Start liest die App sie, bevor sie
 * etwas anzeigt, damit sie gleich in der gewählten Darstellung erscheint.
 */
export interface Prefs {
  theme: ThemeMode
  /** Einträge nach Kategorien ordnen. Aus: alle untereinander in der Reihenfolge des Eintragens. */
  grouped: boolean
  /** Sprache der Oberfläche und der Vorschläge. */
  language: Lang
  /** Stufe der Schriftgröße, Index in FONT_STEPS. */
  fontStep: number
}

/** Stufen der Schriftgröße (Schalter A− und A+). Stufe 1 ist die normale Größe. */
export const FONT_STEPS = [0.85, 1, 1.15, 1.3, 1.5]
export const DEFAULT_FONT_STEP = 1

/**
 * Ohne gespeicherte Wahl startet die App hell, auch wenn das Handy dunkel eingestellt ist.
 * Die Sprache folgt ohne gespeicherte Wahl dem Handy: App.tsx gibt sie an loadPrefs.
 */
export const DEFAULT_PREFS: Prefs = { theme: 'light', grouped: true, language: 'de', fontStep: DEFAULT_FONT_STEP }

const key = (name: keyof Prefs) => `pref:${name}`

/** Diese Werte bleiben auch bei "Alle Daten löschen" erhalten. */
export const PREF_KEYS = (Object.keys(DEFAULT_PREFS) as (keyof Prefs)[]).map(key)

export async function loadPrefs(repo: Repository, deviceLanguage: Lang = DEFAULT_PREFS.language): Promise<Prefs> {
  const prefs = { ...DEFAULT_PREFS, language: deviceLanguage }
  try {
    const theme = await repo.getMeta<ThemeMode>(key('theme'))
    if (theme === 'system' || theme === 'light' || theme === 'dark') prefs.theme = theme
    const grouped = await repo.getMeta<boolean>(key('grouped'))
    if (typeof grouped === 'boolean') prefs.grouped = grouped
    const language = await repo.getMeta<Lang>(key('language'))
    if (isLang(language)) prefs.language = language
    const fontStep = await repo.getMeta<number>(key('fontStep'))
    if (typeof fontStep === 'number' && fontStep >= 0 && fontStep < FONT_STEPS.length) prefs.fontStep = Math.round(fontStep)
  } catch (error) {
    console.error('Einstellungen nicht lesbar', error)
  }
  return prefs
}

export function savePref<K extends keyof Prefs>(repo: Repository, name: K, value: Prefs[K]): Promise<void> {
  return repo.setMeta(key(name), value).catch((error) => console.error('Einstellung nicht gespeichert', error))
}

import data from './catalog.json'
import type { Lang } from './lang'
import type { Category } from './model'
import { normalize } from './normalize'

/**
 * Mitgelieferter Produktkatalog, je Sprache einer. Er dient nur für Vorschläge und die
 * Zuordnung zu Kategorien. Produkte, die der Nutzer selbst einträgt, lernt die App dazu
 * (Sammlung "products"), der Katalog selbst bleibt unverändert.
 * Beide Kataloge nutzen dieselben Kategorien. Quelle: scripts/build-catalog.py
 */

type RawCategory = { id: string; name: string; name_en: string; emoji: string }
const RAW_CATEGORIES = data.categories as RawCategory[]

/** Die mitgelieferten Kategorien mit ihrem Namen in jeder Sprache. */
const BUILTIN_NAMES = new Map(RAW_CATEGORIES.map((c) => [c.id, { de: c.name, en: c.name_en } as Record<Lang, string>]))

/** Die mitgelieferten Kategorien in der angegebenen Sprache. Welche gerade gelten, bestimmt categories.ts. */
export const builtinCategories = (lang: Lang): Category[] =>
  RAW_CATEGORIES.map((c) => ({ id: c.id, name: lang === 'en' ? c.name_en : c.name, emoji: c.emoji }))

/** Die mitgelieferten Kategorien auf Deutsch, z. B. für ihre IDs und Reihenfolge. */
export const BUILTIN_CATEGORIES: Category[] = builtinCategories('de')

/**
 * Ob ein Name einer der mitgelieferten Namen dieser Kategorie ist, in irgendeiner Sprache.
 * Dann hat der Nutzer sie nicht umbenannt und die App zeigt den Namen in der gewählten Sprache.
 */
export const isBuiltinName = (id: string, name: string): boolean => {
  const names = BUILTIN_NAMES.get(id)
  return !!names && (names.de === name || names.en === name)
}

/** Auffangabteilung. Sie lässt sich umbenennen, aber nicht löschen. */
export const FALLBACK_CATEGORY = 'sonstiges'
export const DEFAULT_CATEGORY_ORDER = BUILTIN_CATEGORIES.map((c) => c.id)

export interface CatalogEntry {
  name: string
  key: string
  categoryId: string
  /** Alltagsprodukt wie Milch oder Brot. Wird bei gleich guten Treffern zuerst vorgeschlagen. */
  common: boolean
}

export interface Catalog {
  entries: CatalogEntry[]
  byKey: Map<string, CatalogEntry>
}

function buildCatalog(products: [string, string, number][]): Catalog {
  const entries = products.map(([name, categoryId, common]) => ({ name, key: normalize(name), categoryId, common: common === 1 }))
  return { entries, byKey: new Map(entries.map((e) => [e.key, e])) }
}

const CATALOGS: Record<Lang, Catalog> = {
  de: buildCatalog(data.products as [string, string, number][]),
  en: buildCatalog(data.products_en as [string, string, number][]),
}

export const catalogFor = (lang: Lang): Catalog => CATALOGS[lang]

/** Der deutsche Katalog. */
export const CATALOG: CatalogEntry[] = CATALOGS.de.entries

export const findInCatalog = (name: string, lang: Lang = 'de'): CatalogEntry | undefined => CATALOGS[lang].byKey.get(normalize(name))

/** Ein Produkt, das der Nutzer selbst eingetragen hat und das in keinem mitgelieferten Katalog steht. */
export const isOwnProduct = (name: string): boolean => {
  const key = normalize(name)
  return !CATALOGS.de.byKey.has(key) && !CATALOGS.en.byKey.has(key)
}

/**
 * Rät die Kategorie für einen unbekannten Namen über das längste bekannte Wortende.
 * Beispiel: "Bio-Vollmilch" endet auf "milch", also Kühlregal. "Organic whole milk" endet auf "milk".
 * Gesucht wird nur im Katalog der gewählten Sprache, sonst entstünden Zufallstreffer
 * zwischen den Sprachen (z. B. "Tomate" endet auf das englische "mate").
 */
export function guessCategory(name: string, lang: Lang = 'de'): string {
  const key = normalize(name)
  const catalog = CATALOGS[lang]
  const exact = catalog.byKey.get(key)
  if (exact) return exact.categoryId
  let best: CatalogEntry | undefined
  for (const entry of catalog.entries) {
    if (entry.key.length < 4) continue
    if (key.endsWith(entry.key) && (!best || entry.key.length > best.key.length)) best = entry
  }
  return best?.categoryId ?? FALLBACK_CATEGORY
}

/**
 * Ergänzt fehlende Kategorien (neu angelegt oder nach einem App-Update) und entfernt
 * gelöschte. Neue kommen ans Ende, aber vor "Sonstiges", wenn das bisher am Ende stand.
 */
export function completeCategoryOrder(order: string[], available: string[]): string[] {
  const valid = new Set(available)
  const known = order.filter((id, i) => valid.has(id) && order.indexOf(id) === i)
  const missing = available.filter((id) => !known.includes(id))
  if (missing.length === 0) return known
  if (known[known.length - 1] === FALLBACK_CATEGORY) return [...known.slice(0, -1), ...missing, FALLBACK_CATEGORY]
  return [...known, ...missing]
}

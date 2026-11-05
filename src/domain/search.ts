import { catalogFor } from './catalog'
import { compareText, type Lang } from './lang'
import type { Product } from './model'
import { normalize } from './normalize'

export interface Suggestion {
  name: string
  key: string
  categoryId: string
  uses: number
  common: boolean
  /** Herkunft: aus dem Verlauf des Nutzers oder aus dem Katalog. */
  source: 'history' | 'catalog'
}

/**
 * Vorschläge zur Eingabe. Rangfolge:
 * 1. Name beginnt mit der Eingabe, 2. ein Wort im Namen beginnt damit, 3. Name enthält sie.
 * Innerhalb einer Stufe zuerst selbst häufig gekaufte, dann Alltagsprodukte, dann kürzere Namen.
 * Der Katalog ist der der gewählten Sprache, Gelerntes gilt in jeder Sprache.
 */
export function suggest(query: string, products: Product[], limit = 6, lang: Lang = 'de'): Suggestion[] {
  const q = normalize(query)
  if (!q) return []
  const pool = new Map<string, Suggestion>()
  for (const p of products) {
    if (p.fields.deleted) continue
    pool.set(p.id, { name: p.fields.name, key: p.id, categoryId: p.fields.categoryId, uses: p.fields.uses, common: false, source: 'history' })
  }
  for (const c of catalogFor(lang).entries) {
    if (!pool.has(c.key)) pool.set(c.key, { name: c.name, key: c.key, categoryId: c.categoryId, uses: 0, common: c.common, source: 'catalog' })
  }

  const scored: { s: Suggestion; rank: number }[] = []
  for (const s of pool.values()) {
    const rank = matchRank(s.key, q)
    if (rank > 0) scored.push({ s, rank })
  }
  const cmp = compareText(lang)
  scored.sort((a, b) => b.rank - a.rank || b.s.uses - a.s.uses || Number(b.s.common) - Number(a.s.common) || a.s.name.length - b.s.name.length || cmp(a.s.name, b.s.name))
  return scored.slice(0, limit).map((x) => x.s)
}

function matchRank(key: string, q: string): number {
  if (key === q) return 4
  if (key.startsWith(q)) return 3
  if (key.split(/[\s\-/()]+/).some((w) => w.startsWith(q))) return 2
  if (q.length >= 3 && key.includes(q)) return 1
  return 0
}

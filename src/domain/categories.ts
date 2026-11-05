import { builtinCategories, FALLBACK_CATEGORY, isBuiltinName } from './catalog'
import type { Lang } from './lang'
import type { Category, CategoryDoc } from './model'
import { normalize } from './normalize'

/**
 * Die Kategorien, die gerade gelten: die mitgelieferten mit den Änderungen des Nutzers
 * und dahinter seine eigenen. Einträge einer gelöschten Kategorie erscheinen unter
 * "Sonstiges". Ihre Zuordnung bleibt gespeichert, damit "Rückgängig" alles zurückholt.
 * Mitgelieferte Kategorien, die der Nutzer nicht umbenannt hat, heißen wie in der gewählten Sprache.
 */
export class CategorySet {
  /** Alle geltenden Kategorien, mitgelieferte zuerst. */
  readonly list: Category[]
  /** Reihenfolge für neue Listen und für "Zurücksetzen". */
  readonly defaultOrder: string[]
  private readonly map: Map<string, Category>

  constructor(docs: Iterable<CategoryDoc>, lang: Lang = 'de') {
    const builtins = builtinCategories(lang)
    const changes = new Map<string, CategoryDoc>()
    for (const doc of docs) changes.set(doc.id, doc)
    const list: Category[] = []
    for (const builtin of builtins) {
      const doc = changes.get(builtin.id)
      if (doc?.fields.deleted && builtin.id !== FALLBACK_CATEGORY) continue
      // Hat der Nutzer nur das Icon geändert, steht im Datensatz noch der mitgelieferte Name.
      const name = doc && !isBuiltinName(builtin.id, doc.fields.name) ? doc.fields.name : builtin.name
      list.push(doc ? { id: builtin.id, name, emoji: doc.fields.emoji } : builtin)
    }
    const builtinIds = new Set(builtins.map((c) => c.id))
    const own = [...changes.values()]
      .filter((d) => !builtinIds.has(d.id) && !d.fields.deleted)
      .sort((a, b) => a.fields.createdAt - b.fields.createdAt || a.id.localeCompare(b.id))
    for (const doc of own) list.push({ id: doc.id, name: doc.fields.name, emoji: doc.fields.emoji })
    this.list = list
    this.map = new Map(list.map((c) => [c.id, c]))
    this.defaultOrder = list.map((c) => c.id)
  }

  has(id: string): boolean {
    return this.map.has(id)
  }

  /** Die Kategorie zur ID. Gibt es sie nicht (mehr), "Sonstiges". */
  byId(id: string): Category {
    return this.map.get(id) ?? this.map.get(FALLBACK_CATEGORY)!
  }

  /** Die geltende ID: die angegebene, wenn es sie gibt, sonst "Sonstiges". */
  resolve(id: string): string {
    return this.map.has(id) ? id : FALLBACK_CATEGORY
  }

  /** Sucht eine Kategorie mit diesem Namen, Groß- und Kleinschreibung egal. */
  findByName(name: string, exceptId?: string): Category | undefined {
    const key = normalize(name)
    return this.list.find((c) => c.id !== exceptId && normalize(c.name) === key)
  }
}

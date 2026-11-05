import type { Doc } from './doc'

/**
 * Die Datenarten der App. Alle sind Datensätze mit Zeitstempel je Feld (siehe doc.ts),
 * damit eine spätere Synchronisation sie ohne Umbau abgleichen kann.
 */

/** Ein Eintrag auf einer Einkaufsliste. */
export type ItemFields = {
  listId: string
  name: string
  /** Freier Text, z. B. "2", "500 g", "1 Packung". Leer heißt: keine Menge angegeben. */
  quantity: string
  note: string
  categoryId: string
  checked: boolean
  /** Zeitpunkt des Abhakens in ms, um Erledigtes in Kaufreihenfolge zu zeigen. */
  checkedAt: number
  addedAt: number
  /**
   * Platz in der Reihenfolge, die der Nutzer per Ziehen oder "Alphabetisch sortieren" festlegt.
   * Kleiner steht weiter oben. Fehlt bei älteren Einträgen, dann gilt addedAt.
   */
  position?: number
  deleted: boolean
}
export type Item = Doc<ItemFields>

/** Platz eines Eintrags in der Reihenfolge. Neue Einträge stehen unten. */
export const itemPosition = (item: Item): number => item.fields.position ?? item.fields.addedAt

/**
 * Was die App über ein Produkt gelernt hat: welche Kategorie, wie oft gekauft.
 * Die ID ist der vereinfachte Name (siehe normalize.ts), damit "Milch" und "milch"
 * dasselbe Produkt sind, auch auf verschiedenen Geräten.
 */
export type ProductFields = {
  name: string
  categoryId: string
  uses: number
  lastUsed: number
  lastQuantity: string
  deleted: boolean
}
export type Product = Doc<ProductFields>

/** Eine Einkaufsliste. Es kann mehrere geben, jede hat ihre eigenen Einträge. */
export type ListFields = {
  name: string
  /** Anlegezeitpunkt in ms, bestimmt die Reihenfolge der Listen. Fehlt bei der ersten Liste älterer Stände. */
  createdAt?: number
  /** Reihenfolge der Kategorien, so wie man durch den Laden geht. */
  categoryOrder: string[]
  deleted: boolean
}
export type List = Doc<ListFields>

export const DEFAULT_LIST_ID = 'haupt'

export interface Category {
  id: string
  name: string
  emoji: string
}

/**
 * Eine Kategorie, die der Nutzer angelegt, umbenannt oder gelöscht hat.
 * Für eine mitgelieferte Kategorie trägt der Datensatz deren ID und überschreibt Name und Icon.
 * Eine eigene Kategorie hat eine neue ID.
 */
export type CategoryFields = {
  name: string
  emoji: string
  /** Anlegezeitpunkt in ms. Eigene Kategorien stehen in dieser Reihenfolge hinter den mitgelieferten. */
  createdAt: number
  deleted: boolean
}
export type CategoryDoc = Doc<CategoryFields>

/** Alle Sammlungen, die gespeichert und später synchronisiert werden. */
export type Collections = {
  items: Item
  products: Product
  lists: List
  categories: CategoryDoc
}
export type CollectionName = keyof Collections
export const COLLECTIONS: CollectionName[] = ['items', 'products', 'lists', 'categories']

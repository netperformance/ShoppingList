import { completeCategoryOrder, DEFAULT_CATEGORY_ORDER, FALLBACK_CATEGORY, findInCatalog, guessCategory } from '../domain/catalog'
import { CategorySet } from '../domain/categories'
import { createDoc, mergeDocs, patchDoc, type Doc, type Fields } from '../domain/doc'
import {
  COLLECTIONS,
  DEFAULT_LIST_ID,
  type CategoryDoc,
  type CollectionName,
  type Collections,
  type Item,
  type ItemFields,
  itemPosition,
  type List,
  type Product,
} from '../domain/model'
import { compareText, type Lang } from '../domain/lang'
import { normalize } from '../domain/normalize'
import { parseInput } from '../domain/parse'
import { Clock, compareStamps, type Stamp } from '../domain/stamp'
import type { Repository } from '../data/repository'

/** Ein Paket geänderter Datensätze. Dieselbe Form nutzen Sicherung und spätere Synchronisation. */
export type ChangeSet = { [K in CollectionName]: Collections[K][] }

export const emptyChangeSet = (): ChangeSet => ({ items: [], products: [], lists: [], categories: [] })

/** Kurzinfo zu einer Liste für die Listenauswahl. */
export interface ListSummary {
  id: string
  name: string
  openCount: number
}

/** Was die Oberfläche anzeigt. Wird bei jeder Änderung neu erzeugt (unveränderlich). */
export interface Snapshot {
  list: List
  /** Alle vorhandenen Listen, in der Reihenfolge, in der sie angelegt wurden. */
  lists: ListSummary[]
  /** Reihenfolge der Kategorien dieser Liste, vollständig. */
  categoryOrder: string[]
  /** Die geltenden Kategorien, mitgelieferte und eigene. */
  categories: CategorySet
  open: Item[]
  checked: Item[]
  products: Product[]
  /** Vereinfachte Namen aller offenen Einträge, um Doppelte zu erkennen. */
  openKeys: Set<string>
  /** Name der angezeigten Liste, die erste Liste ohne eigenen Namen in der gewählten Sprache. */
  listName: string
  lang: Lang
}

export type AddResult = { status: 'added' | 'exists' | 'restored'; item: Item }

/** Name der ersten Liste, solange der Nutzer sie nicht umbenennt. */
export const DEFAULT_LIST_NAMES: Record<Lang, string> = { de: 'Einkaufsliste', en: 'Shopping list' }

/** Fehler beim Einspielen einer Sicherung. Die Oberfläche zeigt die Meldung in der gewählten Sprache. */
export class BackupError extends Error {
  constructor(readonly code: 'not-a-backup' | 'damaged') {
    super(code === 'not-a-backup' ? 'Die Datei ist keine Sicherung dieser App.' : 'Die Sicherung ist beschädigt.')
    this.name = 'BackupError'
  }
}

export interface Backup extends ChangeSet {
  app: 'einkaufsliste'
  format: 1
  exportedAt: string
}

type Listener = () => void
type ChangeListener = (changes: ChangeSet) => void

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

/**
 * Zentrale Datenhaltung der App.
 *
 * Jede Aktion der Oberfläche läuft über diese Klasse. Sie vergibt Zeitstempel, speichert
 * und meldet die geänderten Datensätze an `onLocalChange`. Dort setzt eine spätere
 * Synchronisation an. Fremde Änderungen kommen über `applyRemote` herein und werden mit
 * denselben Regeln zusammengeführt wie eine eingespielte Sicherung.
 */
export class ListStore {
  private docs: { [K in CollectionName]: Map<string, Collections[K]> } = {
    items: new Map(),
    products: new Map(),
    lists: new Map(),
    categories: new Map(),
  }
  private cats = new CategorySet([])
  private listeners = new Set<Listener>()
  private changeListeners = new Set<ChangeListener>()
  private snapshot!: Snapshot
  private writes: Promise<void> = Promise.resolve()

  private constructor(
    private readonly repo: Repository,
    private clock: Clock,
    private activeId: string,
    private readonly clockNow: () => number = Date.now,
    private lang: Lang = 'de',
  ) {}

  /** Die gerade angezeigte Liste. */
  get listId(): string {
    return this.activeId
  }

  static async open(repo: Repository, options: { now?: () => number; lang?: Lang } = {}): Promise<ListStore> {
    let deviceId = await repo.getMeta<string>('deviceId')
    if (!deviceId) {
      deviceId = newId().replaceAll('-', '').slice(0, 12)
      await repo.setMeta('deviceId', deviceId)
    }
    const last = await repo.getMeta<Stamp>('clock')
    const active = (await repo.getMeta<string>('activeList')) ?? DEFAULT_LIST_ID
    const store = new ListStore(repo, new Clock(deviceId, last, options.now), active, options.now, options.lang)
    const data = await repo.loadAll()
    for (const name of COLLECTIONS) for (const doc of data[name]) store.map(name).set(doc.id, doc)
    store.ensureList()
    store.rebuild()
    return store
  }

  // ---------- Lesen ----------

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = (): Snapshot => this.snapshot

  get deviceId(): string {
    return this.clock.deviceId
  }

  getItem(id: string): Item | undefined {
    return this.docs.items.get(id)
  }

  /** Die gewählte Sprache. Sie bestimmt Katalog, Namen der mitgelieferten Kategorien und Sortierung. */
  get language(): Lang {
    return this.lang
  }

  /** Wechselt die Sprache. Gespeicherte Einträge bleiben, wie sie sind, nur die Anzeige ändert sich. */
  setLanguage(lang: Lang): void {
    if (lang === this.lang) return
    this.lang = lang
    this.rebuild()
    this.emit()
  }

  // ---------- Aktionen ----------

  /** Fügt einen Eintrag hinzu. Steht er schon auf der Liste, wird er nicht doppelt angelegt. */
  add(input: string | { name: string; quantity?: string; categoryId?: string }): AddResult | null {
    const parsed = typeof input === 'string' ? parseInput(input) : { quantity: '', ...input }
    const name = parsed.name.trim()
    if (!name) return null
    const key = normalize(name)
    const stamp = this.clock.tick()
    const now = this.now()

    const product = this.docs.products.get(key)
    const categoryId = this.cats.resolve(
      (typeof input !== 'string' && input.categoryId) ||
        (product && !product.fields.deleted ? product.fields.categoryId : guessCategory(name, this.lang)),
    )
    const displayName = product && !product.fields.deleted ? product.fields.name : findInCatalog(name, this.lang)?.name ?? name

    const existing = this.listItems().find((i) => normalize(i.fields.name) === key)
    let item: Item
    let status: AddResult['status']
    if (existing && !existing.fields.checked) {
      item = parsed.quantity ? patchDoc(existing, { quantity: parsed.quantity }, stamp) : existing
      status = 'exists'
    } else if (existing) {
      item = patchDoc(
        existing,
        { checked: false, checkedAt: 0, addedAt: now, position: now, quantity: parsed.quantity || existing.fields.quantity, categoryId },
        stamp,
      )
      status = 'restored'
    } else {
      const fields: ItemFields = {
        listId: this.listId,
        name: displayName,
        quantity: parsed.quantity,
        note: '',
        categoryId,
        checked: false,
        checkedAt: 0,
        addedAt: now,
        position: now,
        deleted: false,
      }
      item = createDoc(newId(), fields, stamp)
      status = 'added'
    }

    const changes = emptyChangeSet()
    if (item !== existing) changes.items.push(item)
    if (status !== 'exists') changes.products.push(this.learn(displayName, categoryId, parsed.quantity, stamp, now))
    this.commit(changes)
    return { status, item }
  }

  toggle(id: string): void {
    const item = this.docs.items.get(id)
    if (!item) return
    const checked = !item.fields.checked
    this.updateItem(id, { checked, checkedAt: checked ? this.now() : 0 })
  }

  /**
   * Ändert einen Eintrag. Eine geänderte Kategorie merkt sich die App für das Produkt
   * und übernimmt sie für alle anderen Einträge desselben Produkts, auf allen Listen.
   */
  updateItem(id: string, patch: Partial<Omit<ItemFields, 'listId' | 'deleted'>>): void {
    const item = this.docs.items.get(id)
    if (!item) return
    const stamp = this.clock.tick()
    const clean = { ...patch }
    if (clean.name !== undefined) clean.name = clean.name.trim() || item.fields.name
    if (clean.categoryId !== undefined) {
      // Einträge einer gelöschten Kategorie zeigt die App unter "Sonstiges". Wählt der Nutzer
      // dort nichts anderes, bleibt die alte Zuordnung, damit "Rückgängig" sie zurückholen kann.
      clean.categoryId =
        clean.categoryId === this.cats.resolve(item.fields.categoryId) ? item.fields.categoryId : this.cats.resolve(clean.categoryId)
    }
    patch = clean
    const next = patchDoc(item, clean, stamp)
    if (next === item) return
    const changes = emptyChangeSet()
    changes.items.push(next)
    if (patch.categoryId && patch.categoryId !== item.fields.categoryId) {
      const key = normalize(next.fields.name)
      const product = this.docs.products.get(key)
      changes.products.push(
        product
          ? patchDoc(product, { categoryId: patch.categoryId, deleted: false }, stamp)
          : this.learn(next.fields.name, patch.categoryId, next.fields.quantity, stamp, this.now(), 0),
      )
      for (const other of this.docs.items.values()) {
        if (other.id === id || other.fields.deleted || normalize(other.fields.name) !== key) continue
        const moved = patchDoc(other, { categoryId: patch.categoryId }, stamp)
        if (moved !== other) changes.items.push(moved)
      }
    }
    this.commit(changes)
  }

  /**
   * Legt die Reihenfolge der angegebenen offenen Einträge fest (nach Ziehen am Griff).
   * Die Einträge tauschen nur ihre bisherigen Plätze untereinander. So bleibt die
   * Reihenfolge gegenüber allen anderen Einträgen erhalten, ob mit oder ohne Kategorien.
   */
  reorder(ids: string[]): void {
    const items = ids.map((id) => this.docs.items.get(id)).filter((i): i is Item => !!i && !i.fields.deleted)
    const slots = items.map(itemPosition).sort((a, b) => a - b)
    for (let i = 1; i < slots.length; i++) if (slots[i] <= slots[i - 1]) slots[i] = slots[i - 1] + 1
    const stamp = this.clock.tick()
    const changes = emptyChangeSet()
    items.forEach((item, i) => {
      const next = patchDoc(item, { position: slots[i] }, stamp)
      if (next !== item) changes.items.push(next)
    })
    this.commit(changes)
  }

  /**
   * Sortiert die offenen Einträge alphabetisch: mit Kategorien innerhalb jeder Kategorie
   * (deren Reihenfolge bleibt), ohne Kategorien die ganze Liste.
   * Gibt die bisherigen Plätze zurück, damit "Rückgängig" sie wiederherstellen kann.
   */
  sortAlphabetically(grouped: boolean): Map<string, number> {
    const open = this.snapshot.open
    const before = new Map(open.map((i) => [i.id, itemPosition(i)]))
    const groups = new Map<string, Item[]>()
    for (const item of open) {
      const key = grouped ? this.cats.resolve(item.fields.categoryId) : 'alle'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    const stamp = this.clock.tick()
    const changes = emptyChangeSet()
    for (const items of groups.values()) {
      const slots = items.map(itemPosition).sort((a, b) => a - b)
      for (let i = 1; i < slots.length; i++) if (slots[i] <= slots[i - 1]) slots[i] = slots[i - 1] + 1
      const cmp = compareText(this.lang)
      const sorted = [...items].sort((a, b) => cmp(a.fields.name, b.fields.name))
      sorted.forEach((item, i) => {
        const next = patchDoc(item, { position: slots[i] }, stamp)
        if (next !== item) changes.items.push(next)
      })
    }
    this.commit(changes)
    return before
  }

  /** Stellt Plätze wieder her, z. B. nach "Rückgängig". */
  restorePositions(positions: Map<string, number>): void {
    const stamp = this.clock.tick()
    const changes = emptyChangeSet()
    for (const [id, position] of positions) {
      const item = this.docs.items.get(id)
      if (!item) continue
      const next = patchDoc(item, { position }, stamp)
      if (next !== item) changes.items.push(next)
    }
    this.commit(changes)
  }

  remove(ids: string[]): void {
    this.setDeleted(ids, true)
  }

  restore(ids: string[]): void {
    this.setDeleted(ids, false)
  }

  /** Entfernt alle abgehakten Einträge und gibt ihre IDs zurück (für "Rückgängig"). */
  clearChecked(): string[] {
    const ids = this.snapshot.checked.map((i) => i.id)
    this.remove(ids)
    return ids
  }

  /** Setzt alle abgehakten Einträge wieder auf offen, z. B. für den Wocheneinkauf. */
  uncheck(ids: string[]): void {
    const stamp = this.clock.tick()
    const changes = emptyChangeSet()
    for (const id of ids) {
      const item = this.docs.items.get(id)
      if (item) changes.items.push(patchDoc(item, { checked: false, checkedAt: 0 }, stamp))
    }
    this.commit(changes)
  }

  // ---------- Mehrere Listen ----------

  /** Wechselt die angezeigte Liste. Die Auswahl gilt nur für dieses Gerät. */
  switchList(id: string): void {
    const list = this.docs.lists.get(id)
    if (!list || list.fields.deleted || id === this.activeId) return
    this.setActive(id)
    this.rebuild()
    this.emit()
  }

  /** Legt eine neue Liste an und wechselt zu ihr. Die Ladenreihenfolge wird von der aktuellen Liste übernommen. */
  createList(name: string): string | null {
    const clean = name.trim()
    if (!clean) return null
    const current = this.docs.lists.get(this.activeId)
    const list = createDoc(
      newId(),
      {
        name: clean,
        createdAt: this.now(),
        categoryOrder: current ? current.fields.categoryOrder : this.cats.defaultOrder,
        deleted: false,
      },
      this.clock.tick(),
    )
    this.setActive(list.id)
    this.commit({ ...emptyChangeSet(), lists: [list] })
    return list.id
  }

  renameList(id: string, name: string): void {
    const list = this.docs.lists.get(id)
    const clean = name.trim()
    if (!list || !clean) return
    const next = patchDoc(list, { name: clean }, this.clock.tick())
    if (next !== list) this.commit({ ...emptyChangeSet(), lists: [next] })
  }

  /**
   * Löscht eine Liste samt Einträgen (nur als Markierung, daher mit "Rückgängig" umkehrbar).
   * Die letzte Liste bleibt immer stehen. Gibt die IDs der mitgelöschten Einträge zurück.
   */
  deleteList(id: string): string[] | null {
    const list = this.docs.lists.get(id)
    const remaining = this.activeLists().filter((l) => l.id !== id)
    if (!list || list.fields.deleted || remaining.length === 0) return null
    const stamp = this.clock.tick()
    const items = [...this.docs.items.values()].filter((i) => i.fields.listId === id && !i.fields.deleted)
    if (id === this.activeId) this.setActive(remaining[0].id)
    this.commit({
      ...emptyChangeSet(),
      lists: [patchDoc(list, { deleted: true }, stamp)],
      items: items.map((i) => patchDoc(i, { deleted: true }, stamp)),
    })
    return items.map((i) => i.id)
  }

  /** Holt eine gelöschte Liste mit ihren Einträgen zurück und zeigt sie an. */
  restoreList(id: string, itemIds: string[]): void {
    const list = this.docs.lists.get(id)
    if (!list) return
    const stamp = this.clock.tick()
    const items = itemIds.map((i) => this.docs.items.get(i)).filter((i): i is Item => !!i)
    this.setActive(id)
    this.commit({
      ...emptyChangeSet(),
      lists: [patchDoc(list, { deleted: false }, stamp)],
      items: items.map((i) => patchDoc(i, { deleted: false }, stamp)),
    })
  }

  setCategoryOrder(order: string[]): void {
    const list = this.docs.lists.get(this.listId)!
    const next = patchDoc(list, { categoryOrder: completeCategoryOrder(order, this.cats.defaultOrder) }, this.clock.tick())
    if (next !== list) this.commit({ ...emptyChangeSet(), lists: [next] })
  }

  /**
   * Entfernt gelernte Produkte aus den Vorschlägen. Ohne Angabe: alle.
   * Gibt den Stand vor dem Löschen zurück, damit "Rückgängig" ihn wiederherstellen kann.
   */
  forgetProducts(keys?: string[]): Product[] {
    const stamp = this.clock.tick()
    const targets = keys ?? [...this.docs.products.keys()]
    const before = targets
      .map((k) => this.docs.products.get(k))
      .filter((p): p is Product => !!p && !p.fields.deleted)
    this.commit({ ...emptyChangeSet(), products: before.map((p) => patchDoc(p, { deleted: true, uses: 0 }, stamp)) })
    return before
  }

  /** Holt gelöschte Vorschläge mit Kategorie und Häufigkeit zurück (für "Rückgängig"). */
  restoreProducts(before: Product[]): void {
    const stamp = this.clock.tick()
    const products = before
      .map((p) => {
        const current = this.docs.products.get(p.id)
        return current && patchDoc(current, { deleted: false, uses: p.fields.uses, categoryId: p.fields.categoryId }, stamp)
      })
      .filter((p): p is Product => !!p)
    this.commit({ ...emptyChangeSet(), products })
  }

  // ---------- Kategorien ----------

  /** Legt eine eigene Kategorie an. Sie erscheint in allen Listen am Ende, vor "Sonstiges". */
  createCategory(name: string, emoji: string): string | null {
    const clean = name.trim()
    if (!clean || !emoji || this.cats.findByName(clean)) return null
    const doc = createDoc<CategoryDoc['fields']>(newId(), { name: clean, emoji, createdAt: this.now(), deleted: false }, this.clock.tick())
    this.commit({ ...emptyChangeSet(), categories: [doc] })
    return doc.id
  }

  /** Benennt eine Kategorie um oder gibt ihr ein anderes Icon. Gilt auch für die mitgelieferten. */
  updateCategory(id: string, patch: { name?: string; emoji?: string }): boolean {
    if (!this.cats.has(id)) return false
    const current = this.cats.byId(id)
    const name = patch.name?.trim() || current.name
    if (this.cats.findByName(name, id)) return false
    const fields = { name, emoji: patch.emoji || current.emoji }
    const doc = this.docs.categories.get(id)
    if (!doc && fields.name === current.name && fields.emoji === current.emoji) return true
    const stamp = this.clock.tick()
    const next = doc ? patchDoc(doc, fields, stamp) : createDoc<CategoryDoc['fields']>(id, { ...fields, createdAt: 0, deleted: false }, stamp)
    if (next !== doc) this.commit({ ...emptyChangeSet(), categories: [next] })
    return true
  }

  /**
   * Löscht eine Kategorie (nur als Markierung, daher mit "Rückgängig" umkehrbar).
   * Ihre Einträge und gelernten Produkte erscheinen dann unter "Sonstiges".
   * "Sonstiges" selbst lässt sich nicht löschen.
   */
  deleteCategory(id: string): boolean {
    if (id === FALLBACK_CATEGORY || !this.cats.has(id)) return false
    const current = this.cats.byId(id)
    const stamp = this.clock.tick()
    const doc = this.docs.categories.get(id)
    const next = doc
      ? patchDoc(doc, { deleted: true }, stamp)
      : createDoc<CategoryDoc['fields']>(id, { name: current.name, emoji: current.emoji, createdAt: 0, deleted: true }, stamp)
    this.commit({ ...emptyChangeSet(), categories: [next] })
    return true
  }

  restoreCategory(id: string): void {
    const doc = this.docs.categories.get(id)
    if (!doc) return
    const next = patchDoc(doc, { deleted: false }, this.clock.tick())
    if (next !== doc) this.commit({ ...emptyChangeSet(), categories: [next] })
  }

  /** Wie viele offene und abgehakte Einträge auf allen Listen in dieser Kategorie stehen. */
  countInCategory(id: string): number {
    let n = 0
    for (const item of this.docs.items.values()) if (!item.fields.deleted && this.cats.resolve(item.fields.categoryId) === id) n++
    return n
  }

  // ---------- Sicherung ----------

  exportBackup(): Backup {
    return { app: 'einkaufsliste', format: 1, exportedAt: new Date().toISOString(), ...this.allDocs() }
  }

  /** Spielt eine Sicherung ein. Vorhandene Daten bleiben erhalten, es wird zusammengeführt. */
  importBackup(data: unknown): number {
    const backup = data as Partial<Backup>
    if (!backup || backup.app !== 'einkaufsliste' || backup.format !== 1) {
      throw new BackupError('not-a-backup')
    }
    const changes = emptyChangeSet()
    for (const name of COLLECTIONS) {
      const docs = (backup[name] ?? []) as Doc<Fields>[]
      if (!Array.isArray(docs) || docs.some((d) => typeof d?.id !== 'string' || !d.fields || !d.stamps)) {
        throw new BackupError('damaged')
      }
      ;(changes[name] as Doc<Fields>[]) = docs
    }
    return this.applyRemote(changes)
  }

  /**
   * Löscht alles auf diesem Gerät und beginnt neu.
   * Die unter `keepMeta` genannten Werte (z. B. die Darstellung) bleiben erhalten.
   */
  async reset(options: { keepMeta?: string[] } = {}): Promise<void> {
    await this.writes
    const kept: [string, unknown][] = []
    for (const key of options.keepMeta ?? []) {
      const value = await this.repo.getMeta(key)
      if (value !== undefined) kept.push([key, value])
    }
    await this.repo.clear()
    for (const [key, value] of kept) await this.repo.setMeta(key, value)
    for (const name of COLLECTIONS) this.map(name).clear()
    await this.repo.setMeta('deviceId', this.clock.deviceId)
    this.activeId = DEFAULT_LIST_ID
    this.ensureList()
    this.rebuild()
    this.emit()
  }

  // ---------- Schnittstelle für eine spätere Synchronisation ----------

  /** Meldet jede lokale Änderung. Eine Synchronisation schickt diese Pakete an andere Geräte. */
  onLocalChange(listener: ChangeListener): () => void {
    this.changeListeners.add(listener)
    return () => this.changeListeners.delete(listener)
  }

  /** Übernimmt Datensätze von außen (anderes Gerät, Sicherung) und führt sie zusammen. */
  applyRemote(changes: ChangeSet): number {
    const merged = emptyChangeSet()
    for (const name of COLLECTIONS) {
      const map = this.map(name) as Map<string, Doc<Fields>>
      for (const incoming of changes[name] as Doc<Fields>[]) {
        this.clock.receive(incoming.updated)
        const current = map.get(incoming.id)
        const next = current ? mergeDocs(current, incoming) : incoming
        if (!current || JSON.stringify(next) !== JSON.stringify(current)) (merged[name] as Doc<Fields>[]).push(next)
      }
    }
    const count = COLLECTIONS.reduce((n, name) => n + merged[name].length, 0)
    if (count > 0) this.commit(merged, { remote: true })
    return count
  }

  /** Alle Datensätze, die sich nach dem angegebenen Zeitstempel geändert haben. */
  changesSince(stamp: Stamp): ChangeSet {
    const out = emptyChangeSet()
    for (const name of COLLECTIONS) {
      for (const doc of this.map(name).values()) {
        if (compareStamps(doc.updated, stamp) > 0) (out[name] as Doc<Fields>[]).push(doc)
      }
    }
    return out
  }

  /** Wartet, bis alle Änderungen gespeichert sind. */
  flush(): Promise<void> {
    return this.writes
  }

  // ---------- Intern ----------

  private map<K extends CollectionName>(name: K): Map<string, Collections[K]> {
    return this.docs[name]
  }

  private now(): number {
    return this.clockNow()
  }

  private allDocs(): ChangeSet {
    return {
      items: [...this.docs.items.values()],
      products: [...this.docs.products.values()],
      lists: [...this.docs.lists.values()],
      categories: [...this.docs.categories.values()],
    }
  }

  private activeLists(): List[] {
    return [...this.docs.lists.values()]
      .filter((l) => !l.fields.deleted)
      .sort((a, b) => (a.fields.createdAt ?? 0) - (b.fields.createdAt ?? 0) || compareText(this.lang)(a.fields.name, b.fields.name))
  }

  private setActive(id: string): void {
    this.activeId = id
    this.repo.setMeta('activeList', id).catch((error) => console.error('Speichern fehlgeschlagen', error))
  }

  private listItems(): Item[] {
    return [...this.docs.items.values()].filter((i) => i.fields.listId === this.listId && !i.fields.deleted)
  }

  private learn(name: string, categoryId: string, quantity: string, stamp: Stamp, now: number, increment = 1): Product {
    const key = normalize(name)
    const product = this.docs.products.get(key)
    if (!product) return createDoc(key, { name, categoryId, uses: increment, lastUsed: now, lastQuantity: quantity, deleted: false }, stamp)
    return patchDoc(
      product,
      {
        categoryId,
        uses: (product.fields.deleted ? 0 : product.fields.uses) + increment,
        lastUsed: now,
        lastQuantity: quantity || product.fields.lastQuantity,
        deleted: false,
      },
      stamp,
    )
  }

  private setDeleted(ids: string[], deleted: boolean): void {
    if (ids.length === 0) return
    const stamp = this.clock.tick()
    const changes = emptyChangeSet()
    for (const id of ids) {
      const item = this.docs.items.get(id)
      if (item) changes.items.push(patchDoc(item, { deleted }, stamp))
    }
    this.commit(changes)
  }

  /** Sorgt dafür, dass die angezeigte Liste existiert. Fehlt sie, wird auf eine andere gewechselt oder die erste angelegt. */
  private ensureList(): void {
    const active = this.docs.lists.get(this.activeId)
    if (active && !active.fields.deleted) return
    const other = this.activeLists()[0]
    if (other) {
      this.setActive(other.id)
      return
    }
    const existing = this.docs.lists.get(DEFAULT_LIST_ID)
    const list = existing
      ? patchDoc(existing, { deleted: false }, this.clock.tick())
      : createDoc(DEFAULT_LIST_ID, { name: DEFAULT_LIST_NAMES[this.lang], categoryOrder: DEFAULT_CATEGORY_ORDER, deleted: false }, this.clock.tick())
    this.setActive(list.id)
    this.docs.lists.set(list.id, list)
    this.persist({ ...emptyChangeSet(), lists: [list] })
  }

  private commit(changes: ChangeSet, options: { remote?: boolean } = {}): void {
    let count = 0
    for (const name of COLLECTIONS) {
      const map = this.map(name) as Map<string, Doc<Fields>>
      for (const doc of changes[name] as Doc<Fields>[]) {
        map.set(doc.id, doc)
        count++
      }
    }
    if (count === 0) return
    this.persist(changes)
    this.rebuild()
    this.emit()
    if (!options.remote) for (const l of this.changeListeners) l(changes)
  }

  private persist(changes: ChangeSet): void {
    const clock = this.clock.last()
    this.writes = this.writes
      .then(async () => {
        for (const name of COLLECTIONS) await this.repo.put(name, changes[name] as never)
        await this.repo.setMeta('clock', clock)
      })
      .catch((error) => {
        console.error('Speichern fehlgeschlagen', error)
      })
  }

  private rebuild(): void {
    // Eine Synchronisation oder Sicherung kann die angezeigte Liste gelöscht haben.
    this.ensureList()
    const cats = new CategorySet(this.docs.categories.values(), this.lang)
    this.cats = cats
    const list = this.docs.lists.get(this.listId)!
    const order = completeCategoryOrder(list.fields.categoryOrder, cats.defaultOrder)
    const rank = new Map(order.map((id, i) => [id, i]))
    const items = this.listItems()
    const cmp = compareText(this.lang)
    const open = items
      .filter((i) => !i.fields.checked)
      .sort(
        (a, b) =>
          (rank.get(cats.resolve(a.fields.categoryId)) ?? 999) - (rank.get(cats.resolve(b.fields.categoryId)) ?? 999) ||
          itemPosition(a) - itemPosition(b) ||
          cmp(a.fields.name, b.fields.name),
      )
    const checked = items.filter((i) => i.fields.checked).sort((a, b) => b.fields.checkedAt - a.fields.checkedAt)
    const openCount = new Map<string, number>()
    for (const i of this.docs.items.values()) {
      if (!i.fields.deleted && !i.fields.checked) openCount.set(i.fields.listId, (openCount.get(i.fields.listId) ?? 0) + 1)
    }
    this.snapshot = {
      list,
      lists: this.activeLists().map((l) => ({ id: l.id, name: this.displayName(l), openCount: openCount.get(l.id) ?? 0 })),
      categoryOrder: order,
      categories: cats,
      open,
      checked,
      products: [...this.docs.products.values()],
      openKeys: new Set(open.map((i) => normalize(i.fields.name))),
      listName: this.displayName(list),
      lang: this.lang,
    }
  }

  /** Die erste Liste heißt in der gewählten Sprache, solange der Nutzer ihr keinen eigenen Namen gibt. */
  private displayName(list: List): string {
    const name = list.fields.name
    const untouched = list.id === DEFAULT_LIST_ID && Object.values(DEFAULT_LIST_NAMES).includes(name)
    return untouched ? DEFAULT_LIST_NAMES[this.lang] : name
  }

  private emit(): void {
    for (const l of this.listeners) l()
  }
}

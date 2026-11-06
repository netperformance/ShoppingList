import { describe, expect, it } from 'vitest'
import { ListStore } from './store'
import { MemoryRepository } from '../data/memory'
import { SqliteRepository } from '../data/sqlite'
import { nodeSqlite } from '../data/sqlite.node-test'
import { loadPrefs, PREF_KEYS, savePref } from '../ui/prefs'

describe('ListStore', () => {
  it('legt an, ordnet zu und lernt', async () => {
    const store = await ListStore.open(new MemoryRepository())
    expect(store.add('2 milch')?.status).toBe('added')
    const s = store.getSnapshot()
    expect(s.open[0].fields).toMatchObject({ name: 'Milch', quantity: '2', categoryId: 'kuehl' })
    expect(s.products.find((p) => p.id === 'milch')?.fields.uses).toBe(1)
  })

  it('legt nichts doppelt an und holt Abgehaktes zurück', async () => {
    const store = await ListStore.open(new MemoryRepository())
    const first = store.add('Brot')!
    expect(store.add('brot')?.status).toBe('exists')
    store.toggle(first.item.id)
    expect(store.getSnapshot().checked).toHaveLength(1)
    expect(store.add('Brot')?.status).toBe('restored')
    expect(store.getSnapshot().open).toHaveLength(1)
    expect(store.getSnapshot().checked).toHaveLength(0)
  })

  it('sortiert nach Ladenreihenfolge', async () => {
    const store = await ListStore.open(new MemoryRepository())
    store.add('Spülmittel')
    store.add('Äpfel')
    store.add('Milch')
    expect(store.getSnapshot().open.map((i) => i.fields.name)).toEqual(['Äpfel', 'Milch', 'Spülmittel'])
    store.setCategoryOrder(['haushalt'])
    expect(store.getSnapshot().open[0].fields.name).toBe('Spülmittel')
  })

  it('merkt sich geänderte Kategorie', async () => {
    const store = await ListStore.open(new MemoryRepository())
    const r = store.add('Hafermilch')!
    store.updateItem(r.item.id, { categoryId: 'vorrat' })
    store.remove([r.item.id])
    store.add('Hafermilch')
    expect(store.getSnapshot().open[0].fields.categoryId).toBe('vorrat')
  })

  it('merkt sich die Kategorie auch für Abgehaktes und andere Listen', async () => {
    const store = await ListStore.open(new MemoryRepository())
    const home = store.listId
    const boot = store.add('Boot')!
    store.updateItem(boot.item.id, { categoryId: 'haushalt' })
    store.toggle(boot.item.id)
    store.createList('Urlaub')
    const second = store.add('Boot')!
    expect(second.item.fields.categoryId).toBe('haushalt')
    store.updateItem(second.item.id, { categoryId: 'sonstiges' })
    store.switchList(home)
    expect(store.getItem(boot.item.id)?.fields.categoryId).toBe('sonstiges')
    expect(store.add('Boot')?.status).toBe('restored')
    expect(store.getSnapshot().open[0].fields.categoryId).toBe('sonstiges')
  })

  it('löscht einzelne gelernte Vorschläge und holt sie zurück', async () => {
    const store = await ListStore.open(new MemoryRepository())
    const r = store.add('Boot')!
    store.updateItem(r.item.id, { categoryId: 'haushalt' })
    store.add('Milch')
    const active = () => store.getSnapshot().products.filter((p) => !p.fields.deleted).map((p) => p.id).sort()
    const before = store.forgetProducts(['boot'])
    expect(active()).toEqual(['milch'])
    expect(store.getSnapshot().open).toHaveLength(2)
    store.restoreProducts(before)
    expect(active()).toEqual(['boot', 'milch'])
    expect(store.getSnapshot().products.find((p) => p.id === 'boot')?.fields).toMatchObject({ categoryId: 'haushalt', uses: 1 })
  })

  it('legt Kategorien an, benennt um und löscht mit Rückgängig', async () => {
    const repo = new MemoryRepository()
    const store = await ListStore.open(repo)
    const id = store.createCategory('Baumarkt', '🔨')!
    expect(store.createCategory('baumarkt', '🔧')).toBeNull()
    let s = store.getSnapshot()
    expect(s.categoryOrder.slice(-2)).toEqual([id, 'sonstiges'])
    const schrauben = store.add({ name: 'Schrauben', categoryId: id })!
    expect(store.getSnapshot().open[0].fields.categoryId).toBe(id)

    // Eine mitgelieferte Kategorie umbenennen
    expect(store.updateCategory('kuehl', { name: 'Kühlregal', emoji: '🥛' })).toBe(true)
    expect(store.updateCategory('kuehl', { name: 'Baumarkt' })).toBe(false)
    expect(store.getSnapshot().categories.byId('kuehl')).toMatchObject({ name: 'Kühlregal', emoji: '🥛' })

    // Löschen: Einträge erscheinen unter Sonstiges, Rückgängig holt die Zuordnung zurück
    expect(store.countInCategory(id)).toBe(1)
    expect(store.deleteCategory('sonstiges')).toBe(false)
    store.deleteCategory(id)
    s = store.getSnapshot()
    expect(s.categories.has(id)).toBe(false)
    expect(s.categories.resolve(s.open[0].fields.categoryId)).toBe('sonstiges')
    expect(store.add('Dübel')!.item.fields.categoryId).not.toBe(id)
    store.restoreCategory(id)
    expect(store.getSnapshot().categories.byId(schrauben.item.fields.categoryId).name).toBe('Baumarkt')

    // Übersteht einen Neustart
    await store.flush()
    const again = await ListStore.open(repo)
    expect(again.getSnapshot().categories.byId(id).name).toBe('Baumarkt')
    expect(again.getSnapshot().categories.byId('kuehl').name).toBe('Kühlregal')
  })

  it('eine gelöschte Kategorie wird beim Neueintragen nicht mehr vergeben', async () => {
    const store = await ListStore.open(new MemoryRepository())
    store.deleteCategory('kuehl')
    expect(store.add('Milch')!.item.fields.categoryId).toBe('sonstiges')
  })

  it('merkt sich die Einstellungen über einen Neustart und "Alle Daten löschen" hinweg', async () => {
    const file = `/tmp/einkauf-prefs-${Date.now()}.db`
    const repo = new SqliteRepository(nodeSqlite(file))
    const store = await ListStore.open(repo)
    expect((await loadPrefs(repo)).theme).toBe('light')
    await savePref(repo, 'theme', 'dark')
    await savePref(repo, 'grouped', false)
    await savePref(repo, 'fontStep', 3)
    expect(await loadPrefs(new SqliteRepository(nodeSqlite(file)))).toEqual({ theme: 'dark', grouped: false, language: 'de', fontStep: 3 })
    // Ohne gespeicherte Sprache gilt die des Handys, eine gewählte Sprache gewinnt
    expect((await loadPrefs(repo, 'en')).language).toBe('en')
    await savePref(repo, 'language', 'en')
    expect((await loadPrefs(repo, 'de')).language).toBe('en')
    store.add('Kaffee')
    await store.reset({ keepMeta: PREF_KEYS })
    expect(store.getSnapshot().open).toHaveLength(0)
    expect(await loadPrefs(new SqliteRepository(nodeSqlite(file)))).toEqual({ theme: 'dark', grouped: false, language: 'en', fontStep: 3 })
  })

  it('arbeitet auf Englisch mit englischem Katalog und englischen Kategorien', async () => {
    const store = await ListStore.open(new MemoryRepository(), { lang: 'en' })
    const s0 = store.getSnapshot()
    expect(s0.listName).toBe('Shopping list')
    expect(s0.categories.byId('kuehl').name).toBe('Dairy & Eggs')
    expect(store.add('2 milk')!.item.fields).toMatchObject({ name: 'Milk', quantity: '2', categoryId: 'kuehl' })
    expect(store.add('Organic whole milk')!.item.fields.categoryId).toBe('kuehl')
    expect(store.add('3 cans Tomatoes')!.item.fields.quantity).toBe('3 cans')
  })

  it('zeigt Mitgeliefertes in der gewählten Sprache, Eigenes bleibt, wie es ist', async () => {
    const store = await ListStore.open(new MemoryRepository())
    expect(store.getSnapshot().listName).toBe('Einkaufsliste')
    store.updateCategory('kuehl', { emoji: '🥛' })
    store.updateCategory('vorrat', { name: 'Speisekammer' })
    store.add('Milch')
    store.setLanguage('en')
    const s = store.getSnapshot()
    expect(s.listName).toBe('Shopping list')
    expect(s.categories.byId('kuehl')).toMatchObject({ name: 'Dairy & Eggs', emoji: '🥛' })
    expect(s.categories.byId('vorrat').name).toBe('Speisekammer')
    expect(s.categories.byId('sonstiges').name).toBe('Other')
    // Einträge werden nicht übersetzt
    expect(s.open[0].fields.name).toBe('Milch')
    store.renameList(s.list.id, 'Wocheneinkauf')
    store.setLanguage('de')
    expect(store.getSnapshot().listName).toBe('Wocheneinkauf')
  })

  it('sortiert innerhalb der Kategorien alphabetisch und lässt sich von Hand umstellen', async () => {
    let now = 1000
    const store = await ListStore.open(new MemoryRepository(), { now: () => now })
    for (const name of ['Zwiebeln', 'Milch', 'Äpfel', 'Butter', 'Bananen']) {
      now += 10
      store.add(name)
    }
    const names = () => store.getSnapshot().open.map((i) => i.fields.name)
    // Neue Einträge stehen in ihrer Kategorie unten, die Kategorien in Ladenreihenfolge
    expect(names()).toEqual(['Zwiebeln', 'Äpfel', 'Bananen', 'Milch', 'Butter'])
    const before = store.sortAlphabetically(true)
    expect(names()).toEqual(['Äpfel', 'Bananen', 'Zwiebeln', 'Butter', 'Milch'])
    // Von Hand: Zwiebeln nach oben
    const ids = store.getSnapshot().open.slice(0, 3).map((i) => i.id)
    store.reorder([ids[2], ids[0], ids[1]])
    expect(names()).toEqual(['Zwiebeln', 'Äpfel', 'Bananen', 'Butter', 'Milch'])
    store.restorePositions(before)
    expect(names()).toEqual(['Zwiebeln', 'Äpfel', 'Bananen', 'Milch', 'Butter'])
    // Ohne Kategorien: die ganze Liste alphabetisch
    store.sortAlphabetically(false)
    const flat = [...store.getSnapshot().open].sort((a, b) => (a.fields.position ?? 0) - (b.fields.position ?? 0))
    expect(flat.map((i) => i.fields.name)).toEqual(['Äpfel', 'Bananen', 'Butter', 'Milch', 'Zwiebeln'])
  })

  it('Erledigte leeren und rückgängig machen', async () => {
    const store = await ListStore.open(new MemoryRepository())
    const a = store.add('A')!
    store.add('B')
    store.toggle(a.item.id)
    const ids = store.clearChecked()
    expect(store.getSnapshot().checked).toHaveLength(0)
    store.restore(ids)
    expect(store.getSnapshot().checked).toHaveLength(1)
  })

  it('übersteht Neustart (SQLite)', async () => {
    const file = `/tmp/einkauf-test-${Date.now()}.db`
    const s1 = await ListStore.open(new SqliteRepository(nodeSqlite(file)))
    s1.add('Kaffee')
    await s1.flush()
    const s2 = await ListStore.open(new SqliteRepository(nodeSqlite(file)))
    expect(s2.getSnapshot().open.map((i) => i.fields.name)).toContain('Kaffee')
    expect(s2.deviceId).toBe(s1.deviceId)
  })

  it('zwei Geräte gleichen sich über die Sync-Schnittstelle ab', async () => {
    const a = await ListStore.open(new MemoryRepository())
    const b = await ListStore.open(new MemoryRepository())
    a.onLocalChange((c) => b.applyRemote(c))
    b.onLocalChange((c) => a.applyRemote(c))
    // b braucht zuerst die Liste von a, sonst hat jedes Gerät seine eigene Liste "haupt"
    b.applyRemote(a.changesSince(''))
    const milch = a.add('Milch')!
    b.updateItem(milch.item.id, { quantity: '3' })
    a.updateItem(milch.item.id, { note: 'Bio' })
    b.toggle(milch.item.id)
    for (const s of [a, b]) {
      const item = s.getItem(milch.item.id)!
      expect(item.fields).toMatchObject({ quantity: '3', note: 'Bio', checked: true })
    }
  })

  it('Sicherung exportieren und einspielen', async () => {
    const a = await ListStore.open(new MemoryRepository())
    a.add('Tee')
    const backup = JSON.parse(JSON.stringify(a.exportBackup()))
    const b = await ListStore.open(new MemoryRepository())
    b.add('Saft')
    b.importBackup(backup)
    expect(b.getSnapshot().open.map((i) => i.fields.name).sort()).toEqual(['Saft', 'Tee'])
    expect(() => b.importBackup({ foo: 1 })).toThrow()
  })

  it('verwaltet mehrere Listen', async () => {
    const repo = new MemoryRepository()
    const store = await ListStore.open(repo)
    store.add('Milch')
    const home = store.listId
    const id = store.createList('Baumarkt')!
    expect(store.listId).toBe(id)
    expect(store.getSnapshot().open).toHaveLength(0)
    store.add('Schrauben')
    expect(store.getSnapshot().lists.map((l) => [l.name, l.openCount])).toEqual([
      ['Einkaufsliste', 1],
      ['Baumarkt', 1],
    ])
    store.renameList(id, 'Bauhaus')
    expect(store.getSnapshot().list.fields.name).toBe('Bauhaus')

    // Auswahl bleibt nach Neustart erhalten
    await store.flush()
    const again = await ListStore.open(repo)
    expect(again.listId).toBe(id)
    expect(again.getSnapshot().open.map((i) => i.fields.name)).toEqual(['Schrauben'])

    // Löschen wechselt zur verbleibenden Liste, Rückgängig holt alles zurück
    const removed = again.deleteList(id)!
    expect(again.listId).toBe(home)
    expect(again.getSnapshot().lists).toHaveLength(1)
    expect(again.deleteList(home)).toBeNull()
    again.restoreList(id, removed)
    expect(again.listId).toBe(id)
    expect(again.getSnapshot().open.map((i) => i.fields.name)).toEqual(['Schrauben'])
  })
})

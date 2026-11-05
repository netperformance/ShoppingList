import { describe, expect, it } from 'vitest'
import { Clock, compareStamps, formatStamp } from './stamp'
import { createDoc, mergeDocs, patchDoc } from './doc'
import { parseInput, stepQuantity } from './parse'
import { suggest } from './search'
import { completeCategoryOrder, guessCategory, isOwnProduct } from './catalog'
import { searchIcons } from './emoji'
import { languageFromLocale } from './lang'

describe('Uhr', () => {
  it('zählt nie rückwärts, auch wenn die Systemuhr zurückspringt', () => {
    let t = 1000
    const c = new Clock('a', undefined, () => t)
    const s1 = c.tick()
    t = 500
    const s2 = c.tick()
    expect(compareStamps(s2, s1)).toBe(1)
  })
  it('übernimmt fremde spätere Zeit', () => {
    const c = new Clock('a', undefined, () => 1000)
    c.receive(formatStamp(5000, 3, 'b'))
    expect(compareStamps(c.tick(), formatStamp(5000, 3, 'b'))).toBe(1)
  })
})

describe('Zusammenführen', () => {
  const base = createDoc('x', { name: 'Milch', quantity: '', note: '', deleted: false as boolean }, formatStamp(1, 0, 'a'))
  it('behält Änderungen an verschiedenen Feldern von beiden Geräten', () => {
    const a = patchDoc(base, { quantity: '2' }, formatStamp(10, 0, 'a'))
    const b = patchDoc(base, { note: 'Bio' }, formatStamp(11, 0, 'b'))
    const m1 = mergeDocs(a, b)
    const m2 = mergeDocs(b, a)
    expect(m1.fields).toEqual({ name: 'Milch', quantity: '2', note: 'Bio', deleted: false })
    expect(m2).toEqual(m1)
  })
  it('spätere Änderung am selben Feld gewinnt', () => {
    const a = patchDoc(base, { quantity: '2' }, formatStamp(10, 0, 'a'))
    const b = patchDoc(base, { quantity: '3' }, formatStamp(12, 0, 'b'))
    expect(mergeDocs(a, b).fields.quantity).toBe('3')
    expect(mergeDocs(b, a).fields.quantity).toBe('3')
  })
  it('Löschung bleibt bestehen, wenn das andere Gerät früher geändert hat', () => {
    const a = patchDoc(base, { deleted: true }, formatStamp(20, 0, 'a'))
    const b = patchDoc(base, { quantity: '5' }, formatStamp(15, 0, 'b'))
    expect(mergeDocs(a, b).fields.deleted).toBe(true)
  })
  it('patch ohne echte Änderung lässt den Datensatz unverändert', () => {
    expect(patchDoc(base, { name: 'Milch' }, formatStamp(99, 0, 'a'))).toBe(base)
  })
})

describe('Eingabe zerlegen', () => {
  it.each([
    ['2 Milch', 'Milch', '2'],
    ['milch', 'Milch', ''],
    ['500g Hackfleisch', 'Hackfleisch', '500 g'],
    ['500 gr hackfleisch', 'Hackfleisch', '500 g'],
    ['3x Joghurt', 'Joghurt', '3'],
    ['Joghurt x3', 'Joghurt', '3'],
    ['Eier 10', 'Eier', '10'],
    ['2 Dosen Tomaten', 'Tomaten', '2 Dosen'],
    ['1,5 l Milch', 'Milch', '1,5 l'],
    ['7up', '7up', ''],
  ])('%s', (input, name, quantity) => {
    expect(parseInput(input)).toEqual({ name, quantity })
  })
  it('Menge erhöhen und senken', () => {
    expect(stepQuantity('', 1)).toBe('2')
    expect(stepQuantity('2', 1)).toBe('3')
    expect(stepQuantity('2', -1)).toBe('')
    expect(stepQuantity('3 Dosen', -1)).toBe('2 Dosen')
    expect(stepQuantity('1 Dosen', -1)).toBe('1 Dosen')
  })
})

describe('Vorschläge', () => {
  it('schlägt bei "mi" zuerst Milch vor', () => {
    expect(suggest('mi', [])[0].name).toBe('Milch')
  })
  it('schlägt Alltagsprodukte vor seltenen vor', () => {
    expect(suggest('ka', [])[0].name).toBe('Käse')
  })
  it('findet ohne Umlaute', () => {
    expect(suggest('kase', []).map((s) => s.name)).toContain('Käse')
  })
  it('bevorzugt häufig Gekauftes', () => {
    const p = createDoc('mineralwasser', { name: 'Mineralwasser', categoryId: 'getraenke', uses: 9, lastUsed: Date.now(), lastQuantity: '', deleted: false }, formatStamp(1, 0, 'a'))
    expect(suggest('mi', [p])[0].name).toBe('Mineralwasser')
  })
  it('rät die Kategorie über das Wortende', () => {
    expect(guessCategory('Bio-Vollmilch')).toBe('kuehl')
    expect(guessCategory('Xyz')).toBe('sonstiges')
  })
})

describe('Kategorien', () => {
  it('ergänzt neue vor Sonstiges und entfernt gelöschte', () => {
    expect(completeCategoryOrder(['a', 'b', 'sonstiges'], ['a', 'b', 'sonstiges', 'neu'])).toEqual(['a', 'b', 'neu', 'sonstiges'])
    expect(completeCategoryOrder(['sonstiges', 'a', 'x'], ['a', 'sonstiges', 'neu'])).toEqual(['sonstiges', 'a', 'neu'])
  })
  it('zählt nur Unbekanntes zu den eigenen Produkten', () => {
    expect(isOwnProduct('Eier')).toBe(false)
    expect(isOwnProduct('eier ')).toBe(false)
    expect(isOwnProduct('Boot')).toBe(true)
  })
  it('findet Icons über deutsche Suchwörter', () => {
    expect(searchIcons('werkz').map((o) => o.emoji)).toContain('🔨')
    expect(searchIcons('hund').map((o) => o.emoji)).toContain('🐶')
    expect(searchIcons('').length).toBeGreaterThan(150)
  })
  it('findet Icons auch über englische Suchwörter, beschriftet in der gewählten Sprache', () => {
    expect(searchIcons('tools', 'en').map((o) => o.emoji)).toContain('🔨')
    expect(searchIcons('dog', 'en').find((o) => o.emoji === '🐶')?.label).toBe('dog')
    expect(searchIcons('hund', 'de').find((o) => o.emoji === '🐶')?.label).toBe('hund')
  })
})

describe('Sprache', () => {
  it('wählt Deutsch für jede deutsche Einstellung, sonst Englisch', () => {
    for (const l of ['de', 'de_DE', 'de-AT', 'de_CH', 'DE-de']) expect(languageFromLocale(l)).toBe('de')
    for (const l of ['en_US', 'fr_FR', 'nl', 'dee', '', undefined]) expect(languageFromLocale(l)).toBe('en')
  })
  it('schlägt auf Englisch aus dem englischen Katalog vor', () => {
    expect(suggest('mi', [], 6, 'en')[0].name).toBe('Milk')
    expect(suggest('toil', [], 6, 'en').map((s) => s.name)).toContain('Toilet paper')
    expect(guessCategory('Oat milk', 'en')).toBe('kuehl')
    expect(guessCategory('Xyz', 'en')).toBe('sonstiges')
  })
  it('kennt englische Mengenangaben', () => {
    expect(parseInput('2 cans Tomatoes')).toEqual({ name: 'Tomatoes', quantity: '2 cans' })
    expect(parseInput('Eggs 12')).toEqual({ name: 'Eggs', quantity: '12' })
    expect(parseInput('3 pcs Lemons')).toEqual({ name: 'Lemons', quantity: '3' })
    expect(parseInput('2 lbs Ground beef')).toEqual({ name: 'Ground beef', quantity: '2 lbs' })
  })
  it('zählt Produkte aus beiden Katalogen nicht zu den eigenen', () => {
    expect(isOwnProduct('Milk')).toBe(false)
    expect(isOwnProduct('Milch')).toBe(false)
  })
})

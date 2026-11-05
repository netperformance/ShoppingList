import { capitalize } from './normalize'

/**
 * Zerlegt eine Eingabe in Produkt und Menge.
 * "2 Milch" → Milch, 2 · "500g Hackfleisch" → Hackfleisch, 500 g · "Eier 10" → Eier, 10
 * "3x Joghurt" → Joghurt, 3 · "Brot" → Brot, ohne Menge
 * Englisch genauso: "2 cans Tomatoes" → Tomatoes, 2 cans · "Eggs 12" → Eggs, 12
 */
const UNIT_DE =
  'stk\\.?|stück|g|gr|kg|ml|l|liter|pck\\.?|packung(?:en)?|pkg\\.?|dose(?:n)?|flasche(?:n)?|glas|gläser|bund|becher|beutel|netz|kiste(?:n)?|tüte(?:n)?'
const UNIT_EN = 'pcs\\.?|pc\\.?|pieces?|packs?|packets?|cans?|bottles?|jars?|bags?|box(?:es)?|bunch(?:es)?|cartons?|tubs?|lbs?\\.?|oz\\.?'
const UNIT = `(?:x|×|${UNIT_DE}|${UNIT_EN})`
/** Englische Einheiten stehen klein in der Menge ("2 cans"), deutsche wie Hauptwörter groß ("2 Dosen"). */
const ENGLISH_UNIT = new RegExp(`^(?:${UNIT_EN})$`, 'i')
const NUMBER = '\\d+(?:[.,]\\d+)?|½|¼|¾'

const leading = new RegExp(`^(${NUMBER})\\s*(${UNIT})?\\.?\\s+(.+)$`, 'i')
const trailing = new RegExp(`^(.+?)\\s+(${NUMBER})\\s*(${UNIT})?\\.?$`, 'i')
const timesSuffix = new RegExp(`^(.+?)\\s*[x×]\\s*(\\d+)$`, 'i')

export interface ParsedInput {
  name: string
  quantity: string
}

export function parseInput(raw: string): ParsedInput {
  const text = raw.trim().replace(/\s+/g, ' ')
  let m = text.match(leading)
  if (m) return { name: capitalize(m[3]), quantity: formatQuantity(m[1], m[2]) }
  m = text.match(timesSuffix)
  if (m) return { name: capitalize(m[1]), quantity: m[2] }
  m = text.match(trailing)
  if (m) return { name: capitalize(m[1]), quantity: formatQuantity(m[2], m[3]) }
  return { name: capitalize(text), quantity: '' }
}

function formatQuantity(amount: string, unit?: string): string {
  if (!unit || /^(x|×|stk\.?|stück|pcs\.?|pc\.?|pieces?)$/i.test(unit)) return amount
  const u = unit.toLowerCase()
  if (ENGLISH_UNIT.test(u)) return `${amount} ${u}`
  const short: Record<string, string> = { gr: 'g', liter: 'l', 'pck.': 'Pck.', pck: 'Pck.', 'pkg.': 'Pck.', pkg: 'Pck.' }
  const display = short[u] ?? (['g', 'kg', 'ml', 'l'].includes(u) ? u : capitalize(u))
  return `${amount} ${display}`
}

/** Erhöht oder senkt eine Menge, wenn sie mit einer Zahl beginnt. "2 Dosen" → "3 Dosen". */
export function stepQuantity(quantity: string, delta: number): string {
  const m = quantity.match(/^(\d+)(.*)$/)
  if (!m) return delta > 0 ? (quantity ? quantity : '2') : quantity
  const next = Number(m[1]) + delta
  if (next <= 1 && !m[2].trim()) return ''
  return `${Math.max(1, next)}${m[2]}`
}

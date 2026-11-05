import { createContext, useContext } from 'react'
import type { Lang } from '../domain/lang'

/**
 * Alle Texte der Oberfläche auf Deutsch und Englisch. Die Komponenten holen sie mit `useT()`.
 * Texte mit Zahlen oder Namen sind Funktionen, damit Einzahl, Mehrzahl und Satzbau je Sprache stimmen.
 */
const de = {
  // Hauptbildschirm
  nothingOpen: 'Nichts offen',
  allInCart: 'Alles im Wagen',
  openCount: (open: number, inCart: number) => `${open} offen${inCart ? ` · ${inCart} im Wagen` : ''}`,
  switchList: (name: string) => `${name}, Liste wechseln`,
  emptyTitle: 'Die Liste ist leer',
  emptyText: 'Oben eintippen, was du brauchst.',
  appBy: 'Eine App von',
  inCart: 'IM WAGEN',
  clear: 'Leeren',
  sortAlphabetically: 'Alphabetisch sortieren',
  settings: 'Einstellungen',
  qtyChanged: (name: string) => `${name}: Menge geändert`,
  alreadyOnList: (name: string) => `${name} steht schon auf der Liste`,
  backOnList: (name: string) => `${name} wieder auf der Liste`,
  item: 'Eintrag',
  deleted: (name: string) => `${name} gelöscht`,
  undo: 'Rückgängig',
  removed: (n: number) => (n === 1 ? '1 Eintrag entfernt' : `${n} Einträge entfernt`),
  sortedInCategories: 'Innerhalb der Kategorien alphabetisch sortiert',
  sorted: 'Alphabetisch sortiert',

  // Eingabe
  addPlaceholder: 'Was brauchst du?',
  addItem: 'Artikel hinzufügen',
  clearInput: 'Eingabe löschen',
  add: 'Hinzufügen',
  addNamed: (name: string) => `${name} hinzufügen`,
  onList: 'auf der Liste',
  new: 'Neu',
  quoted: (text: string) => `„${text}“`,

  // Eintrag
  delete: 'Löschen',
  itemHint: 'Tippen zum Abhaken, lange drücken zum Bearbeiten',
  editNamed: (name: string) => `${name} bearbeiten`,
  deleteNamed: (name: string) => `${name} löschen`,
  moveNamed: (name: string) => `${name} verschieben`,

  // Blätter
  close: 'Schließen',
  done: 'Fertig',

  // Bearbeiten
  edit: 'Bearbeiten',
  name: 'NAME',
  quantity: 'MENGE',
  less: 'Weniger',
  more: 'Mehr',
  noQuantity: 'ohne',
  note: 'NOTIZ',
  notePlaceholder: 'z. B. Bio, große Packung',
  category: 'KATEGORIE',
  categoryRemembered: 'Die App merkt sich die Kategorie für dieses Produkt.',
  deleteItem: 'Eintrag löschen',

  // Listen
  lists: 'Listen',
  listName: 'Name der Liste',
  renameNamed: (name: string) => `${name} umbenennen`,
  newList: 'Neue Liste',
  create: 'Anlegen',

  // Einstellungen
  appearance: 'DARSTELLUNG',
  themeSystem: 'Automatisch',
  themeLight: 'Hell',
  themeDark: 'Dunkel',
  language: 'SPRACHE',
  list: 'LISTE',
  groupByCategory: 'Nach Kategorien ordnen',
  groupedOn: 'Einträge stehen nach Kategorien in der Reihenfolge deines Ladens.',
  groupedOff:
    'Einträge stehen untereinander, ohne Kategorien. Die Kategorien merkt sich die App trotzdem, beim Einschalten ist alles wieder einsortiert.',
  categories: 'KATEGORIEN',
  newCategory: 'Neue Kategorie',
  categoriesFoot: 'Antippen zum Umbenennen oder Löschen. Am Griff ziehen, so wie du durch deinen Laden gehst.',
  reset: 'Zurücksetzen',
  data: 'DATEN',
  saveBackup: 'Sicherung speichern',
  importBackup: 'Sicherung einspielen',
  learned: 'Gelernte Vorschläge',
  deleteAllData: 'Alle Daten löschen',
  backupFoot:
    'Eine Sicherung ist eine Datei mit deinen Listen, Kategorien und allem Gelernten. Beim Einspielen wird zusammengeführt, nichts geht verloren.',
  appName: 'Shopping List',
  about: 'Kein Konto, keine Cloud.\nDeine Daten bleiben auf diesem Handy.',
  madeBy: 'Gemacht von Aaron Kreis ·',
  openSource: 'Open Source unter MIT Lizenz',
  backToSettings: 'Zurück zu den Einstellungen',
  editCategory: 'Kategorie bearbeiten',
  backupFileName: 'shopping-list-sicherung',
  shareUnavailable: 'Teilen ist auf diesem Gerät nicht möglich.',
  backupFailed: (reason: string) => `Sicherung fehlgeschlagen: ${reason}`,
  backupImported: (n: number) => (n ? `Sicherung eingespielt (${n} ${n === 1 ? 'Änderung' : 'Änderungen'})` : 'Alles war schon auf dem Stand'),
  invalidBackup: 'Die Datei ist keine gültige Sicherung.',
  notABackup: 'Die Datei ist keine Sicherung dieser App.',
  damagedBackup: 'Die Sicherung ist beschädigt.',
  resetTitle: 'Alle Daten löschen?',
  resetText:
    'Alle Listen mit ihren Einträgen, die gelernten Vorschläge und deine Kategorien werden auf diesem Handy gelöscht. Das lässt sich nicht rückgängig machen. Darstellung und Sprache bleiben, wie sie sind.',
  cancel: 'Abbrechen',
  deleteForever: 'Endgültig löschen',
  allDataDeleted: 'Alle Daten gelöscht',

  // Kategorie bearbeiten
  exists: (name: string) => `„${name}“ gibt es schon. Nicht gespeichert.`,
  existsHint: (name: string) => `Eine Kategorie „${name}“ gibt es schon.`,
  categoryCreated: (emoji: string, name: string) => `${emoji} ${name} angelegt`,
  categoryDeleted: (name: string, count: number, fallback: string) =>
    count > 0 ? `${name} gelöscht, ${count === 1 ? '1 Eintrag' : `${count} Einträge`} jetzt unter ${fallback}` : `${name} gelöscht`,
  categoryPlaceholder: 'z. B. Baumarkt',
  icon: 'ICON',
  iconSearch: 'Icon suchen, z. B. Werkzeug, Hund, Wein',
  clearSearch: 'Suche löschen',
  noIcon: 'Kein passendes Icon. Versuch ein anderes Wort.',
  createCategory: 'Kategorie anlegen',
  deleteCategory: 'Kategorie löschen',
  fallbackInfo: 'Hier landet alles, was keiner anderen Kategorie zugeordnet ist. Deshalb lässt sich diese Kategorie umbenennen, aber nicht löschen.',
  afterDelete: (fallback: string) => `Nach dem Löschen stehen die Einträge dieser Kategorie unter ${fallback}.`,

  // Gelernte Vorschläge
  forgetAllTitle: 'Alle gelernten Vorschläge löschen?',
  forgetAllText: (n: number) => `Die App vergisst ${n === 1 ? '1 Produkt und seine Kategorie' : `${n} Produkte und ihre Kategorien`}. Die Einträge auf deinen Listen bleiben.`,
  deleteAll: 'Alle löschen',
  allLearnedDeleted: 'Alle gelernten Vorschläge gelöscht',
  nothingLearned: 'Noch nichts gelernt. Trägst du ein Produkt ein, das die App noch nicht kennt, merkt sie es sich hier mit seiner Kategorie.',
  search: 'Suchen',
  nothingFound: 'Nichts gefunden',
  learnedFoot:
    'Hier stehen nur Produkte, die du selbst eingetragen hast und die die App vorher nicht kannte. Gelöscht wird nur der Vorschlag, nicht der Eintrag auf der Liste. Trägst du das Produkt wieder ein, lernt die App es neu.',
  deleteAllCount: (n: number) => `Alle ${n} löschen`,
}

export type Strings = typeof de

const en: Strings = {
  nothingOpen: 'Nothing to buy',
  allInCart: 'Everything in the cart',
  openCount: (open, inCart) => `${open} to buy${inCart ? ` · ${inCart} in the cart` : ''}`,
  switchList: (name) => `${name}, switch list`,
  emptyTitle: 'The list is empty',
  emptyText: 'Type what you need above.',
  appBy: 'An app by',
  inCart: 'IN THE CART',
  clear: 'Clear',
  sortAlphabetically: 'Sort alphabetically',
  settings: 'Settings',
  qtyChanged: (name) => `${name}: quantity changed`,
  alreadyOnList: (name) => `${name} is already on the list`,
  backOnList: (name) => `${name} is back on the list`,
  item: 'Item',
  deleted: (name) => `${name} deleted`,
  undo: 'Undo',
  removed: (n) => (n === 1 ? '1 item removed' : `${n} items removed`),
  sortedInCategories: 'Sorted alphabetically within categories',
  sorted: 'Sorted alphabetically',

  addPlaceholder: 'What do you need?',
  addItem: 'Add item',
  clearInput: 'Clear input',
  add: 'Add',
  addNamed: (name) => `Add ${name}`,
  onList: 'on the list',
  new: 'New',
  quoted: (text) => `“${text}”`,

  delete: 'Delete',
  itemHint: 'Tap to check off, long press to edit',
  editNamed: (name) => `Edit ${name}`,
  deleteNamed: (name) => `Delete ${name}`,
  moveNamed: (name) => `Move ${name}`,

  close: 'Close',
  done: 'Done',

  edit: 'Edit',
  name: 'NAME',
  quantity: 'QUANTITY',
  less: 'Less',
  more: 'More',
  noQuantity: 'none',
  note: 'NOTE',
  notePlaceholder: 'e.g. organic, large pack',
  category: 'CATEGORY',
  categoryRemembered: 'The app remembers the category for this product.',
  deleteItem: 'Delete item',

  lists: 'Lists',
  listName: 'List name',
  renameNamed: (name) => `Rename ${name}`,
  newList: 'New list',
  create: 'Create',

  appearance: 'APPEARANCE',
  themeSystem: 'Automatic',
  themeLight: 'Light',
  themeDark: 'Dark',
  language: 'LANGUAGE',
  list: 'LIST',
  groupByCategory: 'Group by category',
  groupedOn: 'Items are grouped by category, in the order of your store.',
  groupedOff:
    'Items are shown in one list, without categories. The app still remembers the categories, so everything is sorted again when you switch this back on.',
  categories: 'CATEGORIES',
  newCategory: 'New category',
  categoriesFoot: 'Tap to rename or delete. Drag the handle to match the way you walk through your store.',
  reset: 'Reset',
  data: 'DATA',
  saveBackup: 'Save backup',
  importBackup: 'Restore backup',
  learned: 'Learned suggestions',
  deleteAllData: 'Delete all data',
  backupFoot:
    'A backup is a file with your lists, categories and everything the app has learned. Restoring merges it with what is on the phone, nothing gets lost.',
  appName: 'Shopping List',
  about: 'No account, no cloud.\nYour data stays on this phone.',
  madeBy: 'Made by Aaron Kreis ·',
  openSource: 'Open source under the MIT license',
  backToSettings: 'Back to settings',
  editCategory: 'Edit category',
  backupFileName: 'shopping-list-backup',
  shareUnavailable: 'Sharing is not available on this device.',
  backupFailed: (reason) => `Backup failed: ${reason}`,
  backupImported: (n) => (n ? `Backup restored (${n} ${n === 1 ? 'change' : 'changes'})` : 'Everything was already up to date'),
  invalidBackup: 'This file is not a valid backup.',
  notABackup: 'This file is not a backup of this app.',
  damagedBackup: 'The backup is damaged.',
  resetTitle: 'Delete all data?',
  resetText:
    'All lists with their items, the learned suggestions and your categories will be deleted from this phone. This cannot be undone. Appearance and language stay as they are.',
  cancel: 'Cancel',
  deleteForever: 'Delete permanently',
  allDataDeleted: 'All data deleted',

  exists: (name) => `“${name}” already exists. Not saved.`,
  existsHint: (name) => `A category “${name}” already exists.`,
  categoryCreated: (emoji, name) => `${emoji} ${name} created`,
  categoryDeleted: (name, count, fallback) =>
    count > 0 ? `${name} deleted, ${count === 1 ? '1 item' : `${count} items`} now under ${fallback}` : `${name} deleted`,
  categoryPlaceholder: 'e.g. Hardware store',
  icon: 'ICON',
  iconSearch: 'Search icons, e.g. tools, dog, wine',
  clearSearch: 'Clear search',
  noIcon: 'No matching icon. Try another word.',
  createCategory: 'Create category',
  deleteCategory: 'Delete category',
  fallbackInfo: 'Everything that is not assigned to another category ends up here. That is why this category can be renamed but not deleted.',
  afterDelete: (fallback) => `After deleting, the items in this category appear under ${fallback}.`,

  forgetAllTitle: 'Delete all learned suggestions?',
  forgetAllText: (n) => `The app forgets ${n === 1 ? '1 product and its category' : `${n} products and their categories`}. The items on your lists stay.`,
  deleteAll: 'Delete all',
  allLearnedDeleted: 'All learned suggestions deleted',
  nothingLearned: 'Nothing learned yet. When you add a product the app does not know, it remembers it here with its category.',
  search: 'Search',
  nothingFound: 'Nothing found',
  learnedFoot:
    'Only products you added yourself and that the app did not know before are listed here. Deleting removes only the suggestion, not the item on your list. If you add the product again, the app learns it again.',
  deleteAllCount: (n) => `Delete all ${n}`,
}

export const STRINGS: Record<Lang, Strings> = { de, en }

/** Die Texte der gewählten Sprache. Wird in App.tsx gesetzt. */
export const LanguageContext = createContext<Strings>(de)

export const useT = (): Strings => useContext(LanguageContext)

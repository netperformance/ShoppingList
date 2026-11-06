import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useEffect, useMemo, useState, type RefObject } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { FALLBACK_CATEGORY } from '../domain/catalog'
import { searchIcons } from '../domain/emoji'
import { haptic } from './haptics'
import { useSnackbar } from './Snackbar'
import { useT } from './i18n'
import { useColors, useFont, useScaled } from './theme'
import { useListStore, useSnapshot } from './useStore'

const NEW_ICON = '🛒'

interface Props {
  /** ID der Kategorie, die bearbeitet wird. null: neue Kategorie anlegen. */
  id: string | null
  /** Hier hinterlegt der Editor, wie seine Änderungen übernommen werden (beim Verlassen). */
  commitRef: RefObject<(() => void) | null>
  /** Zurück zur Übersicht. */
  onDone: () => void
}

/**
 * Kategorie anlegen oder bearbeiten: Name, Icon aus einer durchsuchbaren Auswahl, Löschen.
 * Wie beim Bearbeiten eines Eintrags werden Änderungen beim Verlassen übernommen.
 */
export function CategoryEditor({ id, commitRef, onDone }: Props) {
  const c = useColors()
  const f = useFont()
  const styles = useScaled(baseStyles)
  const store = useListStore()
  const snapshot = useSnapshot()
  const snack = useSnackbar()
  const t = useT()
  const current = id ? snapshot.categories.byId(id) : null

  const [name, setName] = useState(current?.name ?? '')
  const [emoji, setEmoji] = useState(current?.emoji ?? NEW_ICON)
  const [query, setQuery] = useState('')

  const icons = useMemo(() => searchIcons(query, snapshot.lang), [query, snapshot.lang])
  const duplicate = name.trim() ? snapshot.categories.findByName(name, id ?? undefined) : undefined

  const commit = () => {
    const clean = name.trim()
    if (duplicate) {
      snack({ message: t.exists(duplicate.name) })
      return
    }
    if (id) {
      store.updateCategory(id, { name: clean || current?.name, emoji })
    } else if (clean) {
      store.createCategory(clean, emoji)
      haptic('success')
      snack({ message: t.categoryCreated(emoji, clean) })
    }
  }

  useEffect(() => {
    commitRef.current = commit
    return () => {
      commitRef.current = null
    }
  })

  const remove = () => {
    if (!id || !current) return
    const count = store.countInCategory(id)
    store.deleteCategory(id)
    haptic('press')
    const fallback = snapshot.categories.byId(FALLBACK_CATEGORY).name
    snack({
      message: t.categoryDeleted(current.name, count, fallback),
      action: { label: t.undo, run: () => store.restoreCategory(id) },
    })
    commitRef.current = null
    onDone()
  }

  const field = [styles.field, { backgroundColor: c.card, color: c.text }]
  const label = [styles.label, { color: c.text2 }]

  return (
    <>
      <Text style={label}>{t.name}</Text>
      <View style={styles.nameRow}>
        <View style={[styles.preview, { backgroundColor: c.card }]}>
          <Text style={styles.previewEmoji}>{emoji}</Text>
        </View>
        <TextInput
          style={[field, { flex: 1 }]}
          value={name}
          onChangeText={setName}
          placeholder={t.categoryPlaceholder}
          placeholderTextColor={c.text3}
          cursorColor={c.accent}
          autoFocus={!id}
          autoCapitalize="sentences"
          autoCorrect={false}
          returnKeyType="done"
        />
      </View>
      {duplicate && <Text style={[styles.foot, { color: c.danger }]}>{t.existsHint(duplicate.name)}</Text>}

      <Text style={label}>{t.icon}</Text>
      <View style={[styles.search, { backgroundColor: c.card }]}>
        <MaterialIcons name="search" size={20} color={c.text3} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          value={query}
          onChangeText={setQuery}
          placeholder={t.iconSearch}
          placeholderTextColor={c.text3}
          cursorColor={c.accent}
          autoCorrect={false}
          returnKeyType="search"
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel={t.clearSearch}>
            <MaterialIcons name="close" size={20} color={c.text3} />
          </Pressable>
        )}
      </View>
      <View style={[styles.grid, { backgroundColor: c.card }]}>
        {icons.map((o) => {
          const active = o.emoji === emoji
          return (
            <Pressable
              key={o.emoji}
              onPress={() => {
                setEmoji(o.emoji)
                haptic('tick')
              }}
              style={[styles.cell, active && { backgroundColor: c.accentSoft, borderColor: c.accent }]}
              accessibilityRole="button"
              accessibilityLabel={o.label}
              accessibilityState={{ selected: active }}
            >
              <Text style={styles.cellEmoji}>{o.emoji}</Text>
            </Pressable>
          )
        })}
        {icons.length === 0 && <Text style={[styles.empty, { color: c.text2 }]}>{t.noIcon}</Text>}
      </View>

      {!id && (
        <Pressable
          style={[styles.button, { backgroundColor: name.trim() && !duplicate ? c.accent : c.card }]}
          android_ripple={{ color: c.ripple }}
          disabled={!name.trim() || !!duplicate}
          onPress={() => {
            commit()
            commitRef.current = null
            onDone()
          }}
          accessibilityRole="button"
        >
          <Text style={{ color: name.trim() && !duplicate ? c.onAccent : c.text3, fontSize: f(16), fontWeight: '600' }}>{t.createCategory}</Text>
        </Pressable>
      )}

      {id && id !== FALLBACK_CATEGORY && (
        <Pressable style={[styles.delete, { backgroundColor: c.card }]} android_ripple={{ color: c.ripple }} onPress={remove} accessibilityRole="button">
          <MaterialIcons name="delete-outline" size={22} color={c.danger} />
          <Text style={{ color: c.danger, fontSize: f(16), fontWeight: '500' }}>{t.deleteCategory}</Text>
        </Pressable>
      )}
      {id === FALLBACK_CATEGORY && (
        <Text style={[styles.foot, { color: c.text2 }]}>
          {t.fallbackInfo}
        </Text>
      )}
      {id && id !== FALLBACK_CATEGORY && (
        <Text style={[styles.foot, { color: c.text2 }]}>
          {t.afterDelete(snapshot.categories.byId(FALLBACK_CATEGORY).name)}
        </Text>
      )}
    </>
  )
}

const baseStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 18, marginBottom: 8, marginLeft: 4 },
  nameRow: { flexDirection: 'row', gap: 8 },
  preview: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewEmoji: { fontSize: 26 },
  field: { height: 50, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 0, fontSize: 17 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 12, paddingHorizontal: 14 },
  searchInput: { flex: 1, height: 48, paddingVertical: 0, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, padding: 6, borderRadius: 16 },
  cell: { width: '12.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
  cellEmoji: { fontSize: 24 },
  empty: { padding: 12, fontSize: 14 },
  button: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24, overflow: 'hidden' },
  delete: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: 12, marginTop: 24, overflow: 'hidden' },
  foot: { fontSize: 13, marginTop: 8, marginLeft: 4, lineHeight: 18 },
})

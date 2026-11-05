import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { isOwnProduct } from '../domain/catalog'
import type { Product } from '../domain/model'
import { compareText } from '../domain/lang'
import { normalize } from '../domain/normalize'
import { haptic } from './haptics'
import { useSnackbar } from './Snackbar'
import { useT } from './i18n'
import { useColors } from './theme'
import { useListStore, useSnapshot } from './useStore'

/**
 * Die Produkte, die der Nutzer selbst eingetragen hat und die nicht im mitgelieferten
 * Katalog stehen, mit ihrer Kategorie. Einzelne lassen sich löschen, jede Löschung ist
 * mit "Rückgängig" umkehrbar.
 */
export function LearnedProducts() {
  const c = useColors()
  const store = useListStore()
  const snapshot = useSnapshot()
  const snack = useSnackbar()
  const t = useT()
  const [filter, setFilter] = useState('')

  const all = useMemo(
    () =>
      snapshot.products
        .filter((p) => !p.fields.deleted && isOwnProduct(p.fields.name))
        .sort((a, b) => compareText(snapshot.lang)(a.fields.name, b.fields.name)),
    [snapshot.products, snapshot.lang],
  )
  const q = normalize(filter)
  const shown = q ? all.filter((p) => p.id.includes(q)) : all

  const forget = (p: Product) => {
    const before = store.forgetProducts([p.id])
    haptic('press')
    snack({ message: t.deleted(p.fields.name), action: { label: t.undo, run: () => store.restoreProducts(before) } })
  }

  const forgetAll = () =>
    Alert.alert(t.forgetAllTitle, t.forgetAllText(all.length), [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.deleteAll,
        style: 'destructive',
        onPress: () => {
          const before = store.forgetProducts(all.map((p) => p.id))
          snack({ message: t.allLearnedDeleted, action: { label: t.undo, run: () => store.restoreProducts(before) } })
        },
      },
    ])

  if (all.length === 0) {
    return (
      <Text style={[styles.foot, { color: c.text2, marginTop: 12 }]}>
        {t.nothingLearned}
      </Text>
    )
  }

  return (
    <>
      {all.length > 8 && (
        <View style={[styles.search, { backgroundColor: c.card }]}>
          <MaterialIcons name="search" size={20} color={c.text3} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            value={filter}
            onChangeText={setFilter}
            placeholder={t.search}
            placeholderTextColor={c.text3}
            cursorColor={c.accent}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      )}

      <View style={[styles.card, { backgroundColor: c.card }]}>
        {shown.map((p, i) => {
          const cat = snapshot.categories.byId(p.fields.categoryId)
          return (
            <View
              key={p.id}
              style={[styles.row, i < shown.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.sep }]}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, color: c.text }} numberOfLines={1}>
                  {p.fields.name}
                </Text>
                <Text style={{ fontSize: 13, color: c.text2 }} numberOfLines={1}>
                  {cat.name}
                </Text>
              </View>
              <Pressable
                onPress={() => forget(p)}
                style={styles.action}
                android_ripple={{ color: c.ripple, borderless: true, radius: 22 }}
                accessibilityRole="button"
                accessibilityLabel={t.deleteNamed(p.fields.name)}
              >
                <MaterialIcons name="delete-outline" size={22} color={c.text3} />
              </Pressable>
            </View>
          )
        })}
        {shown.length === 0 && <Text style={[styles.none, { color: c.text2 }]}>{t.nothingFound}</Text>}
      </View>
      <Text style={[styles.foot, { color: c.text2 }]}>
        {t.learnedFoot}
      </Text>

      <Pressable style={[styles.delete, { backgroundColor: c.card }]} android_ripple={{ color: c.ripple }} onPress={forgetAll} accessibilityRole="button">
        <MaterialIcons name="auto-fix-off" size={22} color={c.danger} />
        <Text style={{ color: c.danger, fontSize: 16, fontWeight: '500' }}>{t.deleteAllCount(all.length)}</Text>
      </Pressable>
    </>
  )
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 12, paddingHorizontal: 14, marginTop: 8, marginBottom: 12 },
  searchInput: { flex: 1, height: 48, fontSize: 16 },
  card: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, paddingLeft: 16, paddingRight: 4 },
  emoji: { fontSize: 20, width: 26, textAlign: 'center' },
  action: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  none: { padding: 16, fontSize: 15 },
  foot: { fontSize: 13, marginTop: 8, marginLeft: 4, lineHeight: 18 },
  delete: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: 12, marginTop: 24, overflow: 'hidden' },
})

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Animated, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { itemPosition, type Item } from '../domain/model'
import { AddBar, ADD_BAR_HEIGHT, type AddRequest } from './AddBar'
import { EditSheet } from './EditSheet'
import { haptic } from './haptics'
import { useT } from './i18n'
import { ItemRow } from './ItemRow'
import { ListsSheet } from './ListsSheet'
import { ReorderableItems } from './ReorderableItems'
import { SettingsSheet } from './SettingsSheet'
import { SITE_URL } from './site'
import { SnackbarHost, useSnackbar } from './Snackbar'
import type { Prefs } from './prefs'
import { useColors } from './theme'
import { useKeyboardTop } from './useKeyboard'
import { useListStore, useSnapshot } from './useStore'

interface Props {
  prefs: Prefs
  onPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void
  keepOnReset: string[]
}

export function MainScreen({ prefs, onPref, keepOnReset }: Props) {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const keyboardTop = useKeyboardTop()
  const store = useListStore()
  const snapshot = useSnapshot()
  const snack = useSnackbar()
  const t = useT()

  const [editId, setEditId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [listsOpen, setListsOpen] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const [screenHeight, setScreenHeight] = useState(0)
  const [titleHeight, setTitleHeight] = useState(76)
  const scrollY = useRef(new Animated.Value(0)).current
  const scrollOffset = useRef(0)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const topBar = insets.top + 56
  // Wie viel die Tastatur vom Bildschirm verdeckt. Verkleinert Android das Fenster selbst, ist es 0.
  const keyboardOverlap = keyboardTop === null ? 0 : Math.max(0, screenHeight - keyboardTop)

  const flash = (id: string) => {
    setFlashId(id)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashId(null), 1500)
  }

  const add = useCallback(
    (req: AddRequest) => {
      const result = store.add(req)
      if (!result) return
      haptic('tick')
      flash(result.item.id)
      if (result.status === 'exists') {
        snack({ message: req.quantity ? t.qtyChanged(result.item.fields.name) : t.alreadyOnList(result.item.fields.name) })
      } else if (result.status === 'restored') {
        snack({ message: t.backOnList(result.item.fields.name) })
      }
    },
    [store, snack, t],
  )

  const remove = useCallback(
    (id: string) => {
      const item = store.getItem(id)
      store.remove([id])
      snack({ message: t.deleted(item?.fields.name ?? t.item), action: { label: t.undo, run: () => store.restore([id]) } })
    },
    [store, snack, t],
  )

  const clearChecked = useCallback(() => {
    const ids = store.clearChecked()
    haptic('press')
    snack({
      message: t.removed(ids.length),
      action: { label: t.undo, run: () => store.restore(ids) },
    })
  }, [store, snack, t])

  const sortAlphabetically = () => {
    const before = store.sortAlphabetically(prefs.grouped)
    haptic('press')
    snack({
      message: prefs.grouped ? t.sortedInCategories : t.sorted,
      action: { label: t.undo, run: () => store.restorePositions(before) },
    })
  }
  const reorder = useCallback((ids: string[]) => store.reorder(ids), [store])

  const toggle = useCallback((id: string) => store.toggle(id), [store])
  const edit = useCallback((id: string) => setEditId(id), [])
  const swipeStart = useCallback(() => setScrollEnabled(false), [])
  const swipeEnd = useCallback(() => setScrollEnabled(true), [])

  const { open, checked } = snapshot
  const total = open.length + checked.length

  const { categories } = snapshot
  // Nach Kategorien geordnet oder alle untereinander. Die Zuordnung bleibt in beiden Fällen gespeichert.
  const groups = useMemo(() => {
    if (!prefs.grouped) return [{ category: null, items: [...open].sort((a, b) => itemPosition(a) - itemPosition(b)) }]
    const by = new Map<string, Item[]>()
    for (const item of open) {
      const id = categories.resolve(item.fields.categoryId)
      if (!by.has(id)) by.set(id, [])
      by.get(id)!.push(item)
    }
    return snapshot.categoryOrder.filter((id) => by.has(id)).map((id) => ({ category: categories.byId(id), items: by.get(id)! }))
  }, [open, snapshot.categoryOrder, categories, prefs.grouped])

  const subtitle =
    total === 0 ? t.nothingOpen : open.length === 0 ? t.allInCart : t.openCount(open.length, checked.length)

  const rowProps = { onToggle: toggle, onEdit: edit, onDelete: remove, onSwipeStart: swipeStart, onSwipeEnd: swipeEnd }
  const editItem = editId ? (store.getItem(editId) ?? null) : null
  const titleOpacity = scrollY.interpolate({ inputRange: [titleHeight * 0.5, titleHeight], outputRange: [0, 1], extrapolate: 'clamp' })
  const listName = snapshot.listName

  return (
    <View style={[styles.fill, { backgroundColor: c.bg }]} onLayout={(e) => setScreenHeight(e.nativeEvent.layout.height)}>
      <Animated.ScrollView
        style={{ marginTop: topBar }}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => {
            scrollOffset.current = e.nativeEvent.contentOffset.y
          },
        })}
        scrollEventThrottle={16}
      >
        <View style={styles.titleBlock} onLayout={(e) => setTitleHeight(e.nativeEvent.layout.height)}>
          <Pressable
            onPress={() => setListsOpen(true)}
            style={styles.titleRow}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t.switchList(listName)}
          >
            <Text style={[styles.title, { color: c.text }]} numberOfLines={1} accessibilityRole="header">
              {listName}
            </Text>
            <MaterialIcons name="expand-more" size={30} color={c.text3} style={styles.chevron} />
          </Pressable>
          <Text style={[styles.subtitle, { color: c.text2 }]}>{subtitle}</Text>
        </View>

        {/* Platz für die Eingabeleiste, die darüber liegt */}
        <View style={{ height: ADD_BAR_HEIGHT + 8 }} />

        {total === 0 && (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: c.accentSoft }]}>
              <MaterialIcons name="shopping-basket" size={40} color={c.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>{t.emptyTitle}</Text>
            <Text style={[styles.emptyText, { color: c.text2 }]}>{t.emptyText}</Text>
            <Text style={[styles.signature, { color: c.text3 }]}>
              {t.appBy}{' '}
              <Text style={{ color: c.accent, fontWeight: '500' }} onPress={() => Linking.openURL(SITE_URL).catch(() => {})} accessibilityRole="link">
                aaron.de
              </Text>
            </Text>
          </View>
        )}

        {groups.map(({ category, items }) => items.length > 0 && (
          <View key={category?.id ?? 'alle'} style={styles.section}>
            {category && (
              <View style={styles.sectionHead}>
                <Text style={styles.sectionEmoji}>{category.emoji}</Text>
                <Text style={[styles.sectionLabel, { color: c.text2 }]}>{category.name.toLocaleUpperCase(snapshot.lang)}</Text>
              </View>
            )}
            <View style={[styles.card, { backgroundColor: c.card }]}>
              <ReorderableItems
                items={items}
                flashId={flashId}
                rowProps={rowProps}
                onReorder={reorder}
                onDragChange={(dragging) => (dragging ? swipeStart() : swipeEnd())}
              />
            </View>
          </View>
        ))}

        {checked.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionLabel, { color: c.text2, flex: 1 }]}>{t.inCart} · {checked.length}</Text>
              <Pressable onPress={clearChecked} hitSlop={10} accessibilityRole="button">
                <Text style={{ color: c.accent, fontWeight: '600', fontSize: 15 }}>{t.clear}</Text>
              </Pressable>
            </View>
            <View style={[styles.card, { backgroundColor: c.card }]}>
              {checked.map((item, i) => (
                <ItemRow key={item.id} item={item} last={i === checked.length - 1} flash={item.id === flashId} {...rowProps} />
              ))}
            </View>
          </View>
        )}
      </Animated.ScrollView>

      <View style={[styles.topBar, { height: topBar, paddingTop: insets.top, backgroundColor: c.bg }]} pointerEvents="box-none">
        <Animated.View style={[styles.topTitleWrap, { opacity: titleOpacity }]}>
          <Pressable onPress={() => setListsOpen(true)} hitSlop={6} accessibilityLabel={t.switchList(listName)}>
            <Text style={[styles.topTitle, { color: c.text }]} numberOfLines={1}>
              {listName}
            </Text>
          </Pressable>
        </Animated.View>
        {open.length > 1 && (
          <Pressable
            onPress={sortAlphabetically}
            style={styles.menu}
            android_ripple={{ color: c.ripple, borderless: true, radius: 22 }}
            accessibilityLabel={t.sortAlphabetically}
            accessibilityRole="button"
          >
            <MaterialIcons name="sort-by-alpha" size={24} color={c.text} />
          </Pressable>
        )}
        <Pressable
          onPress={() => setSettingsOpen(true)}
          style={styles.menu}
          android_ripple={{ color: c.ripple, borderless: true, radius: 22 }}
          accessibilityLabel={t.settings}
          accessibilityRole="button"
        >
          <MaterialIcons name="more-vert" size={24} color={c.text} />
        </Pressable>
      </View>

      <AddBar
        products={snapshot.products}
        lang={snapshot.lang}
        openKeys={snapshot.openKeys}
        top={topBar}
        collapse={titleHeight}
        scrollY={scrollY}
        scrollOffset={() => scrollOffset.current}
        screenHeight={screenHeight}
        keyboardOverlap={keyboardOverlap}
        onAdd={add}
      />

      <SnackbarHost bottom={keyboardOverlap > 0 ? keyboardOverlap + 8 : insets.bottom + 16} />

      <EditSheet
        item={editItem && !editItem.fields.deleted ? editItem : null}
        onSave={(id, draft) => store.updateItem(id, draft)}
        onDelete={remove}
        onClose={() => setEditId(null)}
      />
      <ListsSheet open={listsOpen} onClose={() => setListsOpen(false)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} prefs={prefs} onPref={onPref} keepOnReset={keepOnReset} />
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  topTitleWrap: { flex: 1, marginLeft: 16 },
  topTitle: { fontSize: 20, fontWeight: '600' },
  menu: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { paddingTop: 4, paddingBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', maxWidth: '100%' },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5, flexShrink: 1 },
  chevron: { marginLeft: 2, marginTop: 4 },
  subtitle: { fontSize: 15, marginTop: 2 },
  section: { marginBottom: 22 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginBottom: 8 },
  sectionEmoji: { fontSize: 15 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  card: { borderRadius: 16, overflow: 'hidden' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: 6 },
  emptyText: { fontSize: 15 },
  signature: { fontSize: 14, marginTop: 4 },
})

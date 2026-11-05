import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Constants from 'expo-constants'
import * as DocumentPicker from 'expo-document-picker'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Linking, PanResponder, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { isOwnProduct } from '../domain/catalog'
import type { CategorySet } from '../domain/categories'
import { LANGS, type Lang } from '../domain/lang'
import { BackupError } from '../store/store'
import { CategoryEditor } from './CategoryEditor'
import { haptic } from './haptics'
import { LearnedProducts } from './LearnedProducts'
import type { Prefs } from './prefs'
import { REPO_URL, SITE_URL } from './site'
import { Sheet } from './Sheet'
import { useSnackbar } from './Snackbar'
import { useT } from './i18n'
import { useColors } from './theme'
import { useListStore, useSnapshot } from './useStore'

interface Props {
  open: boolean
  onClose: () => void
  prefs: Prefs
  onPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void
  /** Einstellungen, die "Alle Daten löschen" stehen lässt. */
  keepOnReset: string[]
}

type View_ = { kind: 'main' } | { kind: 'learned' } | { kind: 'category'; id: string | null }

export function SettingsSheet({ open, onClose, prefs, onPref, keepOnReset }: Props) {
  const c = useColors()
  const store = useListStore()
  const snapshot = useSnapshot()
  const snack = useSnackbar()
  const t = useT()
  const [dragging, setDragging] = useState(false)
  const [view, setView] = useState<View_>({ kind: 'main' })
  const commitEditor = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!open) setView({ kind: 'main' })
  }, [open])

  /** Verlässt eine Unterseite. Änderungen an einer Kategorie werden dabei übernommen. */
  const back = () => {
    commitEditor.current?.()
    commitEditor.current = null
    setView({ kind: 'main' })
  }
  const close = () => {
    commitEditor.current?.()
    commitEditor.current = null
    onClose()
  }

  const exportBackup = async () => {
    try {
      const name = `${t.backupFileName}-${new Date().toISOString().slice(0, 10)}.json`
      const file = new File(Paths.cache, name)
      file.create({ overwrite: true })
      await file.write(JSON.stringify(store.exportBackup(), null, 1))
      if (!(await Sharing.isAvailableAsync())) throw new Error(t.shareUnavailable)
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: t.saveBackup })
    } catch (error) {
      snack({ message: t.backupFailed((error as Error).message) })
    }
  }

  const importBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true })
      if (result.canceled || !result.assets[0]) return
      const text = await new File(result.assets[0].uri).text()
      const count = store.importBackup(JSON.parse(text))
      haptic('success')
      snack({ message: t.backupImported(count) })
    } catch (error) {
      const message =
        error instanceof SyntaxError
          ? t.invalidBackup
          : error instanceof BackupError
            ? error.code === 'damaged'
              ? t.damagedBackup
              : t.notABackup
            : (error as Error).message
      snack({ message })
    }
  }

  const confirmReset = () =>
    Alert.alert(
      t.resetTitle,
      t.resetText,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteForever,
          style: 'destructive',
          onPress: async () => {
            await store.reset({ keepMeta: keepOnReset })
            onClose()
            snack({ message: t.allDataDeleted })
          },
        },
      ],
    )

  const learned = snapshot.products.filter((p) => !p.fields.deleted && isOwnProduct(p.fields.name)).length
  const defaultOrder = snapshot.categories.defaultOrder
  const reordered = snapshot.categoryOrder.join() !== defaultOrder.join()

  if (view.kind === 'learned') {
    return (
      <Sheet open={open} title={t.learned} onClose={close} onBack={back}>
        <BackLink onPress={back} />
        <LearnedProducts />
      </Sheet>
    )
  }

  if (view.kind === 'category') {
    return (
      <Sheet open={open} title={view.id ? t.editCategory : t.newCategory} onClose={close} onBack={back}>
        <BackLink onPress={back} />
        <CategoryEditor key={view.id ?? 'neu'} id={view.id} commitRef={commitEditor} onDone={() => setView({ kind: 'main' })} />
      </Sheet>
    )
  }

  return (
    <Sheet open={open} title={t.settings} onClose={close} scrollEnabled={!dragging}>
      <Text style={[styles.label, { color: c.text2 }]}>{t.appearance}</Text>
      <View style={[styles.segmented, { backgroundColor: c.card }]} accessibilityRole="radiogroup">
        {(
          [
            ['system', t.themeSystem],
            ['light', t.themeLight],
            ['dark', t.themeDark],
          ] as const
        ).map(([value, label]) => {
          const active = prefs.theme === value
          return (
            <Pressable
              key={value}
              onPress={() => onPref('theme', value)}
              style={[styles.segment, active && { backgroundColor: c.accent }]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <Text style={{ color: active ? c.onAccent : c.text2, fontWeight: '600', fontSize: 15 }}>{label}</Text>
            </Pressable>
          )
        })}
      </View>

      <Text style={[styles.label, { color: c.text2 }]}>{t.language}</Text>
      <View style={[styles.segmented, { backgroundColor: c.card }]} accessibilityRole="radiogroup">
        {LANGS.map((value) => {
          const active = prefs.language === value
          return (
            <Pressable
              key={value}
              onPress={() => onPref('language', value)}
              style={[styles.segment, active && { backgroundColor: c.accent }]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <Text style={{ color: active ? c.onAccent : c.text2, fontWeight: '600', fontSize: 15 }}>{LANGUAGE_NAMES[value]}</Text>
            </Pressable>
          )
        })}
      </View>

      <Text style={[styles.label, { color: c.text2 }]}>{t.list}</Text>
      <Pressable
        style={[styles.card, styles.row, { backgroundColor: c.card }]}
        onPress={() => onPref('grouped', !prefs.grouped)}
        android_ripple={{ color: c.ripple }}
        accessibilityRole="switch"
        accessibilityState={{ checked: prefs.grouped }}
      >
        <MaterialIcons name="view-agenda" size={22} color={c.accent} />
        <Text style={{ flex: 1, fontSize: 16, color: c.text }}>{t.groupByCategory}</Text>
        <Switch
          value={prefs.grouped}
          onValueChange={(v) => onPref('grouped', v)}
          trackColor={{ false: c.sep, true: c.accentSoft }}
          thumbColor={prefs.grouped ? c.accent : c.text3}
        />
      </Pressable>
      <Text style={[styles.foot, { color: c.text2 }]}>
        {prefs.grouped
          ? t.groupedOn
          : t.groupedOff}
      </Text>

      <Text style={[styles.label, { color: c.text2 }]}>{t.categories}</Text>
      <CategoryOrder
        order={snapshot.categoryOrder}
        categories={snapshot.categories}
        onChange={(o) => store.setCategoryOrder(o)}
        onDragChange={setDragging}
        onEdit={(id) => setView({ kind: 'category', id })}
      />
      <View style={[styles.card, { backgroundColor: c.card, marginTop: 8 }]}>
        <Row icon="add" label={t.newCategory} onPress={() => setView({ kind: 'category', id: null })} last />
      </View>
      <View style={styles.footRow}>
        <Text style={[styles.foot, { color: c.text2, flex: 1 }]}>{t.categoriesFoot}</Text>
        {reordered && (
          <Pressable onPress={() => store.setCategoryOrder(defaultOrder)} hitSlop={8}>
            <Text style={{ color: c.accent, fontWeight: '600', fontSize: 14 }}>{t.reset}</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.label, { color: c.text2 }]}>{t.data}</Text>
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Row icon="ios-share" label={t.saveBackup} onPress={exportBackup} />
        <Row icon="file-download" label={t.importBackup} onPress={importBackup} />
        <Row icon="auto-fix-high" label={t.learned} detail={String(learned)} chevron onPress={() => setView({ kind: 'learned' })} />
        <Row icon="delete-forever" label={t.deleteAllData} danger onPress={confirmReset} last />
      </View>

      <Text style={[styles.about, { color: c.text2 }]}>
        {t.appName} {Constants.expoConfig?.version ?? ''} · {t.about}
      </Text>
      <Text style={[styles.about, styles.signature, { color: c.text2 }]}>
        {t.madeBy}{' '}
        <Text style={{ color: c.accent, fontWeight: '500' }} onPress={() => Linking.openURL(SITE_URL).catch(() => {})} accessibilityRole="link">
          aaron.de
        </Text>
      </Text>
      <Text
        style={[styles.about, styles.openSource, { color: c.accent }]}
        onPress={() => Linking.openURL(REPO_URL).catch(() => {})}
        accessibilityRole="link"
      >
        {t.openSource}
      </Text>
    </Sheet>
  )
}

function BackLink({ onPress }: { onPress: () => void }) {
  const c = useColors()
  const t = useT()
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.back} accessibilityRole="button" accessibilityLabel={t.backToSettings}>
      <MaterialIcons name="chevron-left" size={24} color={c.accent} />
      <Text style={{ color: c.accent, fontSize: 16, fontWeight: '600' }}>{t.settings}</Text>
    </Pressable>
  )
}

function Row({
  icon,
  label,
  detail,
  danger,
  disabled,
  last,
  chevron,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap
  label: string
  detail?: string
  chevron?: boolean
  danger?: boolean
  disabled?: boolean
  last?: boolean
  onPress: () => void
}) {
  const c = useColors()
  const color = danger ? c.danger : c.accent
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: c.ripple }}
      style={[styles.row, { opacity: disabled ? 0.4 : 1 }, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.sep }]}
      accessibilityRole="button"
    >
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={{ flex: 1, fontSize: 16, color: danger ? c.danger : c.text }}>{label}</Text>
      {detail !== undefined && <Text style={{ color: c.text2, fontSize: 15 }}>{detail}</Text>}
      {chevron && <MaterialIcons name="chevron-right" size={22} color={c.text3} style={{ marginRight: -6 }} />}
    </Pressable>
  )
}

/** Jede Sprache steht in ihrer eigenen Sprache, damit man sie auch findet, wenn man die andere nicht liest. */
const LANGUAGE_NAMES: Record<Lang, string> = { de: 'Deutsch', en: 'English' }

const ROW_H = 52

/** Kategorien per Ziehen am Griff umsortieren, antippen zum Bearbeiten. */
function CategoryOrder({
  order,
  categories,
  onChange,
  onDragChange,
  onEdit,
}: {
  order: string[]
  categories: CategorySet
  onChange: (order: string[]) => void
  onDragChange: (dragging: boolean) => void
  onEdit: (id: string) => void
}) {
  const c = useColors()
  const t = useT()
  const [local, setLocal] = useState(order)
  const [dragId, setDragId] = useState<string | null>(null)
  const offset = useRef(new Animated.Value(0)).current
  const state = useRef({ local: order, dragId: null as string | null, startIndex: 0, index: 0 })
  state.current.local = local
  const callbacks = useRef({ onChange, onDragChange })
  callbacks.current = { onChange, onDragChange }

  useEffect(() => {
    if (!state.current.dragId) setLocal(order)
  }, [order])

  const responders = useRef(new Map<string, ReturnType<typeof PanResponder.create>>()).current
  const responderFor = (id: string) => {
    let r = responders.get(id)
    if (r) return r
    r = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const index = state.current.local.indexOf(id)
        state.current = { ...state.current, dragId: id, startIndex: index, index }
        offset.setValue(0)
        setDragId(id)
        callbacks.current.onDragChange(true)
        haptic('press')
      },
      onPanResponderMove: (_e, g) => {
        const s = state.current
        const target = Math.max(0, Math.min(s.local.length - 1, s.startIndex + Math.round(g.dy / ROW_H)))
        if (target !== s.index) {
          const next = s.local.filter((x) => x !== id)
          next.splice(target, 0, id)
          s.index = target
          s.local = next
          setLocal(next)
          haptic('tick')
        }
        offset.setValue(g.dy - (s.index - s.startIndex) * ROW_H)
      },
      onPanResponderRelease: () => finish(),
      onPanResponderTerminate: () => finish(),
    })
    responders.set(id, r)
    return r
  }

  const finish = () => {
    const s = state.current
    s.dragId = null
    offset.setValue(0)
    setDragId(null)
    callbacks.current.onDragChange(false)
    callbacks.current.onChange(s.local)
  }

  return (
    <View style={[styles.card, { backgroundColor: c.card, overflow: 'visible' }]}>
      {local.map((id, i) => {
        const cat = categories.byId(id)
        const lifted = dragId === id
        return (
          <Animated.View
            key={id}
            style={[
              styles.orderRow,
              { backgroundColor: c.card },
              i < local.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.sep },
              lifted && { zIndex: 2, elevation: 8, borderRadius: 12, transform: [{ translateY: offset }, { scale: 1.02 }] },
              i === 0 && { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
              i === local.length - 1 && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
            ]}
          >
            <Pressable
              style={styles.orderLabel}
              onPress={() => onEdit(id)}
              android_ripple={{ color: c.ripple }}
              accessibilityRole="button"
              accessibilityLabel={t.editNamed(cat.name)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={{ flex: 1, fontSize: 16, color: c.text }} numberOfLines={1}>
                {cat.name}
              </Text>
            </Pressable>
            <View {...responderFor(id).panHandlers} style={styles.grip} accessibilityLabel={t.moveNamed(cat.name)}>
              <MaterialIcons name="drag-handle" size={24} color={c.text3} />
            </View>
          </Animated.View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 18, marginBottom: 8, marginLeft: 4 },
  segmented: { flexDirection: 'row', padding: 3, borderRadius: 12, gap: 3 },
  segment: { flex: 1, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 54, paddingHorizontal: 16 },
  orderRow: { flexDirection: 'row', alignItems: 'center', height: ROW_H },
  orderLabel: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, height: ROW_H, paddingLeft: 16 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: -6, marginTop: 2 },
  catEmoji: { fontSize: 18 },
  grip: { width: 56, height: ROW_H, alignItems: 'center', justifyContent: 'center' },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  foot: { fontSize: 13, marginTop: 8, marginLeft: 4, lineHeight: 18 },
  about: { textAlign: 'center', fontSize: 13, marginTop: 28, lineHeight: 19 },
  signature: { marginTop: 14 },
  openSource: { marginTop: 6, fontWeight: '500' },
})

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { memo, useEffect, useRef, useState } from 'react'
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, type GestureResponderHandlers } from 'react-native'
import type { Item } from '../domain/model'
import { haptic } from './haptics'
import { useT } from './i18n'
import { useColors, useScaled } from './theme'

interface Props {
  item: Item
  last: boolean
  flash: boolean
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSwipeStart: () => void
  onSwipeEnd: () => void
  /** Griff zum Verschieben. Nur bei offenen Einträgen. */
  dragHandlers?: GestureResponderHandlers
}

const DELETE_SHARE = 0.35

/**
 * Ein Eintrag. Tippen hakt ab, langes Drücken oder der Stift öffnet Bearbeiten,
 * der Papierkorb oder nach links wischen löscht, am Griff ziehen verschiebt.
 */
export const ItemRow = memo(function ItemRow({ item, last, flash, onToggle, onEdit, onDelete, onSwipeStart, onSwipeEnd, dragHandlers }: Props) {
  const c = useColors()
  const styles = useScaled(baseStyles)
  const t = useT()
  const { name, quantity, note, checked } = item.fields
  const [visualChecked, setVisualChecked] = useState(checked)
  const x = useRef(new Animated.Value(0)).current
  const width = useRef(360)
  const flashAnim = useRef(new Animated.Value(0)).current
  const toggleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const props = useRef({ onDelete, onSwipeStart, onSwipeEnd, id: item.id })
  props.current = { onDelete, onSwipeStart, onSwipeEnd, id: item.id }

  useEffect(() => setVisualChecked(checked), [checked])
  useEffect(() => () => clearTimeout(toggleTimer.current), [])
  useEffect(() => {
    if (!flash) return
    flashAnim.setValue(1)
    Animated.timing(flashAnim, { toValue: 0, duration: 1100, delay: 250, useNativeDriver: false }).start()
  }, [flash, flashAnim])

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: () => props.current.onSwipeStart(),
      onPanResponderMove: (_e, g) => x.setValue(Math.min(0, g.dx)),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_e, g) => {
        props.current.onSwipeEnd()
        if (-g.dx > width.current * DELETE_SHARE || g.vx < -1.2) {
          haptic('press')
          Animated.timing(x, { toValue: -width.current, duration: 160, useNativeDriver: true }).start(() =>
            props.current.onDelete(props.current.id),
          )
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 260 }).start()
        }
      },
      onPanResponderTerminate: () => {
        props.current.onSwipeEnd()
        Animated.spring(x, { toValue: 0, useNativeDriver: true }).start()
      },
    }),
  ).current

  const toggle = () => {
    haptic('tick')
    setVisualChecked(!checked)
    clearTimeout(toggleTimer.current)
    // Kurz warten, damit man das Abhaken sieht, bevor der Eintrag nach unten wandert.
    toggleTimer.current = setTimeout(() => onToggle(item.id), 260)
  }

  const background = flashAnim.interpolate({ inputRange: [0, 1], outputRange: [c.card, c.flash] })

  return (
    <View style={styles.wrap} onLayout={(e) => (width.current = e.nativeEvent.layout.width)}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.delete,
          { backgroundColor: c.danger, opacity: x.interpolate({ inputRange: [-2, 0], outputRange: [1, 0], extrapolate: 'clamp' }) },
        ]}
      >
        <MaterialIcons name="delete-outline" size={22} color="#fff" />
        <Text style={styles.deleteText}>{t.delete}</Text>
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: x }] }} {...pan.panHandlers}>
        <Animated.View style={{ backgroundColor: background }}>
          <Pressable
            onPress={toggle}
            onLongPress={() => {
              haptic('press')
              onEdit(item.id)
            }}
            delayLongPress={380}
            android_ripple={{ color: c.ripple }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: visualChecked }}
            accessibilityLabel={`${name}${quantity ? `, ${quantity}` : ''}`}
            accessibilityHint={t.itemHint}
            style={styles.row}
          >
            <View
              style={[
                styles.check,
                { borderColor: visualChecked ? c.accent : c.text3, backgroundColor: visualChecked ? c.accent : 'transparent' },
              ]}
            >
              {visualChecked && <MaterialIcons name="check" size={16} color={c.onAccent} />}
            </View>
            <View style={styles.main}>
              <Text
                style={[styles.name, { color: visualChecked ? c.text3 : c.text }, visualChecked && styles.strike]}
                numberOfLines={1}
              >
                {name}
              </Text>
              {!!note && (
                <Text style={[styles.note, { color: c.text2 }]} numberOfLines={1}>
                  {note}
                </Text>
              )}
            </View>
            {!!quantity && (
              <View style={[styles.qty, { backgroundColor: visualChecked ? 'transparent' : c.accentSoft }]}>
                <Text style={[styles.qtyText, { color: visualChecked ? c.text3 : c.accent }]}>{quantity}</Text>
              </View>
            )}
            <View style={styles.actions}>
              <Pressable
                onPress={() => onEdit(item.id)}
                style={styles.action}
                android_ripple={{ color: c.ripple, borderless: true, radius: 20 }}
                accessibilityRole="button"
                accessibilityLabel={t.editNamed(name)}
              >
                <MaterialIcons name="edit" size={20} color={c.text3} />
              </Pressable>
              <Pressable
                onPress={() => {
                  haptic('press')
                  onDelete(item.id)
                }}
                style={styles.action}
                android_ripple={{ color: c.ripple, borderless: true, radius: 20 }}
                accessibilityRole="button"
                accessibilityLabel={t.deleteNamed(name)}
              >
                <MaterialIcons name="delete-outline" size={22} color={c.text3} />
              </Pressable>
              {dragHandlers && (
                <View {...dragHandlers} style={styles.grip} accessibilityLabel={t.moveNamed(name)}>
                  <MaterialIcons name="drag-handle" size={24} color={c.text3} />
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
      {!last && <View style={[styles.sep, { backgroundColor: c.sep }]} />}
    </View>
  )
})

const baseStyles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 22, gap: 6 },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, gap: 14 },
  actions: { flexDirection: 'row', marginLeft: -6 },
  action: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  grip: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, minWidth: 0 },
  name: { fontSize: 17 },
  strike: { textDecorationLine: 'line-through' },
  note: { fontSize: 14, marginTop: 1 },
  qty: { minWidth: 30, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  sep: { position: 'absolute', left: 54, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
})

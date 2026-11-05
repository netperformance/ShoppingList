import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native'
import type { Lang } from '../domain/lang'
import type { Product } from '../domain/model'
import { normalize } from '../domain/normalize'
import { parseInput } from '../domain/parse'
import { suggest } from '../domain/search'
import { useT } from './i18n'
import { useColors } from './theme'

export type AddRequest = { name: string; quantity: string; categoryId?: string }

interface Props {
  products: Product[]
  /** Sprache des Katalogs für die Vorschläge. */
  lang: Lang
  openKeys: Set<string>
  /** Oberkante unter der Kopfzeile. */
  top: number
  /** Höhe des großen Titels. Um so viel steht die Leiste anfangs tiefer und wandert beim Scrollen nach oben. */
  collapse: number
  scrollY: Animated.Value
  /** Aktueller Scrollstand (für die Höhe der Vorschläge). */
  scrollOffset: () => number
  /** Höhe des ganzen Bildschirms und wie viel die Tastatur davon verdeckt. */
  screenHeight: number
  keyboardOverlap: number
  onAdd: (req: AddRequest) => void
}

export const ADD_BAR_HEIGHT = 64

/**
 * Eingabeleiste oben unter dem Titel. Sie wandert beim Scrollen mit und bleibt dann unter
 * der Kopfzeile stehen. Die Vorschläge klappen nach unten auf. So verdeckt die Tastatur
 * das Eingabefeld nie.
 */
export function AddBar({ products, lang, openKeys, top, collapse, scrollY, scrollOffset, screenHeight, keyboardOverlap, onAdd }: Props) {
  const c = useColors()
  const t = useT()
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const input = useRef<TextInputInstance>(null)

  // Zurück-Taste schließt zuerst die Tastatur. Dann auch die Vorschläge schließen.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => input.current?.blur())
    return () => sub.remove()
  }, [])

  const parsed = useMemo(() => parseInput(text), [text])
  const suggestions = useMemo(() => suggest(parsed.name, products, 6, lang), [parsed.name, products, lang])
  const exact = suggestions.find((s) => s.key === normalize(parsed.name))

  const add = (req: AddRequest) => {
    if (!req.name.trim()) return
    onAdd(req)
    setText('')
  }

  const submit = () => {
    if (!parsed.name) return
    add(exact ? { name: exact.name, quantity: parsed.quantity, categoryId: exact.categoryId } : parsed)
  }

  const showPanel = focused && text !== ''
  const span = Math.max(1, collapse)
  const translateY = scrollY.interpolate({ inputRange: [0, span], outputRange: [collapse, 0], extrapolate: 'clamp' })
  const lineOpacity = scrollY.interpolate({ inputRange: [span - 8, span], outputRange: [0, 1], extrapolate: 'clamp' })
  // Platz zwischen Eingabefeld und Tastatur
  const barTop = top + Math.max(0, collapse - scrollOffset())
  const panelMax = Math.min(420, Math.max(140, screenHeight - keyboardOverlap - barTop - ADD_BAR_HEIGHT - 12))

  return (
    <View style={[StyleSheet.absoluteFill, { top }]} pointerEvents="box-none">
      {focused && <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} onPress={() => input.current?.blur()} />}

      <Animated.View style={{ transform: [{ translateY }] }} pointerEvents="box-none">
        <View style={[styles.bar, { backgroundColor: c.bg }]}>
          <View style={[styles.field, { backgroundColor: c.field, borderColor: focused ? c.accent : c.sep }]}>
            <TextInput
              ref={input}
              value={text}
              onChangeText={setText}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={submit}
              submitBehavior="submit"
              placeholder={t.addPlaceholder}
              placeholderTextColor={c.text3}
              returnKeyType="done"
              autoCapitalize="sentences"
              autoCorrect={false}
              autoComplete="off"
              style={[styles.input, { color: c.text }]}
              accessibilityLabel={t.addItem}
              cursorColor={c.accent}
              selectionColor={c.accentSoft}
            />
            {!!text && (
              <Pressable onPress={() => setText('')} hitSlop={10} accessibilityLabel={t.clearInput} style={styles.clear}>
                <MaterialIcons name="cancel" size={20} color={c.text3} />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => (text ? submit() : input.current?.focus())}
            style={({ pressed }) => [styles.add, { backgroundColor: c.accent, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
            android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true, radius: 24 }}
            accessibilityRole="button"
            accessibilityLabel={t.add}
          >
            <MaterialIcons name="add" size={28} color={c.onAccent} />
          </Pressable>
          <Animated.View style={[styles.line, { backgroundColor: c.sep, opacity: focused ? 0 : lineOpacity }]} />
        </View>

        {showPanel && (
          <View style={styles.panelWrap}>
            <View style={[styles.panel, { backgroundColor: c.card }]}>
              <ScrollView keyboardShouldPersistTaps="always" style={{ maxHeight: panelMax }}>
                {text !== '' && (
                  <>
                    {suggestions.map((s, i) => {
                      const onList = openKeys.has(s.key)
                      return (
                        <Pressable
                          key={s.key}
                          android_ripple={{ color: c.ripple }}
                          style={[styles.suggestion, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.sep }]}
                          onPress={() => add({ name: s.name, quantity: parsed.quantity, categoryId: s.categoryId })}
                          accessibilityRole="button"
                          accessibilityLabel={t.addNamed(s.name)}
                        >
                          <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
                            {highlight(s.name, parsed.name, c.text)}
                          </Text>
                          {onList ? (
                            <Text style={[styles.meta, { color: c.accent }]}>{t.onList}</Text>
                          ) : parsed.quantity ? (
                            <Text style={[styles.meta, { color: c.text2 }]}>{parsed.quantity}</Text>
                          ) : null}
                        </Pressable>
                      )
                    })}
                    {!exact && !!parsed.name && (
                      <Pressable
                        android_ripple={{ color: c.ripple }}
                        style={[styles.suggestion, suggestions.length > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.sep }]}
                        onPress={() => add(parsed)}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
                          {t.quoted(parsed.name)}{parsed.quantity ? ` · ${parsed.quantity}` : ''}
                        </Text>
                        <Text style={[styles.meta, { color: c.accent }]}>{t.new}</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  )
}

function highlight(name: string, query: string, color: string) {
  const q = query.trim().toLowerCase()
  const i = q ? name.toLowerCase().indexOf(q) : -1
  if (i < 0) return name
  return (
    <>
      {name.slice(0, i)}
      <Text style={{ fontWeight: '700', color }}>{name.slice(i, i + q.length)}</Text>
      {name.slice(i + q.length)}
    </>
  )
}

const styles = StyleSheet.create({
  bar: {
    height: ADD_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  line: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  field: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, height: 48, paddingLeft: 18, paddingRight: 8, fontSize: 17 },
  clear: { paddingHorizontal: 10 },
  add: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  panelWrap: { paddingHorizontal: 12, paddingTop: 4 },
  panel: { borderRadius: 16, overflow: 'hidden', elevation: 8 },
  suggestion: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 16, gap: 12 },
  label: { flex: 1, fontSize: 17 },
  meta: { fontSize: 14 },
})

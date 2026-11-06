import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Item } from '../domain/model'
import { stepQuantity } from '../domain/parse'
import { Sheet } from './Sheet'
import { useT } from './i18n'
import { useColors, useFont, useScaled } from './theme'
import { useSnapshot } from './useStore'

export type Draft = { name: string; quantity: string; note: string; categoryId: string }

const QUICK = ['2', '3', '4', '6', '500 g', '1 kg', '1 l']

interface Props {
  item: Item | null
  onSave: (id: string, draft: Draft) => void
  onDelete: (id: string) => void
  onClose: () => void
}

/** Bearbeiten eines Eintrags. Änderungen werden beim Schließen übernommen. */
export function EditSheet({ item, onSave, onDelete, onClose }: Props) {
  const c = useColors()
  const f = useFont()
  const styles = useScaled(baseStyles)
  const t = useT()
  const { categories, categoryOrder } = useSnapshot()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)

  useEffect(() => {
    if (!item) return
    setItemId(item.id)
    const { name, quantity, note, categoryId } = item.fields
    setDraft({ name, quantity, note, categoryId })
  }, [item])

  const close = () => {
    if (itemId && draft) onSave(itemId, draft)
    onClose()
  }
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  const field = [styles.field, { backgroundColor: c.card, color: c.text }]
  const label = [styles.label, { color: c.text2 }]

  return (
    <Sheet open={item !== null} title={t.edit} onClose={close}>
      {draft && (
        <>
          <Text style={label}>{t.name}</Text>
          <TextInput style={field} value={draft.name} onChangeText={(name) => set({ name })} cursorColor={c.accent} autoCorrect={false} />

          <Text style={label}>{t.quantity}</Text>
          <View style={styles.stepper}>
            <StepButton icon="remove" label={t.less} onPress={() => set({ quantity: stepQuantity(draft.quantity, -1) })} />
            <TextInput
              style={[field, styles.qtyField]}
              value={draft.quantity}
              placeholder={t.noQuantity}
              placeholderTextColor={c.text3}
              onChangeText={(quantity) => set({ quantity })}
              cursorColor={c.accent}
              autoCorrect={false}
            />
            <StepButton icon="add" label={t.more} onPress={() => set({ quantity: stepQuantity(draft.quantity, 1) })} />
          </View>
          <View style={styles.quick}>
            {QUICK.map((q) => {
              const active = draft.quantity === q
              return (
                <Pressable
                  key={q}
                  onPress={() => set({ quantity: active ? '' : q })}
                  style={[styles.quickChip, { backgroundColor: active ? c.accent : c.card }]}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={{ color: active ? c.onAccent : c.text2, fontSize: f(14), fontWeight: active ? '600' : '400' }}>{q}</Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={label}>{t.note}</Text>
          <TextInput
            style={field}
            value={draft.note}
            placeholder={t.notePlaceholder}
            placeholderTextColor={c.text3}
            onChangeText={(note) => set({ note })}
            cursorColor={c.accent}
          />

          <Text style={label}>{t.category}</Text>
          <View style={styles.grid}>
            {categoryOrder.map((id) => {
              const cat = categories.byId(id)
              const active = categories.resolve(draft.categoryId) === cat.id
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => set({ categoryId: cat.id })}
                  style={[
                    styles.category,
                    { backgroundColor: active ? c.accentSoft : c.card, borderColor: active ? c.accent : 'transparent' },
                  ]}
                  android_ripple={{ color: c.ripple }}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={{ flex: 1, color: c.text, fontSize: f(14), fontWeight: active ? '600' : '400' }}>{cat.name}</Text>
                </Pressable>
              )
            })}
          </View>
          <Text style={[styles.foot, { color: c.text2 }]}>{t.categoryRemembered}</Text>

          <Pressable
            style={[styles.delete, { backgroundColor: c.card }]}
            android_ripple={{ color: c.ripple }}
            onPress={() => {
              if (itemId) onDelete(itemId)
              setItemId(null)
              setDraft(null)
              onClose()
            }}
          >
            <MaterialIcons name="delete-outline" size={22} color={c.danger} />
            <Text style={{ color: c.danger, fontSize: f(16), fontWeight: '500' }}>{t.deleteItem}</Text>
          </Pressable>
        </>
      )}
    </Sheet>
  )
}

function StepButton({ icon, label, onPress }: { icon: 'add' | 'remove'; label: string; onPress: () => void }) {
  const c = useColors()
  const styles = useScaled(baseStyles)
  return (
    <Pressable
      onPress={onPress}
      style={[styles.step, { backgroundColor: c.card }]}
      android_ripple={{ color: c.ripple }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialIcons name={icon} size={24} color={c.accent} />
    </Pressable>
  )
}

const baseStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 18, marginBottom: 8, marginLeft: 4 },
  field: { height: 50, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 0, fontSize: 17 },
  stepper: { flexDirection: 'row', gap: 8 },
  qtyField: { flex: 1, minWidth: 0, textAlign: 'center' },
  step: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: {
    width: '48.8%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  catEmoji: { fontSize: 18 },
  foot: { fontSize: 13, marginTop: 8, marginLeft: 4 },
  delete: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: 12, marginTop: 24, overflow: 'hidden' },
})

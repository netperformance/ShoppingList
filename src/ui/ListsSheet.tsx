import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { haptic } from './haptics'
import { Sheet } from './Sheet'
import { useSnackbar } from './Snackbar'
import { useT } from './i18n'
import { useColors } from './theme'
import { useListStore, useSnapshot } from './useStore'

interface Props {
  open: boolean
  onClose: () => void
}

/** Auswahl der Listen: wechseln, anlegen, umbenennen, löschen. */
export function ListsSheet({ open, onClose }: Props) {
  const c = useColors()
  const store = useListStore()
  const { lists, list: active } = useSnapshot()
  const snack = useSnackbar()
  const t = useT()
  const [renaming, setRenaming] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!open) {
      setRenaming(null)
      setNewName('')
    }
  }, [open])

  const pick = (id: string) => {
    haptic('tick')
    store.switchList(id)
    onClose()
  }

  const saveRename = () => {
    if (renaming) store.renameList(renaming, draft)
    setRenaming(null)
  }

  const remove = (id: string, name: string) => {
    const itemIds = store.deleteList(id)
    if (!itemIds) return
    haptic('press')
    snack({ message: t.deleted(name), action: { label: t.undo, run: () => store.restoreList(id, itemIds) } })
  }

  const create = () => {
    if (!store.createList(newName)) return
    haptic('tick')
    setNewName('')
    onClose()
  }

  const sep = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.sep }

  return (
    <Sheet open={open} title={t.lists} onClose={onClose}>
      <View style={[styles.card, { backgroundColor: c.card }]}>
        {lists.map((l, i) => {
          const isActive = l.id === active.id
          if (renaming === l.id) {
            return (
              <View key={l.id} style={[styles.row, i > 0 && sep]}>
                <View style={styles.lead} />
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={saveRename}
                  onBlur={saveRename}
                  autoFocus
                  returnKeyType="done"
                  style={[styles.input, { color: c.text }]}
                  cursorColor={c.accent}
                  selectionColor={c.accentSoft}
                  accessibilityLabel={t.listName}
                />
              </View>
            )
          }
          return (
            <View key={l.id} style={[styles.row, i > 0 && sep]}>
              <Pressable
                onPress={() => pick(l.id)}
                style={styles.pick}
                android_ripple={{ color: c.ripple }}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={l.name}
              >
                <View style={styles.lead}>{isActive && <MaterialIcons name="check" size={20} color={c.accent} />}</View>
                <Text style={[styles.name, { color: c.text }, isActive && styles.bold]} numberOfLines={1}>
                  {l.name}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDraft(l.name)
                  setRenaming(l.id)
                }}
                style={styles.action}
                android_ripple={{ color: c.ripple, borderless: true, radius: 20 }}
                accessibilityLabel={t.renameNamed(l.name)}
              >
                <MaterialIcons name="edit" size={20} color={c.text3} />
              </Pressable>
              {lists.length > 1 && (
                <Pressable
                  onPress={() => remove(l.id, l.name)}
                  style={styles.action}
                  android_ripple={{ color: c.ripple, borderless: true, radius: 20 }}
                  accessibilityLabel={t.deleteNamed(l.name)}
                >
                  <MaterialIcons name="delete-outline" size={22} color={c.text3} />
                </Pressable>
              )}
            </View>
          )
        })}
        <View style={[styles.row, sep]}>
          <View style={styles.lead}>
            <MaterialIcons name="add" size={22} color={c.accent} />
          </View>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={create}
            placeholder={t.newList}
            placeholderTextColor={c.accent}
            returnKeyType="done"
            autoCapitalize="sentences"
            style={[styles.input, { color: c.text }]}
            cursorColor={c.accent}
            selectionColor={c.accentSoft}
            accessibilityLabel={t.newList}
          />
          {!!newName.trim() && (
            <Pressable onPress={create} hitSlop={8} style={styles.addButton} accessibilityRole="button">
              <Text style={{ color: c.accent, fontWeight: '600', fontSize: 16 }}>{t.create}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Sheet>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 54, paddingRight: 4 },
  pick: { flex: 1, flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  lead: { width: 48, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 17 },
  bold: { fontWeight: '600' },
  action: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, height: 54, fontSize: 17, paddingVertical: 0 },
  addButton: { paddingHorizontal: 12, paddingVertical: 8 },
})

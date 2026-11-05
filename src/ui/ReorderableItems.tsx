import { useEffect, useRef, useState } from 'react'
import { Animated, PanResponder, View } from 'react-native'
import type { Item } from '../domain/model'
import { haptic } from './haptics'
import { ItemRow } from './ItemRow'

type RowProps = {
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSwipeStart: () => void
  onSwipeEnd: () => void
}

interface Props {
  items: Item[]
  flashId: string | null
  rowProps: RowProps
  /** Neue Reihenfolge nach dem Loslassen. */
  onReorder: (ids: string[]) => void
  /** Während des Ziehens darf die Liste nicht scrollen. */
  onDragChange: (dragging: boolean) => void
}

/**
 * Offene Einträge einer Karte, am Griff verschiebbar. Die Zeilen dürfen unterschiedlich
 * hoch sein (z. B. mit Notiz), deshalb misst die Liste jede Zeile.
 */
export function ReorderableItems({ items, flashId, rowProps, onReorder, onDragChange }: Props) {
  const [order, setOrder] = useState(() => items.map((i) => i.id))
  const [dragId, setDragId] = useState<string | null>(null)
  const offset = useRef(new Animated.Value(0)).current
  const heights = useRef(new Map<string, number>()).current
  const drag = useRef({ id: null as string | null, order: [] as string[], startTop: 0 })
  const callbacks = useRef({ onReorder, onDragChange })
  callbacks.current = { onReorder, onDragChange }

  const ids = items.map((i) => i.id).join('|')
  useEffect(() => {
    if (!drag.current.id) setOrder(items.map((i) => i.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])

  const byId = new Map(items.map((i) => [i.id, i]))
  // Neu hinzugekommene Einträge erscheinen sofort, auch bevor die Reihenfolge nachgezogen ist.
  const visible = [...order.filter((id) => byId.has(id)), ...items.map((i) => i.id).filter((id) => !order.includes(id))]
  const orderRef = useRef(visible)
  orderRef.current = visible

  const top = (list: string[], id: string) => {
    let y = 0
    for (const x of list) {
      if (x === id) return y
      y += heights.get(x) ?? 56
    }
    return y
  }

  const responders = useRef(new Map<string, ReturnType<typeof PanResponder.create>>()).current
  const responderFor = (id: string) => {
    let r = responders.get(id)
    if (r) return r
    r = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const list = orderRef.current
        drag.current = { id, order: list, startTop: top(list, id) }
        offset.setValue(0)
        setDragId(id)
        callbacks.current.onDragChange(true)
        haptic('press')
      },
      onPanResponderMove: (_e, g) => {
        const d = drag.current
        const h = heights.get(id) ?? 56
        const center = d.startTop + g.dy + h / 2
        const others = d.order.filter((x) => x !== id)
        let index = 0
        let y = 0
        for (const x of others) {
          const xh = heights.get(x) ?? 56
          if (y + xh / 2 < center) index++
          y += xh
        }
        const next = [...others.slice(0, index), id, ...others.slice(index)]
        if (next.join('|') !== d.order.join('|')) {
          d.order = next
          setOrder(next)
          haptic('tick')
        }
        offset.setValue(d.startTop + g.dy - top(d.order, id))
      },
      onPanResponderRelease: () => finishRef.current(),
      onPanResponderTerminate: () => finishRef.current(),
    })
    responders.set(id, r)
    return r
  }

  const finish = () => {
    const d = drag.current
    const before = items.map((i) => i.id).join('|')
    d.id = null
    offset.setValue(0)
    setDragId(null)
    callbacks.current.onDragChange(false)
    if (d.order.join('|') !== before) callbacks.current.onReorder(d.order)
  }
  const finishRef = useRef(finish)
  finishRef.current = finish

  return (
    <View>
      {visible.map((id, i) => {
        const item = byId.get(id)!
        const lifted = dragId === id
        return (
          <Animated.View
            key={id}
            onLayout={(e) => heights.set(id, e.nativeEvent.layout.height)}
            style={lifted ? { zIndex: 2, elevation: 8, transform: [{ translateY: offset }, { scale: 1.02 }] } : undefined}
          >
            <ItemRow item={item} last={i === visible.length - 1} flash={id === flashId} dragHandlers={responderFor(id).panHandlers} {...rowProps} />
          </Animated.View>
        )
      })}
    </View>
  )
}

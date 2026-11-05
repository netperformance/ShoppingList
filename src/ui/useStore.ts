import { createContext, useContext, useSyncExternalStore } from 'react'
import type { ListStore, Snapshot } from '../store/store'

export const StoreContext = createContext<ListStore | null>(null)

export function useListStore(): ListStore {
  const store = useContext(StoreContext)
  if (!store) throw new Error('ListStore fehlt')
  return store
}

export function useSnapshot(): Snapshot {
  const store = useListStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

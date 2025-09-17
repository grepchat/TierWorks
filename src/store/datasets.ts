import { create } from 'zustand'
import type { Dataset } from '../types'
import { listLocalDatasets, putLocalDataset, removeLocalDataset } from '../lib/local'

type DatasetsState = {
  items: Dataset[]
  loading: boolean
  load: () => Promise<void>
  upsert: (d: Dataset) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useDatasets = create<DatasetsState>((set, get) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    const all = await listLocalDatasets()
    set({ items: all, loading: false })
  },
  upsert: async (d) => {
    await putLocalDataset(d)
    const { items } = get()
    const idx = items.findIndex((x) => x.id === d.id)
    if (idx >= 0) {
      const next = items.slice()
      next[idx] = d
      set({ items: next })
    } else {
      set({ items: [d, ...items] })
    }
  },
  remove: async (id) => {
    await removeLocalDataset(id)
    set({ items: get().items.filter((x) => x.id !== id) })
  },
}))



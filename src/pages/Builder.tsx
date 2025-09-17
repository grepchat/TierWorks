import { DndContext, useDroppable } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useMemo, useState } from 'react'
import type { Dataset, DatasetItem, Tier } from '../types'
import { useDatasets } from '../store/datasets'
import { buildShareUrl } from '../lib/share'

function SortableItem({ item }: { item: DatasetItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="px-2 py-1 bg-slate-700 rounded text-sm">
      {item.title}
    </div>
  )
}

function DroppableTier({ tierId, children }: { tierId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: tierId })
  return (
    <div ref={setNodeRef} className={isOver ? 'ring-2 ring-indigo-500 rounded' : undefined}>
      {children}
    </div>
  )
}

export default function Builder() {
  const { items: datasets, upsert } = useDatasets()
  const [currentId, setCurrentId] = useState<string | null>(null)
  const current = useMemo(() => datasets.find((d) => d.id === currentId) ?? null, [datasets, currentId])
  const [tierItems, setTierItems] = useState<Record<string, DatasetItem[]>>({})

  useEffect(() => {
    const first = datasets[0]
    if (!currentId && first) setCurrentId(first.id)
  }, [datasets])

  useEffect(() => {
    if (!current) return
    const groups = current.tiers.reduce((acc, t) => ({ ...acc, [t.id]: [] as DatasetItem[] }), {} as Record<string, DatasetItem[]>)
    // восстановить из placements
    if (current.placements) {
      for (const [itemId, tierId] of Object.entries(current.placements)) {
        const item = current.items.find((x) => x.id === itemId)
        if (item && groups[tierId]) groups[tierId].push(item)
      }
    }
    setTierItems(groups)
  }, [currentId])

  const onDragEnd = (e: DragEndEvent) => {
    const activeId = e.active.id as string
    const overId = e.over?.id as string | undefined
    if (!overId || !current) return
    const item = current.items.find((x) => x.id === activeId)
    if (!item) return
    setTierItems((prev) => {
      const next: Record<string, DatasetItem[]> = {}
      // remove from all tiers
      for (const [tid, arr] of Object.entries(prev)) {
        next[tid] = arr.filter((x) => x.id !== item.id)
      }
      // add to target tier
      next[overId] = [...(next[overId] ?? []), item]
      // persist placements into dataset
      if (current) {
        const placements: Record<string, string> = {}
        for (const [tid, arr] of Object.entries(next)) {
          for (const it of arr) placements[it.id] = tid
        }
        const updated: Dataset = { ...current, placements, updatedAt: new Date().toISOString() }
        upsert(updated)
      }
      return next
    })
  }

  if (!current) return <div className="p-6 text-slate-400">Нет выбранного датасета. Создайте в разделе «Датасеты».</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <select value={currentId ?? ''} onChange={(e) => setCurrentId(e.target.value)} className="bg-slate-800 rounded px-2 py-1">
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
        </select>
        <h2 className="text-xl font-semibold">{current.title}</h2>
        <button onClick={() => navigator.clipboard.writeText(buildShareUrl(current))} className="ml-auto px-3 py-2 bg-slate-700 rounded">Скопировать ссылку</button>
      </div>
      <DndContext onDragEnd={onDragEnd}>
        <div className="grid gap-3">
          {current.tiers.map((t) => (
            <div key={t.id} className="bg-slate-800 rounded p-3">
              <div className="mb-2 font-medium" style={{ color: t.color }}>{t.label}</div>
              <DroppableTier tierId={t.id}>
                <SortableContext items={(tierItems[t.id] ?? []).map((i) => i.id)} strategy={rectSortingStrategy}>
                  <div className="flex flex-wrap gap-2 min-h-12">
                  {(tierItems[t.id] ?? []).map((i) => (
                    <SortableItem key={i.id} item={i} />
                  ))}
                  </div>
                </SortableContext>
              </DroppableTier>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <div className="text-slate-400 mb-2">Элементы</div>
          <SortableContext items={current.items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-2">
              {current.items.map((i) => (
                <SortableItem key={i.id} item={i} />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>
    </div>
  )
}



import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MediaItem, TierAssignment, TierId } from '../types'
import { useMemo, useState } from 'react'

interface TierGridProps {
  pool: MediaItem[]
  tiers: TierAssignment
  onMove: (itemId: string, from: 'pool' | TierId, to: 'pool' | TierId, toIndex?: number) => void
  selectedItemId?: string
  onSelectItem?: (itemId?: string) => void
  onAssignClick?: (tier: TierId) => void
}

export function TierGrid({ pool, tiers, onMove, selectedItemId, onSelectItem, onAssignClick }: TierGridProps) {
  const tierOrder: TierId[] = ['S', 'A', 'B', 'C', 'D', 'U']
  const tierLabel: Record<TierId, string> = { S: 'S', A: 'A', B: 'B', C: 'C', D: 'D', U: 'Без оценки' }

  const containers = useMemo(() => ({
    pool: pool.map(i => i.id),
    ...Object.fromEntries(tierOrder.map(t => [t, tiers[t].map(i => i.id)])),
  }), [pool, tiers]) as Record<'pool' | TierId, string[]>

  function handleDragEnd(evt: DragEndEvent) {
    const { active, over } = evt
    if (!over) return
    const [fromContainer, fromIndex] = active.id.toString().split(':') as [string, string]
    const [toContainer, toIndexMaybe] = over.id.toString().split(':') as [string, string | undefined]
    const toIndex = toIndexMaybe ? Number(toIndexMaybe) : undefined
    const itemId = active.data.current?.itemId as string
    if (!itemId) return
    const from = (fromContainer === 'pool' ? 'pool' : fromContainer) as 'pool' | TierId
    const to = (toContainer === 'pool' ? 'pool' : toContainer) as 'pool' | TierId
    if (from === to && fromIndex !== undefined && toIndex !== undefined && Number(fromIndex) === toIndex) return
    onMove(itemId, from, to, toIndex)
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="tm-tiers">
        {(['S','A','B','C','D','U'] as TierId[]).map((tier) => (
          <div key={tier} className="tm-row">
            <div
              className={`tm-label t-${tier}`}
              role={onAssignClick ? 'button' : undefined}
              tabIndex={onAssignClick ? 0 : -1}
              onClick={onAssignClick ? () => onAssignClick(tier) : undefined}
            >{tierLabel[tier]}</div>
            <SortableContext items={containers[tier]} strategy={rectSortingStrategy}>
              <div className={`tm-drop d-${tier}`}>
                {tiers[tier].map((item, idx) => (
                  <SortableItem
                    key={item.id}
                    id={`${tier}:${idx}`}
                    itemId={item.id}
                    onPointerDown={() => onSelectItem?.(item.id)}
                    onClick={() => onSelectItem?.(item.id)}
                  >
                    <Thumb item={item} selected={selectedItemId === item.id} />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
      <div className="tm-pool">
        <h2>Пул</h2>
        <SortableContext items={containers.pool} strategy={rectSortingStrategy}>
          <div className="tm-pool-grid">
            {pool.map((item, idx) => (
              <SortableItem
                key={item.id}
                id={`pool:${idx}`}
                itemId={item.id}
                onPointerDown={() => onSelectItem?.(item.id)}
                onClick={() => onSelectItem?.(item.id)}
              >
                <Thumb item={item} selected={selectedItemId === item.id} />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  )
}

function SortableItem({ id, itemId, children, onClick, onPointerDown }: { id: string; itemId: string; children: React.ReactNode; onClick?: () => void; onPointerDown?: () => void }) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { itemId } })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  } as React.CSSProperties
  return (
    <div ref={setNodeRef} style={style} onClick={onClick} onPointerDown={onPointerDown}>
      {children}
    </div>
  )
}

function Card({ item, small }: { item: MediaItem; small?: boolean }) {
  return (
    <div className={small ? 'card-sm' : 'card'}>
      <img src={item.imageUrl} alt={item.title} />
      <div className="card-title">{item.title}</div>
    </div>
  )
}

function Thumb({ item, selected, onClick }: { item: MediaItem; selected?: boolean; onClick?: () => void }) {
  const candidates = [
    item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl : undefined,
    `/public/posters/${item.id}.jpg`,
    `/public/posters/${item.id}.png`,
    `/public/posters-basketball/${item.id}.jpg`,
    `/public/posters-basketball/${item.id}.png`,
    `/public/posters-basketball-teams/${item.id}.jpg`,
    `/public/posters-basketball-teams/${item.id}.png`,
    `/public/posters-movies/${item.id}.jpg`,
    `/public/posters-movies/${item.id}.png`,
    `/public/posters-football-players/${item.id}.jpg`,
    `/public/posters-football-players/${item.id}.png`,
    `/public/posters-actors/${item.id}.jpg`,
    `/public/posters-actors/${item.id}.png`,
    `/public/posters-football/${item.id}.jpg`,
    `/public/posters-football/${item.id}.png`,
  ].filter(Boolean) as string[]
  const [idx, setIdx] = useState(0)
  const src = candidates[Math.min(idx, candidates.length - 1)]
  function onErr() {
    setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))
  }
  return (
    <div className={selected ? 'thumb selected' : 'thumb'} onClick={onClick}>
      <img src={src} onError={onErr} alt={item.title} />
    </div>
  )
}


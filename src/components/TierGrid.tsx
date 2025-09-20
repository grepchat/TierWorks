import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MediaItem, TierAssignment, TierId } from '../types'
import React, { useMemo, useState } from 'react'
import { Modal } from './Modal'

interface TierGridProps {
  pool: MediaItem[]
  tiers: TierAssignment
  onMove: (itemId: string, from: 'pool' | TierId, to: 'pool' | TierId, toIndex?: number) => void
  selectedItemId?: string
  onSelectItem?: (itemId?: string) => void
  onAssignClick?: (tier: TierId) => void
  showRowControls?: boolean
}

export function TierGrid({ pool, tiers, onMove, selectedItemId, onSelectItem, onAssignClick, showRowControls }: TierGridProps) {
  const defaultOrder: TierId[] = ['S', 'A', 'B', 'C', 'D', 'U']
  const [rowOrder, setRowOrder] = useState<TierId[]>(defaultOrder)
  const [rowSettings, setRowSettings] = useState<Record<TierId, { label: string; color: string }>>({
    S: { label: 'S', color: '#f59e0b' },
    A: { label: 'A', color: '#ef4444' },
    B: { label: 'B', color: '#22c55e' },
    C: { label: 'C', color: '#3b82f6' },
    D: { label: 'D', color: '#a855f7' },
    U: { label: 'Без оценки', color: '#94a3b8' },
  })
  const [editTier, setEditTier] = useState<TierId | undefined>()
  const [tempLabel, setTempLabel] = useState('')
  const [tempColor, setTempColor] = useState('')

  const containers = useMemo(() => ({
    pool: pool.map(i => i.id),
    ...Object.fromEntries(rowOrder.map(t => [t, tiers[t].map(i => i.id)])),
  }), [pool, tiers, rowOrder]) as Record<'pool' | TierId, string[]>

  function moveTierUp(tier: TierId) {
    setRowOrder(prev => {
      const idx = prev.indexOf(tier)
      if (idx <= 0) return prev
      const next = prev.slice()
      const tmp = next[idx - 1]
      next[idx - 1] = next[idx]
      next[idx] = tmp
      return next
    })
  }
  function moveTierDown(tier: TierId) {
    setRowOrder(prev => {
      const idx = prev.indexOf(tier)
      if (idx === -1 || idx >= prev.length - 1) return prev
      const next = prev.slice()
      const tmp = next[idx + 1]
      next[idx + 1] = next[idx]
      next[idx] = tmp
      return next
    })
  }

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
        {(rowOrder as TierId[]).map((tier) => (
          <div key={tier} className="tm-row">
            <div
              className={`tm-label`}
              style={{ background: rowSettings[tier]?.color || undefined }}
              role={onAssignClick ? 'button' : undefined}
              tabIndex={onAssignClick ? 0 : -1}
              onClick={onAssignClick ? () => onAssignClick(tier) : undefined}
            >{rowSettings[tier]?.label || tier}</div>
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
            {showRowControls && (
            <div className="tm-row-controls">
              <button className="tm-row-btn" title="Вверх" onClick={() => { moveTierUp(tier) }}>▲</button>
              <button className="tm-row-btn" title="Вниз" onClick={() => { moveTierDown(tier) }}>▼</button>
              <button className="tm-row-btn" title="Настройки" onClick={() => { setEditTier(tier); setTempLabel(rowSettings[tier].label); setTempColor(rowSettings[tier].color) }}>⚙</button>
            </div>
            )}
          </div>
        ))}
      </div>
      {pool.length > 0 && (
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
      )}
      {showRowControls && (
      <Modal open={!!editTier} title="Настройки уровня" onClose={() => setEditTier(undefined)} footer={(
        <>
          <button className="tm-tier-btn" onClick={() => setEditTier(undefined)}>Закрыть</button>
          {editTier && (
            <button className="tm-tier-btn" onClick={() => {
              setRowSettings(prev => ({ ...prev, [editTier]: { label: tempLabel, color: tempColor || prev[editTier].color } }))
              setEditTier(undefined)
            }}>Сохранить</button>
          )}
        </>
      )}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Название уровня</label>
            <input value={tempLabel} onChange={(e)=>setTempLabel(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.06)', color: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Цвет</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#94a3b8','#eab308','#06b6d4','#60a5fa','#8b5cf6','#f472b6','#a78bfa','#111827','#6b7280','#e5e7eb'].map(c => (
                <button key={c} onClick={()=>setTempColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', border: tempColor===c? '2px solid #fff':'1px solid var(--border)', background: c }} aria-label={c} />
              ))}
            </div>
          </div>
          {editTier && (
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
              <button className="tm-tier-btn" onClick={() => {
                // Очистить уровень: все элементы обратно в пул
                const ids = tiers[editTier].map(i=>i.id)
                ids.forEach((id, index) => onMove(id, editTier, 'pool', undefined))
              }}>Очистить уровень</button>
              <button className="tm-tier-btn" disabled>Удалить уровень</button>
            </div>
          )}
        </div>
      </Modal>
      )}
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


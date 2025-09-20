import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MediaItem, TierAssignment, TierId } from '../types'
import React, { useMemo, useState } from 'react'
import { Modal } from './Modal'

interface TierGridProps {
  pool: MediaItem[]
  tiers: TierAssignment
  onMove: (itemId: string, from: 'pool' | TierId, to: 'pool' | TierId, toIndex?: number) => void
  onRenameItem?: (itemId: string, title: string) => void
  selectedItemId?: string
  onSelectItem?: (itemId?: string) => void
  onAssignClick?: (tier: TierId) => void
  showRowControls?: boolean
  poolFirst?: boolean
  showEmptyPoolHint?: boolean
  dragFromPoolOnly?: boolean
  editablePoolTitles?: boolean
}

export function TierGrid({ pool, tiers, onMove, onRenameItem, selectedItemId, onSelectItem, onAssignClick, showRowControls, poolFirst, showEmptyPoolHint, dragFromPoolOnly, editablePoolTitles }: TierGridProps) {
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
    pool: pool.map((_, idx) => `pool:${idx}`),
    ...Object.fromEntries(rowOrder.map(t => [t, tiers[t].map((_, idx) => `${t}:${idx}`)])),
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
    const overId = over.id.toString()
    let toContainer: 'pool' | TierId
    let toIndex: number | undefined
    if (overId.startsWith('drop-')) {
      const key = overId.slice(5)
      toContainer = (key === 'pool' ? 'pool' : (key as TierId))
      toIndex = undefined
    } else {
      const [toContainerStr, toIndexMaybe] = overId.split(':') as [string, string | undefined]
      toContainer = (toContainerStr === 'pool' ? 'pool' : (toContainerStr as TierId))
      toIndex = toIndexMaybe ? Number(toIndexMaybe) : undefined
    }
    const itemId = active.data.current?.itemId as string
    if (!itemId) return
    const from = (fromContainer === 'pool' ? 'pool' : fromContainer) as 'pool' | TierId
    const to = (toContainer === 'pool' ? 'pool' : toContainer) as 'pool' | TierId
    if (dragFromPoolOnly && from !== 'pool') return
    if (from === to && fromIndex !== undefined && toIndex !== undefined && Number(fromIndex) === toIndex) return
    onMove(itemId, from, to, toIndex)
  }

  const tiersSection = (
      <div className="tm-tiers">
        {(rowOrder as TierId[]).map((tier) => (
          <div key={tier} className="tm-row">
            <div
              className={`tm-label`}
              style={{ background: rowSettings[tier]?.color || undefined }}
              role={onAssignClick ? 'button' : undefined}
              tabIndex={onAssignClick ? 0 : -1}
              onClick={onAssignClick ? () => onAssignClick(tier) : undefined}
            >
              {rowSettings[tier]?.label || tier}
            </div>
            <SortableContext items={containers[tier]} strategy={rectSortingStrategy}>
              {(() => {
                const { setNodeRef } = useDroppable({ id: `drop-${tier}` })
                return (
                  <div ref={setNodeRef} className={`tm-drop d-${tier}`}>
                {tiers[tier].map((item, idx) => (
                  <SortableItem
                    key={item.id}
                    id={`${tier}:${idx}`}
                    itemId={item.id}
                    disabled={!!dragFromPoolOnly}
                    onPointerDown={() => onSelectItem?.(item.id)}
                    onClick={() => onSelectItem?.(item.id)}
                  >
                    <Thumb item={item} selected={selectedItemId === item.id} />
                  </SortableItem>
                ))}
                {showRowControls && (
                  <div className="tm-row-controls" aria-hidden={!showRowControls}>
                    <button className="tm-row-btn" title="Настройки" aria-label="Настройки" onClick={(e) => { e.stopPropagation(); setEditTier(tier); setTempLabel(rowSettings[tier].label); setTempColor(rowSettings[tier].color) }}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="currentColor"/>
                        <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.76 7.76 0 0 0-1.7-.98l-.38-2.65a.5.5 0 0 0-.5-.42h-4a.5.5 0 0 0-.5.42l-.38 2.65c-.61.24-1.18.56-1.7.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98L2.32 14.63a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.52.42 1.09.75 1.7.98l.38 2.65a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.38-2.65c.61-.24 1.18-.56 1.7-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="tm-row-btn" title="Вверх" onClick={(e) => { e.stopPropagation(); moveTierUp(tier) }}>▲</button>
                    <button className="tm-row-btn" title="Вниз" onClick={(e) => { e.stopPropagation(); moveTierDown(tier) }}>▼</button>
                  </div>
                )}
                  </div>
                )
              })()}
            </SortableContext>
            {/* controls rendered inside tm-drop */}
          </div>
        ))}
      </div>
  )

  const poolSection = (
      <div className="tm-pool">
        <h2>Пул</h2>
          <SortableContext items={containers.pool} strategy={rectSortingStrategy}>
            {(() => {
              const { setNodeRef } = useDroppable({ id: `drop-pool` })
              return (
                <div ref={setNodeRef} className="tm-pool-grid">
            {pool.length === 0 && showEmptyPoolHint && (
              <div className="drop-placeholder" style={{ gridColumn: '1 / -1' }}>
                Пул пуст.
              </div>
            )}
              {pool.map((item, idx) => (
              <SortableItem
                key={item.id}
                id={`pool:${idx}`}
                itemId={item.id}
                  disabled={false}
                onPointerDown={() => onSelectItem?.(item.id)}
                onClick={() => onSelectItem?.(item.id)}
              >
                <div>
                  <Thumb item={item} selected={selectedItemId === item.id} />
                  {editablePoolTitles && (
                    <input
                      value={item.title}
                      onChange={(e) => onRenameItem?.(item.id, e.target.value)}
                      placeholder="Название"
                      style={{ marginTop: 6, width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.06)', color: 'inherit', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              </SortableItem>
            ))}
                </div>
              )
            })()}
        </SortableContext>
      </div>
  )

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {poolFirst ? (
        <>
          {poolSection}
          {tiersSection}
        </>
      ) : (
        <>
          {tiersSection}
          {poolSection}
        </>
      )}
      {showRowControls && (
      <Modal open={!!editTier} title="Настройки категории" onClose={() => setEditTier(undefined)} footer={(
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
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Название категории</label>
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
              }}>Очистить категорию</button>
              <button className="tm-tier-btn" disabled>Удалить категорию</button>
            </div>
          )}
        </div>
      </Modal>
      )}
    </DndContext>
  )
}

function SortableItem({ id, itemId, children, onClick, onPointerDown, disabled }: { id: string; itemId: string; children: React.ReactNode; onClick?: () => void; onPointerDown?: () => void; disabled?: boolean }) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { itemId }, disabled })
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


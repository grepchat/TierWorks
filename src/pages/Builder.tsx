import { useEffect, useMemo, useState } from 'react'
import type { MediaItem, TierAssignment, TierId } from '../types'
import { TierGrid } from '../components/TierGrid'
import { getTemplate, listTemplates } from '../storage'
import { UploadPanel } from '../components/UploadPanel'
import { useLocation } from 'react-router-dom'
import { getPublicTemplate } from '../publicTemplates'
import { fetchTopTVFromTMDB } from '../tmdb'

const initialPool: MediaItem[] = [
  { id: 'bb', title: 'Во все тяжкие', imageUrl: 'https://via.placeholder.com/160x90?text=Breaking+Bad' },
  { id: 'got', title: 'Игра престолов', imageUrl: 'https://via.placeholder.com/160x90?text=GoT' },
  { id: 'st', title: 'Очень странные дела', imageUrl: 'https://via.placeholder.com/160x90?text=Stranger+Things' },
  { id: 'crown', title: 'Корона', imageUrl: 'https://via.placeholder.com/160x90?text=The+Crown' },
]

const emptyTiers: TierAssignment = { S: [], A: [], B: [], C: [], D: [], U: [] }

export default function Builder() {
  const loc = useLocation()
  const [pool, setPool] = useState<MediaItem[]>(initialPool)
  const [tiers, setTiers] = useState<TierAssignment>(emptyTiers)
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([])
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    const list = listTemplates().sort((a, b) => b.createdAt - a.createdAt)
    setTemplates(list.map(t => ({ id: t.id, name: t.name })))
  }, [])

  useEffect(() => {
    const qp = new URLSearchParams(loc.search)
    const tplId = qp.get('tpl')
    if (tplId) {
      const pub = getPublicTemplate(tplId)
      if (pub) setPool(prev => [...pub.items, ...prev])
    }
  }, [loc.search])

  function removeFrom(list: MediaItem[], id: string) {
    const idx = list.findIndex(i => i.id === id)
    if (idx === -1) return { next: list, removed: undefined as MediaItem | undefined, index: -1 }
    const removed = list[idx]
    const next = [...list.slice(0, idx), ...list.slice(idx + 1)]
    return { next, removed, index: idx }
  }

  function insertAt(list: MediaItem[], index: number | undefined, item: MediaItem) {
    if (index === undefined || index < 0 || index > list.length) return [...list, item]
    return [...list.slice(0, index), item, ...list.slice(index)]
  }

  function move(itemId: string, from: 'pool' | TierId, to: 'pool' | TierId, toIndex?: number) {
    if (from === to) return
    let moved: MediaItem | undefined
    if (from === 'pool') {
      const res = removeFrom(pool, itemId)
      moved = res.removed
      setPool(res.next)
    } else {
      const res = removeFrom(tiers[from], itemId)
      moved = res.removed
      setTiers(prev => ({ ...prev, [from]: res.next }))
    }
    if (!moved) return
    if (to === 'pool') {
      setPool(prev => insertAt(prev, toIndex, moved!))
    } else {
      setTiers(prev => ({ ...prev, [to]: insertAt(prev[to], toIndex, moved!) }))
    }
  }

  return (
    <div>
      <h1>Конструктор</h1>
      <p>Перетащи элементы из пула в уровни S/A/B/C/D.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0 16px' }}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ padding: 8, borderRadius: 8, background: 'transparent', color: 'inherit', border: '1px solid rgba(255,255,255,0.2)' }}>
          <option value="">— Выбрать шаблон —</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button className="secondary" disabled={!selected} onClick={() => {
          if (!selected) return
          const tpl = getTemplate(selected)
          if (!tpl) return
          setPool(prev => [...prev, ...tpl.items])
        }}>Добавить в пул</button>
      </div>
      <div style={{ margin: '8px 0 16px' }}>
        <h3 style={{ margin: '0 0 8px' }}>Импорт в пул</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button className="secondary" onClick={async () => {
            const apiKey = prompt('Введите TMDB API Key')
            if (!apiKey) return
            try {
              const items = await fetchTopTVFromTMDB(apiKey, 50)
              setPool(prev => [...prev, ...items])
            } catch (e: any) {
              alert('Ошибка TMDB: ' + (e?.message || e))
            }
          }}>Импортировать Top‑50 (TMDB)</button>
        </div>
        <UploadPanel onItems={(items) => setPool(prev => [...prev, ...items])} />
      </div>
      <TierGrid pool={pool} tiers={tiers} onMove={move} />
    </div>
  )
}


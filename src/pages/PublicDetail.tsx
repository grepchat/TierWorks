import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getPublicTemplate } from '../publicTemplates'
import { resolvePostersForItems } from '../tmdb'
import type { MediaItem, TierAssignment, TierId } from '../types'
import { TierGrid } from '../components/TierGrid'

const emptyTiers: TierAssignment = { S: [], A: [], B: [], C: [], D: [], U: [] }

export default function PublicDetail() {
  const { id } = useParams()
  const [pool, setPool] = useState<MediaItem[]>([])
  const [tiers, setTiers] = useState<TierAssignment>(emptyTiers)
  const [selected, setSelected] = useState<string | undefined>()

  useEffect(() => {
    if (!id) return
    const tpl = getPublicTemplate(id)
    if (tpl) setPool(tpl.items)
  }, [id])

  function removeFrom(list: MediaItem[], id: string) {
    const idx = list.findIndex(i => i.id === id)
    if (idx === -1) return { next: list, removed: undefined as MediaItem | undefined }
    const removed = list[idx]
    const next = [...list.slice(0, idx), ...list.slice(idx + 1)]
    return { next, removed }
  }
  function insertAt(list: MediaItem[], index: number | undefined, item: MediaItem) {
    if (index === undefined || index < 0 || index > list.length) return [...list, item]
    return [...list.slice(0, index), item, ...list.slice(index)]
  }
  function onMove(itemId: string, from: 'pool' | TierId, to: 'pool' | TierId, toIndex?: number) {
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
    if (to === 'pool') setPool(prev => insertAt(prev, toIndex, moved!))
    else setTiers(prev => ({ ...prev, [to]: insertAt(prev[to], toIndex, moved!) }))
  }

  function onAssignClick(tier: TierId) {
    if (!selected) return
    const inPool = pool.find(i => i.id === selected)
    const inTier = (['S','A','B','C','D','U'] as TierId[]).flatMap(t => tiers[t]).find(i => i.id === selected)
    const from: 'pool' | TierId | undefined = inPool ? 'pool' : (inTier ? (['S','A','B','C','D','U'] as TierId[]).find(t => tiers[t].some(i => i.id === selected)) : undefined)
    if (!from) return
    onMove(selected, from, tier)
    setSelected(undefined)
  }

  function onSkip() {
    if (!selected) return
    // If selected is in any tier, move back to pool (to the end)
    const inTierKey = (['S','A','B','C','D','U'] as TierId[]).find(t => tiers[t].some(i => i.id === selected))
    if (inTierKey) {
      const res = removeFrom(tiers[inTierKey], selected)
      if (res.removed) {
        setTiers(prev => ({ ...prev, [inTierKey]: res.next }))
        setPool(prev => [...prev, res.removed!])
      }
      setSelected(undefined)
      return
    }
    // If selected is in pool, rotate it to the end
    const res = removeFrom(pool, selected)
    if (res.removed) {
      setPool(prev => [...res.next, res.removed!])
    }
    setSelected(undefined)
  }


  // Initial random pick once when pool first loads
  const initialPickDone = useRef(false)
  useEffect(() => {
    if (initialPickDone.current) return
    if (pool.length > 0) {
      const item = pool[Math.floor(Math.random() * pool.length)]
      if (item) {
        setSelected(item.id)
        initialPickDone.current = true
      }
    }
  }, [pool])

  // When selection is cleared and pool has items, pick the next (first) item in queue
  useEffect(() => {
    if (!selected && pool.length > 0 && initialPickDone.current) {
      setSelected(pool[0].id)
    }
  }, [selected, pool])

  const selectedItem: MediaItem | undefined = selected
    ? (pool.find(i => i.id === selected) || (['S','A','B','C','D','U'] as TierId[]).flatMap(t => tiers[t]).find(i => i.id === selected))
    : undefined

  function Poster({ item }: { item: MediaItem }) {
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
    useEffect(() => { setIdx(0) }, [item.id, item.imageUrl])
    function onErr() { setIdx(i => (i + 1 < candidates.length ? i + 1 : i)) }
    return <img src={src} onError={onErr} alt={item.title} />
  }

  // Background poster resolution using stored TMDB key
  const postersResolved = useRef(false)
  useEffect(() => {
    if (postersResolved.current) return
    const missing = pool.some(i => !i.imageUrl)
    if (!missing) return
    const key = sessionStorage.getItem('tw:tmdb:key') || localStorage.getItem('tw:tmdb:key')
    if (!key) return
    postersResolved.current = true
    ;(async () => {
      try {
        const updated = await resolvePostersForItems(key, pool)
        setPool(updated)
      } catch (err) {
        console.warn('TMDB posters resolve failed', err)
        postersResolved.current = false
      }
    })()
  }, [pool])

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Link to="/public" className="back-link">Назад к публичным тир‑листам</Link>
      </div>
      <h1>{getPublicTemplate(id || '')?.name ?? 'Публичный тир-лист'}</h1>
      <div className="tm-layout">
        <div>
          <TierGrid pool={pool} tiers={tiers} onMove={onMove} selectedItemId={selected} onSelectItem={setSelected} onAssignClick={onAssignClick} />
        </div>
        <aside className="tm-side">
          <h3 style={{ marginTop: 0 }}>Распределение</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button className="tm-tier-btn" onClick={() => setSelected(undefined)}>Снять выделение</button>
            <button className="tm-tier-btn" onClick={onSkip}>Пропустить</button>
          </div>
          {!selectedItem && <p style={{ color: '#94a3b8' }}>Выберите элемент в пуле или в одном из уровней.</p>}
          {selectedItem && (
            <div>
              <div className="thumb" style={{ marginBottom: 8 }}>
                <Poster item={selectedItem} />
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{selectedItem.title}</div>
              <div className="tm-tier-buttons">
                {(['S','A','B','C','D','U'] as TierId[]).map(t => (
                  <button key={t} className={`tm-tier-btn btn-${t}`} onClick={() => onAssignClick(t)}>
                    {t === 'U' ? 'Без оценки' : `Отправить в ${t}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}


import { Link, useLocation, useParams } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getPublicTemplate } from '../publicTemplates'
import { resolvePostersForItems } from '../tmdb'
import type { MediaItem, TierAssignment, TierId } from '../types'
import { TierGrid } from '../components/TierGrid'
import { saveResult, getCurrentUser } from '../storage'
import { toPng } from 'html-to-image'
import { Modal } from '../components/Modal'

const emptyTiers: TierAssignment = { S: [], A: [], B: [], C: [], D: [], U: [] }

export default function PublicDetail() {
  const { id } = useParams()
  const location = useLocation()
  const isFromProfile = new URLSearchParams(location.search).has('result')
  const [pool, setPool] = useState<MediaItem[]>([])
  const [tiers, setTiers] = useState<TierAssignment>(emptyTiers)
  const [selected, setSelected] = useState<string | undefined>()
  const [selectionQueue, setSelectionQueue] = useState<string[]>([])
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [toast, setToast] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | undefined>()
  const [incompleteWarn, setIncompleteWarn] = useState<string | undefined>()
  const [exportWarn, setExportWarn] = useState<string | undefined>()

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(undefined), 1800)
  }

  useEffect(() => {
    if (!id) return
    const tpl = getPublicTemplate(id)
    if (tpl) setPool(tpl.items)
  }, [id])

  // Load saved result if provided via ?result=ID
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const rid = params.get('result')
    if (!rid) return
    try {
      const raw = localStorage.getItem('tierworks:results')
      if (!raw) return
      const all = JSON.parse(raw) as Array<{ id: string; templateId: string; tiers: TierAssignment }>
      const found = all.find(x => x.id === rid && x.templateId === id)
      if (found) {
        setTiers(found.tiers)
        // Build pool from template minus assigned items
        const tpl = getPublicTemplate(id || '')
        if (tpl) {
          const assignedIds = (['S','A','B','C','D','U'] as TierId[]).flatMap(t => found.tiers[t]).map(i => i.id)
          const remaining = tpl.items.filter(i => !assignedIds.includes(i.id))
          setPool(remaining)
          setSelected(remaining[0]?.id)
        }
      }
    } catch {}
  }, [location.search, id])

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
  const onMove = useCallback((itemId: string, from: 'pool' | TierId, to: 'pool' | TierId, toIndex?: number) => {
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
  }, [pool, tiers])

  const onAssignClick = useCallback((tier: TierId) => {
    if (!selected) return
    // Determine next selection before mutating state
    const nextQueue = selectionQueue.filter(id => id !== selected)
    const nextId = nextQueue.length > 0 ? nextQueue[0] : undefined
    const inPool = pool.find(i => i.id === selected)
    const inTier = (['S','A','B','C','D','U'] as TierId[]).flatMap(t => tiers[t]).find(i => i.id === selected)
    const from: 'pool' | TierId | undefined = inPool ? 'pool' : (inTier ? (['S','A','B','C','D','U'] as TierId[]).find(t => tiers[t].some(i => i.id === selected)) : undefined)
    if (!from) return
    onMove(selected, from, tier)
    // Eagerly update queue and selection to avoid reselecting the same item
    setSelectionQueue(nextQueue)
    setSelected(nextId)
  }, [selected, selectionQueue, pool, tiers, onMove])

  const onSkip = useCallback(() => {
    if (!selected) return
    // If selected is in any tier, move back to pool (to the end)
    const inTierKey = (['S','A','B','C','D','U'] as TierId[]).find(t => tiers[t].some(i => i.id === selected))
    if (inTierKey) {
      const res = removeFrom(tiers[inTierKey], selected)
      if (res.removed) {
        setTiers(prev => ({ ...prev, [inTierKey]: res.next }))
        setPool(prev => [...prev, res.removed!])
      }
    } else {
      // If selected is in pool, rotate it to the end
      const res = removeFrom(pool, selected)
      if (res.removed) {
        setPool(prev => [...res.next, res.removed!])
      }
    }
    // Defer this id to the end of randomized queue
    setSelectionQueue(q => {
      const rest = q.filter(id => id !== selected)
      return [...rest, selected]
    })
    setSelected(undefined)
  }, [selected, tiers, pool])

  // Randomized queue management
  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp
    }
    return a
  }

  // Rebuild queue when pool content changes
  useEffect(() => {
    const poolIds = pool.map(i => i.id)
    const kept = selectionQueue.filter(id => poolIds.includes(id))
    const newOnes = poolIds.filter(id => !kept.includes(id))
    const nextQueue = kept.concat(shuffle(newOnes))
    setSelectionQueue(nextQueue)
    if (!selected) {
      if (nextQueue.length > 0) setSelected(nextQueue[0])
    } else if (!poolIds.includes(selected)) {
      if (nextQueue.length > 0) setSelected(nextQueue[0])
      else setSelected(undefined)
    }
  }, [pool])

  // When selection cleared manually, pick next from queue
  useEffect(() => {
    if (!selected && selectionQueue.length > 0) {
      setSelected(selectionQueue[0])
    }
  }, [selected, selectionQueue])

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

  async function doExportPng() {
    const node = document.getElementById('tier-capture')
    if (!node) return
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${getPublicTemplate(id || '')?.id || 'tier'}-result.png`
      a.click()
      notify('PNG экспортирован')
    } catch (e) {
      console.warn('PNG export failed', e)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {new URLSearchParams(location.search).has('result')
          ? <Link to="/profile" className="back-link">Назад в профиль</Link>
          : <Link to="/public" className="back-link">Назад к публичным тир‑листам</Link>
        }
      </div>
      <h1>{getPublicTemplate(id || '')?.name ?? 'Публичный тир-лист'}</h1>
      <div className="tm-layout">
        <div>
          <div id="tier-capture">
            <TierGrid
              pool={isFromProfile ? [] : pool}
              tiers={tiers}
              onMove={onMove}
              selectedItemId={isFromProfile ? undefined : selected}
              onSelectItem={isFromProfile ? undefined : setSelected}
              onAssignClick={isFromProfile ? undefined : onAssignClick}
              showRowControls={false}
            />
          </div>
        </div>
        <aside className="tm-side">
          {!isFromProfile && (
            <>
              <h3 style={{ marginTop: 0 }}>Распределение</h3>
              {!selectedItem && pool.length > 0 && <p style={{ color: '#94a3b8' }}>Выберите элемент в пуле или в одном из уровней.</p>}
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
                  <div style={{ marginTop: 8 }}>
                    <button className="tm-tier-btn tm-skip-btn" onClick={onSkip}>Пропустить</button>
                  </div>
                </div>
              )}
            </>
          )}
          <hr className="tm-sep" />
          <h4 style={{ margin: '6px 0 8px', textAlign: 'center' }}>Результат</h4>
          <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
            {!isFromProfile && (
              <button className="tm-tier-btn" onClick={() => {
                const template = getPublicTemplate(id || '')
                if (!template) return
                const user = getCurrentUser()
                if (!user) { setNotice('Войдите или зарегистрируйтесь, чтобы сохранять результаты.'); return }
                if (pool.length > 0) { setIncompleteWarn('Не все элементы распределены. Сохранить результат как есть?'); return }
                setSaveTitle(template.name)
                setSaveOpen(true)
              }}>Сохранить результат</button>
            )}
            <button className="tm-tier-btn" onClick={async () => {
              if (!isFromProfile && pool.length > 0) { setExportWarn('Не все элементы распределены. Экспортировать результат как есть?'); return }
              await doExportPng()
            }}>Экспорт PNG</button>
          </div>
        </aside>
      </div>
      <Modal
        open={saveOpen}
        title="Сохранить результат"
        onClose={() => setSaveOpen(false)}
        footer={(
          <>
            <button className="tm-tier-btn" onClick={() => setSaveOpen(false)}>Отмена</button>
            <button className="tm-tier-btn" onClick={() => {
              const template = getPublicTemplate(id || '')
              if (!template) return
              const resultId = crypto.randomUUID()
              saveResult({ id: resultId, templateId: template.id, templateName: template.name, createdAt: Date.now(), tiers, title: saveTitle || undefined })
              setSaveOpen(false)
              notify('Сохранено в профиль')
            }}>Сохранить</button>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#cbd5e1' }}>Название</label>
          <input
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="Например: Мой топ сериалов"
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.06)', color: 'inherit' }}
          />
        </div>
      </Modal>
      {toast && (
        <div className="tw-toast" role="status">{toast}</div>
      )}
      <Modal
        open={!!notice}
        title="Требуется вход"
        onClose={() => setNotice(undefined)}
        footer={(<button className="tm-tier-btn" onClick={() => setNotice(undefined)}>ОК</button>)}
      >
        <p style={{ margin: 0 }}>{notice}</p>
      </Modal>
      <Modal
        open={!!exportWarn}
        title="Незавершённое распределение"
        onClose={() => setExportWarn(undefined)}
        footer={(
          <>
            <button className="tm-tier-btn" onClick={() => setExportWarn(undefined)}>Продолжить распределение</button>
            <button className="tm-tier-btn" onClick={async () => { setExportWarn(undefined); await doExportPng() }}>Экспортировать сейчас</button>
          </>
        )}
      >
        <p style={{ margin: 0 }}>{exportWarn}</p>
      </Modal>
      <Modal
        open={!!incompleteWarn}
        title="Незавершённое распределение"
        onClose={() => setIncompleteWarn(undefined)}
        footer={(
          <>
            <button className="tm-tier-btn" onClick={() => setIncompleteWarn(undefined)}>Продолжить распределение</button>
            <button className="tm-tier-btn" onClick={() => {
              const template = getPublicTemplate(id || '')
              if (!template) { setIncompleteWarn(undefined); return }
              setSaveTitle(template.name)
              setSaveOpen(true)
              setIncompleteWarn(undefined)
            }}>Сохранить сейчас</button>
          </>
        )}
      >
        <p style={{ margin: 0 }}>{incompleteWarn}</p>
      </Modal>
    </div>
  )
}


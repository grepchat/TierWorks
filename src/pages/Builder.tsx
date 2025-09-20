import { useEffect, useMemo, useRef, useState } from 'react'
import type { MediaItem, TierAssignment, TierId } from '../types'
import { TierGrid } from '../components/TierGrid'
import { createUserList, getTemplate, listTemplates } from '../storage'
import { UploadPanel } from '../components/UploadPanel'
import { Link, useLocation } from 'react-router-dom'
import { getPublicTemplate } from '../publicTemplates'
import { fetchTopTVFromTMDB } from '../tmdb'

const initialPool: MediaItem[] = []

const emptyTiers: TierAssignment = { S: [], A: [], B: [], C: [], D: [], U: [] }

export default function Builder() {
  const loc = useLocation()
  const [pool, setPool] = useState<MediaItem[]>(initialPool)
  const [tiers, setTiers] = useState<TierAssignment>(emptyTiers)
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([])
  const [selected, setSelected] = useState<string>('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [cover, setCover] = useState<string | undefined>()
  const [code, setCode] = useState<string>(() => Math.random().toString(36).slice(2, 8).toUpperCase())
  const [notice, setNotice] = useState<string | undefined>()
  const progressLoadedRef = useRef(false)

  useEffect(() => {
    const list = listTemplates().sort((a, b) => b.createdAt - a.createdAt)
    setTemplates(list.map(t => ({ id: t.id, name: t.name })))
  }, [])

  // Load saved builder progress (pool + tiers)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tierworks:builder:progress')
      if (!raw) return
      const data = JSON.parse(raw) as { pool?: MediaItem[]; tiers?: TierAssignment }
      if (data.pool && Array.isArray(data.pool)) setPool(data.pool)
      if (data.tiers) setTiers(data.tiers)
      progressLoadedRef.current = true
    } catch {}
  }, [])

  // Persist progress
  useEffect(() => {
    const snapshot = JSON.stringify({ pool, tiers })
    localStorage.setItem('tierworks:builder:progress', snapshot)
  }, [pool, tiers])

  useEffect(() => {
    const qp = new URLSearchParams(loc.search)
    const tplId = qp.get('tpl')
    if (tplId && !progressLoadedRef.current) {
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
      <div style={{ marginBottom: 8 }}>
        <Link to="/builder" className="back-link">Назад к параметрам</Link>
      </div>
      <h1>Конструктор</h1>
      <UploadPanel onItems={(items) => setPool(prev => [...prev, ...items])} />
      <TierGrid
        poolFirst
        showEmptyPoolHint
        dragFromPoolOnly
        editablePoolTitles
        onRenameItem={(id, title) => setPool(prev => prev.map(i => i.id === id ? { ...i, title } : i))}
        pool={pool}
        tiers={tiers}
        onMove={move}
        showRowControls
      />
    </div>
  )
}


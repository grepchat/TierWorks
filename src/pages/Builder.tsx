import { useEffect, useMemo, useState } from 'react'
import type { MediaItem, TierAssignment, TierId } from '../types'
import { TierGrid } from '../components/TierGrid'
import { createUserList, getTemplate, listTemplates } from '../storage'
import { UploadPanel } from '../components/UploadPanel'
import { useLocation } from 'react-router-dom'
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
      <UploadPanel onItems={(items) => setPool(prev => [...prev, ...items])} />
      <TierGrid pool={pool} tiers={tiers} onMove={move} showRowControls />
    </div>
  )
}


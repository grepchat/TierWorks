import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Dataset } from '../types'

type SharePayload = {
  t: string
  i: Dataset['items']
  r: Dataset['tiers']
  p?: Dataset['placements']
}

export function buildShareUrl(dataset: Dataset): string {
  const payload: SharePayload = { t: dataset.title, i: dataset.items, r: dataset.tiers, p: dataset.placements }
  const s = compressToEncodedURIComponent(JSON.stringify(payload))
  const url = new URL(window.location.href)
  url.searchParams.set('s', s)
  return url.toString()
}

export function loadSharedDataset(): Dataset | null {
  const s = new URL(window.location.href).searchParams.get('s')
  if (!s) return null
  try {
    const json = decompressFromEncodedURIComponent(s)
    if (!json) return null
    const parsed = JSON.parse(json) as SharePayload
    const now = new Date().toISOString()
    const ds: Dataset = {
      id: crypto.randomUUID(),
      ownerId: 'shared',
      title: parsed.t || 'Shared dataset',
      description: '',
      items: parsed.i || [],
      tiers: parsed.r || [],
      placements: parsed.p || {},
      createdAt: now,
      updatedAt: now,
      isPublished: false,
    }
    return ds
  } catch {
    return null
  }
}



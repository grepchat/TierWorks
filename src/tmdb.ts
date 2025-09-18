import type { MediaItem } from './types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500'

export async function fetchTopTVFromTMDB(apiKey: string, count = 50, language = 'ru-RU'): Promise<MediaItem[]> {
  if (!apiKey) throw new Error('TMDB API key is required')
  const perPage = 20
  const pages = Math.ceil(count / perPage)
  const results: any[] = []
  for (let page = 1; page <= pages; page++) {
    const url = `${TMDB_BASE}/tv/top_rated?api_key=${encodeURIComponent(apiKey)}&language=${encodeURIComponent(language)}&page=${page}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
    const json = await res.json()
    results.push(...(json.results ?? []))
  }
  const items: MediaItem[] = []
  for (const tv of results.slice(0, count)) {
    const id = `tmdb-${tv.id}`
    const name: string = tv.name || tv.original_name || `TV ${tv.id}`
    const poster: string | null = tv.poster_path ? `${TMDB_IMAGE}${tv.poster_path}` : null
    items.push({ id, title: name, imageUrl: poster ?? 'https://via.placeholder.com/160x160.png?text=No+Image' })
  }
  return items
}

export async function fetchPosterForTitle(apiKey: string, title: string, language = 'ru-RU'): Promise<string | null> {
  const url = `${TMDB_BASE}/search/tv?api_key=${encodeURIComponent(apiKey)}&language=${encodeURIComponent(language)}&query=${encodeURIComponent(title)}&page=1&include_adult=false`
  const res = await fetch(url)
  if (!res.ok) return null
  const json = await res.json()
  const first = (json.results ?? [])[0]
  if (!first || !first.poster_path) return null
  return `${TMDB_IMAGE}${first.poster_path}`
}

export async function resolvePostersForItems(apiKey: string, items: MediaItem[], language = 'ru-RU'): Promise<MediaItem[]> {
  const out: MediaItem[] = []
  for (const it of items) {
    if (it.imageUrl) { out.push(it); continue }
    try {
      const poster = await fetchPosterForTitle(apiKey, it.title, language)
      out.push({ ...it, imageUrl: poster ?? it.imageUrl })
    } catch {
      out.push(it)
    }
  }
  return out
}



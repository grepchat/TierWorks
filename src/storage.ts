import type { MediaItem } from './types'

export interface Template {
  id: string
  name: string
  items: MediaItem[]
  createdAt: number
}

const KEY = 'tierworks:templates'

function read(): Template[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Template[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(data: Template[]) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function saveTemplate(name: string, items: MediaItem[]): string {
  const list = read()
  const id = crypto.randomUUID()
  list.push({ id, name, items, createdAt: Date.now() })
  write(list)
  return id
}

export function listTemplates(): Pick<Template, 'id' | 'name' | 'createdAt'>[] {
  return read().map(t => ({ id: t.id, name: t.name, createdAt: t.createdAt }))
}

export function getTemplate(id: string): Template | undefined {
  return read().find(t => t.id === id)
}



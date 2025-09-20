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

// User-created tier list metadata
export interface UserListMeta {
  id: string
  visibility: 'public' | 'private'
  status: 'draft' | 'pending' | 'published' | 'private'
  name: string
  description: string
  coverDataUrl?: string
  code?: string
  createdAt: number
}

const KEY_USER_LISTS = 'tierworks:userlists'

function readUserLists(): UserListMeta[] {
  try {
    const raw = localStorage.getItem(KEY_USER_LISTS)
    if (!raw) return []
    const arr = JSON.parse(raw) as UserListMeta[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeUserLists(data: UserListMeta[]) {
  localStorage.setItem(KEY_USER_LISTS, JSON.stringify(data))
}

export function createUserList(meta: Omit<UserListMeta, 'id' | 'createdAt'>): string {
  const id = crypto.randomUUID()
  const list = readUserLists()
  list.unshift({ ...meta, id, createdAt: Date.now() })
  writeUserLists(list)
  return id
}

export function listUserLists(): UserListMeta[] { return readUserLists() }

// Saved Results
import type { SavedResult } from './types'

const KEY_RESULTS = 'tierworks:results'

function readResults(): SavedResult[] {
  try {
    const raw = localStorage.getItem(KEY_RESULTS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedResult[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeResults(data: SavedResult[]) {
  localStorage.setItem(KEY_RESULTS, JSON.stringify(data))
}

export function saveResult(result: SavedResult) {
  const list = readResults()
  const idx = list.findIndex(r => r.id === result.id)
  if (idx >= 0) list[idx] = result
  else list.unshift(result)
  writeResults(list)
}

export function listResults(): SavedResult[] {
  return readResults()
}

export function getResult(id: string): SavedResult | undefined {
  return readResults().find(r => r.id === id)
}

export function deleteResult(id: string) {
  const list = readResults().filter(r => r.id !== id)
  writeResults(list)
}

// Auth (mock)
export interface User {
  id: string
  name: string
  avatarUrl?: string
}

const KEY_USER = 'tierworks:user'

export function getCurrentUser(): User | undefined {
  try {
    const raw = localStorage.getItem(KEY_USER)
    return raw ? (JSON.parse(raw) as User) : undefined
  } catch {
    return undefined
  }
}

export function setCurrentUser(user: User) {
  localStorage.setItem(KEY_USER, JSON.stringify(user))
}

export function clearCurrentUser() {
  localStorage.removeItem(KEY_USER)
}

// Username registry (mock global uniqueness)
const KEY_USERNAMES = 'tierworks:usernames'

function readUsernames(): string[] {
  try {
    const raw = localStorage.getItem(KEY_USERNAMES)
    if (!raw) return []
    const arr = JSON.parse(raw) as string[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeUsernames(list: string[]) {
  localStorage.setItem(KEY_USERNAMES, JSON.stringify(list))
}

export function isUsernameTaken(name: string, except?: string): boolean {
  const n = name.trim().toLowerCase()
  const ex = (except || '').trim().toLowerCase()
  return readUsernames().some(u => u.toLowerCase() === n && n !== ex)
}

export function registerUsername(name: string, previous?: string) {
  const list = readUsernames()
  const norm = name.trim()
  const prev = previous?.trim()
  const filtered = prev ? list.filter(u => u.toLowerCase() !== prev.toLowerCase()) : list
  if (!filtered.some(u => u.toLowerCase() === norm.toLowerCase())) filtered.push(norm)
  writeUsernames(filtered)
}

export function deleteAccountData() {
  const user = getCurrentUser()
  if (user?.name) {
    const list = readUsernames().filter(u => u.toLowerCase() !== user.name.toLowerCase())
    writeUsernames(list)
  }
  localStorage.removeItem(KEY_USER)
  localStorage.removeItem(KEY_RESULTS)
  localStorage.removeItem(KEY)
}



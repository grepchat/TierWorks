import { openDB } from 'idb'
import type { Dataset } from '../types'

const DB_NAME = 'tierworks-db'
const STORE = 'datasets'

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    },
  })
}

export async function putLocalDataset(dataset: Dataset) {
  const db = await getDb()
  await db.put(STORE, dataset, dataset.id)
}

export async function getLocalDataset(id: string) {
  const db = await getDb()
  return db.get(STORE, id) as Promise<Dataset | undefined>
}

export async function listLocalDatasets() {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readonly')
  const store = tx.store
  const all: Dataset[] = []
  let cursor = await store.openCursor()
  while (cursor) {
    all.push(cursor.value as Dataset)
    cursor = await cursor.continue()
  }
  return all
}

export async function removeLocalDataset(id: string) {
  const db = await getDb()
  await db.delete(STORE, id)
}



import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import type { Dataset, DatasetItem, Tier } from '../types'

export function exportJson(dataset: Dataset) {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' })
  saveAs(blob, `${dataset.title || 'dataset'}.json`)
}

export function importJson(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Dataset
        resolve(parsed)
      } catch (e) { reject(e) }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function exportCsv(items: DatasetItem[]) {
  const csv = Papa.unparse(items.map(({ id, title, imageUrl, attributes }) => ({ id, title, imageUrl, ...attributes })))
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, 'items.csv')
}

export function importCsv(file: File): Promise<DatasetItem[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        const items: DatasetItem[] = rows.map((r) => ({
          id: r.id || crypto.randomUUID(),
          title: r.title || '',
          imageUrl: r.imageUrl || undefined,
          attributes: Object.fromEntries(Object.entries(r).filter(([k]) => !['id', 'title', 'imageUrl'].includes(String(k)))) as Record<string, number>,
        }))
        resolve(items)
      },
      error: reject,
    })
  })
}

export function defaultTiers(): Tier[] {
  return [
    { id: 'S', label: 'S', color: '#f59e0b' },
    { id: 'A', label: 'A', color: '#84cc16' },
    { id: 'B', label: 'B', color: '#22c55e' },
    { id: 'C', label: 'C', color: '#06b6d4' },
    { id: 'D', label: 'D', color: '#6366f1' },
  ]
}



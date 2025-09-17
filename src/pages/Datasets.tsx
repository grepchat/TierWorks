import { useEffect, useRef } from 'react'
import { useDatasets } from '../store/datasets'
import type { Dataset } from '../types'
import { importJson, importCsv, exportJson, exportCsv, defaultTiers } from '../lib/io'

export default function Datasets() {
  const fileRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)
  const { items, load, upsert, remove } = useDatasets()

  useEffect(() => { load() }, [load])

  const createEmpty = async () => {
    const ds: Dataset = {
      id: crypto.randomUUID(),
      ownerId: 'local',
      title: 'Новый датасет',
      description: '',
      items: [],
      tiers: defaultTiers(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
    }
    await upsert(ds)
  }

  const onImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const ds = await importJson(f)
    ds.id ||= crypto.randomUUID()
    ds.updatedAt = new Date().toISOString()
    await upsert(ds)
    e.target.value = ''
  }

  const onImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const itemsCsv = await importCsv(f)
    const ds: Dataset = {
      id: crypto.randomUUID(),
      ownerId: 'local',
      title: f.name.replace(/\.csv$/i, ''),
      items: itemsCsv,
      tiers: defaultTiers(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
      description: '',
    }
    await upsert(ds)
    e.target.value = ''
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-3">
        <button onClick={createEmpty} className="px-3 py-2 bg-indigo-600 rounded">Создать пустой</button>
        <button onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-slate-700 rounded">Импорт JSON</button>
        <button onClick={() => csvRef.current?.click()} className="px-3 py-2 bg-slate-700 rounded">Импорт CSV</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportJson} />
        <input ref={csvRef} type="file" accept="text/csv,.csv" className="hidden" onChange={onImportCsv} />
      </div>

      <ul className="space-y-2">
        {items.map((d) => (
          <li key={d.id} className="flex items-center justify-between bg-slate-800/60 rounded px-3 py-2">
            <div>
              <div className="font-medium">{d.title}</div>
              <div className="text-slate-400 text-sm">{new Date(d.updatedAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportJson(d)} className="px-2 py-1 bg-slate-700 rounded text-sm">Экспорт JSON</button>
              <button onClick={() => exportCsv(d.items)} className="px-2 py-1 bg-slate-700 rounded text-sm">Экспорт CSV</button>
              <button onClick={() => remove(d.id)} className="px-2 py-1 bg-red-600 rounded text-sm">Удалить</button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="text-slate-400">Пока нет датасетов</li>}
      </ul>
    </div>
  )
}



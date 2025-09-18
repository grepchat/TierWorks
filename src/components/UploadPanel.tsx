import { useRef, useState } from 'react'

interface UploadItem {
  id: string
  url: string
  name: string
}

export function UploadPanel({ onItems }: { onItems?: (items: { id: string; title: string; imageUrl: string }[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [items, setItems] = useState<UploadItem[]>([])

  function onSelectFiles(files: FileList | null) {
    if (!files) return
    const next: UploadItem[] = []
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      const name = file.name.replace(/\.[^.]+$/, '')
      next.push({ id: crypto.randomUUID(), url, name })
    })
    setItems(prev => [...prev, ...next])
    onItems?.(next.map(i => ({ id: i.id, title: i.name, imageUrl: i.url })))
  }

  return (
    <div className="upload-panel">
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="secondary" onClick={() => inputRef.current?.click()}>Выбрать файлы</button>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => onSelectFiles(e.target.files)} />
      </div>
      {items.length > 0 && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {items.map(i => (
            <div key={i.id} className="card">
              <img src={i.url} alt={i.name} />
              <input defaultValue={i.name} aria-label="Подпись" style={{ width: '100%', marginTop: 6 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


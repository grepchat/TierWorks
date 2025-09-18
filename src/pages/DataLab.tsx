import { useState } from 'react'
import type { MediaItem } from '../types'
import { UploadPanel } from '../components/UploadPanel'
import { saveTemplate } from '../storage'

export default function DataLab() {
  const [imported, setImported] = useState<MediaItem[]>([])
  const [name, setName] = useState<string>('Мой шаблон')
  return (
    <div>
      <h1>Импорт данных</h1>
      <p>Загрузи изображения и подписи (изображение + название).</p>
      <UploadPanel onItems={(items) => setImported(prev => [...prev, ...items])} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название шаблона" style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'inherit' }} />
        <button className="primary" disabled={imported.length === 0 || !name.trim()} onClick={() => {
          const id = saveTemplate(name.trim(), imported)
          alert('Шаблон сохранён')
        }}>Сохранить шаблон</button>
      </div>
      {imported.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h2>Предпросмотр ({imported.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {imported.map(i => (
              <div key={i.id} className="card">
                <img src={i.imageUrl} alt={i.title} />
                <div className="card-title">{i.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


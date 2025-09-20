import { useState } from 'react'
import { createUserList } from '../storage'
import { useNavigate } from 'react-router-dom'

export default function BuilderSetup() {
  const navigate = useNavigate()
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [cover, setCover] = useState<string | undefined>()
  const [coverName, setCoverName] = useState<string | undefined>()
  const [coverError, setCoverError] = useState<string | undefined>()
  const [code, setCode] = useState<string>(() => Math.random().toString(36).slice(2, 8).toUpperCase())
  // notice removed
  const [nameError, setNameError] = useState<string | undefined>()

  function onSubmit() {
    if (!name.trim()) { setNameError('Введите название'); return }
    createUserList({ visibility, status: visibility==='public' ? 'pending' : 'private', name: name.trim(), description: desc.trim(), coverDataUrl: cover, code: visibility==='private' ? code : undefined })
    setTimeout(() => navigate('/builder/compose'), 300)
  }

  return (
    <div>
      <h1>Параметры тир‑листа</h1>
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--panel)', marginBottom: 12 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Доступ</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <label><input type="radio" name="vis" checked={visibility==='public'} onChange={() => setVisibility('public')} /> Публичный (после модерации)</label>
              <label><input type="radio" name="vis" checked={visibility==='private'} onChange={() => setVisibility('private')} /> Приватный (по коду)</label>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Название</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(undefined) }}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: nameError ? '1px solid #ef4444' : '1px solid var(--border)',
                background: 'rgba(255,255,255,0.06)',
                color: 'inherit',
                boxSizing: 'border-box',
              }}
              aria-invalid={!!nameError}
            />
            {nameError && <div style={{ color: '#ef4444', marginTop: 6, fontSize: 12 }}>{nameError}</div>}
          </div>
          <div>
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Описание</label>
            <textarea
              value={desc}
              rows={3}
              onChange={(e) => setDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.06)',
                color: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Обложка (JPG/PNG, до 1 МБ, 1200×630)</label>
            <input type="file" accept="image/png,image/jpeg" onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setCoverName(file.name)
              if (file.size > 1024*1024) { setCoverError('Файл больше 1 МБ'); setCover(undefined); return }
              setCoverError(undefined)
              const reader = new FileReader()
              reader.onload = () => setCover(reader.result as string)
              reader.readAsDataURL(file)
            }} />
            {coverName && (
              <div style={{ marginTop: 6, color: '#cbd5e1' }}>
                {coverName} {coverError && <span style={{ color: '#ef4444' }}>— {coverError}</span>}
              </div>
            )}
            {cover && <div style={{ marginTop: 8 }}><img src={cover} alt="cover" style={{ width: 240, height: 'auto', borderRadius: 8, border: '1px solid var(--border)' }} /></div>}
          </div>
          {visibility==='private' && (
            <div>
              <label style={{ fontSize: 14, color: '#cbd5e1' }}>Код доступа (поделитесь им с друзьями)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={code} onChange={(e)=>setCode(e.target.value.toUpperCase())} style={{ width: 140, letterSpacing: 2 }} />
                <button className="tm-tier-btn" onClick={()=> setCode(Math.random().toString(36).slice(2,8).toUpperCase())}>Сгенерировать</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="tm-tier-btn" onClick={onSubmit}>Подтвердить</button>
          </div>
          {/* notice removed */}
        </div>
      </div>
    </div>
  )
}



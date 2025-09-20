import { Link } from 'react-router-dom'
import { getCurrentUser } from '../storage'
import { listResults } from '../storage'
import { listTemplates } from '../storage'
import { getPublicTemplate } from '../publicTemplates'
import { Modal } from '../components/Modal'
import { useState } from 'react'
import { deleteResult, setCurrentUser, isUsernameTaken, registerUsername, deleteAccountData } from '../storage'

export default function Profile() {
  const user = getCurrentUser()
  const results = listResults()
  const myTemplates = listTemplates()

  if (!user) {
    return (
      <div>
        <h1>Профиль</h1>
        <p style={{ color: '#94a3b8' }}>Вы не авторизованы. Войдите через меню аватара в шапке.</p>
      </div>
    )
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string | undefined>()
  const [editOpen, setEditOpen] = useState(false)
  const [newName, setNewName] = useState(user.name)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(user.avatarUrl)
  const [nameError, setNameError] = useState<string | undefined>()
  const [fileError, setFileError] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | undefined>()

  return (
    <div>
      <section className="profile-header">
        <div className="profile-meta">
          <div className="profile-title">
            <img src={user.avatarUrl || '/public/logo.svg'} alt={user.name} className="tw-avatar" />
            <span>{user.name}</span>
          </div>
          <div className="profile-stats">
            <span className="badge">Результаты: {results.length}</span>
            <span className="badge">Шаблоны: {myTemplates.length}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="tm-tier-btn" onClick={() => { setNewName(user.name); setAvatarDataUrl(user.avatarUrl); setNameError(undefined); setEditOpen(true) }}>Редактировать</button>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: '8px 0' }}>Мои шаблоны</h2>
        {myTemplates.length === 0 && <p style={{ color: '#94a3b8' }}>Шаблонов ещё нет — создайте в «Конструкторе».</p>}
        <div className="tw-grid" style={{ marginTop: 12 }}>
          {myTemplates.map(t => (
            <div key={t.id} className="tw-card">
              <h3 style={{ margin: '4px 0' }}>{t.name}</h3>
              <p style={{ margin: '4px 0', color: '#94a3b8' }}>Дата: {new Date(t.createdAt).toLocaleString()}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <Link to={`/builder`} className="back-link">Открыть в конструкторе</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Modal
        open={editOpen}
        title="Редактирование профиля"
        onClose={() => setEditOpen(false)}
        footer={(
          <>
            <button className="tm-tier-btn" onClick={() => setEditOpen(false)}>Отмена</button>
            <button className="tm-tier-btn" onClick={() => {
              const trimmed = (newName || '').trim()
              if (!trimmed) { setNameError('Введите имя'); return }
              if (isUsernameTaken(trimmed, user.name)) { setNotice('Имя пользователя занято. Выберите другое.'); return }
              const updated = { ...user, name: trimmed, avatarUrl: avatarDataUrl }
              setCurrentUser(updated)
              registerUsername(trimmed, user.name)
              location.reload()
            }}>Сохранить</button>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 14, color: '#cbd5e1' }}>Имя</label>
            <input value={newName} onChange={(e) => { setNewName(e.target.value); setNameError(undefined) }} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.06)', color: 'inherit' }} />
            {nameError && <div style={{ color: '#ef4444', marginTop: 6, fontSize: 12 }}>{nameError}</div>}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input className="tw-file" type="file" accept="image/png,image/jpeg" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 1024 * 1024) { setFileError('Файл больше 1 МБ. Выберите файл до 1 МБ.'); return }
                const reader = new FileReader()
                reader.onload = () => setAvatarDataUrl(reader.result as string)
                reader.readAsDataURL(file)
              }} />
              <label style={{ fontSize: 14, color: '#cbd5e1' }}>Аватар (JPG/PNG, до 1 МБ, 256×256)</label>
            </div>
            {avatarDataUrl && <div style={{ marginTop: 8 }}><img src={avatarDataUrl} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid var(--border)' }} /></div>}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <button className="tm-tier-btn" style={{ borderColor: '#ef4444', color: '#fecaca' }} onClick={() => {
              if (confirm('Удалить аккаунт и все данные?')) {
                deleteAccountData()
                location.href = '/#/'
              }
            }}>Удалить аккаунт</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={!!notice}
        title="Сообщение"
        onClose={() => setNotice(undefined)}
        footer={(<button className="tm-tier-btn" onClick={() => setNotice(undefined)}>ОК</button>)}
      >
        <p style={{ margin: 0 }}>{notice}</p>
      </Modal>
      <Modal
        open={!!fileError}
        title="Слишком большой файл"
        onClose={() => setFileError(undefined)}
        footer={(
          <button className="tm-tier-btn" onClick={() => setFileError(undefined)}>ОК</button>
        )}
      >
        <p style={{ margin: 0 }}>{fileError}</p>
      </Modal>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ margin: '8px 0' }}>Сохранённые результаты</h2>
        {results.length === 0 && <p style={{ color: '#94a3b8' }}>Пока пусто — оцените публичный набор и сохраните результат.</p>}
        <div className="tw-grid" style={{ marginTop: 12 }}>
          {results.map(r => (
            <div key={r.id} className="tw-card result-card">
              <div className="result-row">
                <img
                  src={getPublicTemplate(r.templateId)?.coverUrl || '/public/logo.svg'}
                  alt="cover"
                  className="thumb-sm"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/public/logo.svg' }}
                />
                <div>
                  <h3 className="result-title">{r.title || r.templateName}</h3>
                  <p className="result-meta">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="result-actions">
                <Link to={`/public/${r.templateId}?result=${r.id}`} className="open-link">Открыть</Link>
                <button className="tm-tier-btn delete-btn" onClick={() => { setToDelete(r.id); setConfirmOpen(true) }}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Modal
        open={confirmOpen}
        title="Удалить результат?"
        onClose={() => setConfirmOpen(false)}
        footer={(
          <>
            <button className="tm-tier-btn" onClick={() => setConfirmOpen(false)}>Отмена</button>
            <button className="tm-tier-btn" onClick={() => {
              if (toDelete) {
                deleteResult(toDelete)
                // Force refresh by reloading list from storage
                location.reload()
              }
            }}>Удалить</button>
          </>
        )}
      >
        <p style={{ margin: 0, color: '#94a3b8' }}>Действие необратимо. Результат будет удалён из профиля.</p>
      </Modal>
    </div>
  )
}



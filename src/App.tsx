import React from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Modal } from './components/Modal'
import { clearCurrentUser, getCurrentUser, setCurrentUser, type User } from './storage'
import Builder from './pages/Builder'
import BuilderSetup from './pages/BuilderSetup'
import PublicTemplates from './pages/Public'
import PublicDetail from './pages/PublicDetail'
import Profile from './pages/Profile'

function App() {
  const location = useLocation()
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportEmail, setSupportEmail] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportError, setSupportError] = useState<string | undefined>()
  const [supportTab, setSupportTab] = useState<'support' | 'faq' | 'rules'>('support')
  useEffect(() => {
    const open = () => setSupportOpen(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('tw:open-support' as any, open as unknown as EventListener)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.removeEventListener('tw:open-support' as any, open as unknown as EventListener)
    }
  }, [])
  return (
    <div className="app-root">
      <header className="tw-header" style={{ position: 'relative' }}>
        <Link to="/" className="tw-brand"><img src="/public/logo.svg" alt="TierWorks" className="brand-mark" /> TierWorks</Link>
        <nav className="tw-nav" style={{ alignItems: 'center' }}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : undefined}>Главная</NavLink>
          <NavLink to="/public" className={({ isActive }) => isActive ? 'active public-link' : 'public-link'}>Публичные тир-листы</NavLink>
          <NavLink to="/builder" className={({ isActive }) => isActive ? 'active' : undefined}>Конструктор</NavLink>
          <AuthArea />
        </nav>
      </header>

      <main className="tw-main">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<BuilderSetup />} />
          <Route path="/builder/compose" element={<Builder />} />
          <Route path="/public" element={<PublicTemplates />} />
          <Route path="/public/:id" element={<PublicDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      <footer className="tw-footer"><span>© {new Date().getFullYear()} TierWorks</span><button className="footer-help" onClick={() => setSupportOpen(true)} aria-label="Справка" title="Справка">Справка</button></footer>

      <Modal
        open={supportOpen}
        title="Справка"
        onClose={() => setSupportOpen(false)}
        footer={(
          <>
            <button className="tm-tier-btn" onClick={() => setSupportOpen(false)}>Закрыть</button>
            {supportTab === 'support' && (
              <button className="tm-tier-btn" onClick={() => {
                const body = supportMessage.trim()
                if (!body) { setSupportError('Напишите сообщение.'); return }
                const email = (supportEmail || '').trim()
                const mailto = `mailto:contact@tierworks.app?subject=${encodeURIComponent('TierWorks Support')}&body=${encodeURIComponent(body + (email ? `\n\nОт: ${email}` : ''))}`
                window.location.href = mailto
                setSupportOpen(false)
                setSupportMessage('')
                setSupportEmail('')
                setSupportError(undefined)
              }}>Отправить</button>
            )}
          </>
        )}
      >
        <div>
          <div className="tw-tabs">
            <button className={supportTab === 'support' ? 'tw-tab active' : 'tw-tab'} onClick={() => setSupportTab('support')}>Поддержка</button>
            <button className={supportTab === 'faq' ? 'tw-tab active' : 'tw-tab'} onClick={() => setSupportTab('faq')}>FAQ</button>
            <button className={supportTab === 'rules' ? 'tw-tab active' : 'tw-tab'} onClick={() => setSupportTab('rules')}>Правила</button>
          </div>
          {supportTab === 'support' && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <label style={{ fontSize: 14, color: '#cbd5e1' }}>Ваш email (необязательно)</label>
                <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.06)', color: 'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize: 14, color: '#cbd5e1' }}>Сообщение</label>
                <textarea value={supportMessage} onChange={(e) => { setSupportMessage(e.target.value); setSupportError(undefined) }} rows={4} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.06)', color: 'inherit', resize: 'vertical' }} />
                {supportError && <div style={{ color: '#ef4444', marginTop: 6, fontSize: 12 }}>{supportError}</div>}
              </div>
            </div>
          )}
          {supportTab === 'faq' && (
            <div className="tw-doc">
              <h3>Частые вопросы</h3>
              <p><strong>Как сохранить результат?</strong> На странице набора справа нажмите «Сохранить результат», введите название и подтвердите.</p>
              <p><strong>Как экспортировать PNG?</strong> Нажмите «Экспорт PNG» в правой панели.</p>
              <p><strong>Постеры не отображаются?</strong> Проверьте, что JPG лежит в правильной папке и имя совпадает с id. См. раздел Requirements.md.</p>
              <p><strong>Как поделиться результатом?</strong> Откройте сохранённый результат из профиля и скачайте PNG либо пришлите ссылку с параметром result.</p>
            </div>
          )}
          {supportTab === 'rules' && (
            <div className="tw-doc">
              <h3>Что такое тир‑лист</h3>
              <p>Тир‑лист — это способ ранжировать элементы по уровням (S/A/B/C/D/Без оценки). Вы группируете карточки по качеству или предпочтению и получаете наглядную картину, которой можно поделиться.</p>
              <h3>Правила</h3>
              <ul>
                <li>Имена файлов изображений — kebab‑case, формат JPG, размер до 1 МБ.</li>
                <li>Обложки разделов — в папке <code>public/covers/</code>, контент — в тематических папках <code>public/posters-*/</code>.</li>
                <li>Загружаемые изображения не должны нарушать авторские права и законы.</li>
                <li>Имена пользователей — уникальные, без оскорбительных выражений и спама.</li>
                <li>Публичные результаты — без запрещённого контента, дискриминации и персональных данных третьих лиц.</li>
              </ul>
              <p>Нарушения могут привести к скрытию материалов или блокировке профиля.</p>
              <h3>Политика конфиденциальности</h3>
              <p>Мы храним минимальные данные в вашем браузере (localStorage): имя профиля, аватар (data URL), сохранённые результаты. Ничто из этого не отправляется на сервер автоматически. Отправка сообщений в поддержку происходит через ваш почтовый клиент (mailto).</p>
              <h3>Пользовательское соглашение</h3>
              <p>Используя сайт, вы подтверждаете законность контента, который добавляете, и согласны не нарушать права третьих лиц. Администрация оставляет за собой право удалять материалы и ограничивать доступ при нарушениях.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

function Home() {
  return (
    <>
      <section className="tw-hero">
        <h1>Создавай уникальные тир‑листы</h1>
        <p>Разрабатывай свои тир‑листы и исследуй публичные подборки сообщества</p>
      </section>

      <section className="tw-grid tw-home-grid">
        <Link to="/public" className="tw-card-link">
          <div className="tw-card">
            <h2>Публичные тир-листы</h2>
            <p>Подборки и лучшие работы сообщества.</p>
          </div>
        </Link>
        <Link to="/builder" className="tw-card-link">
          <div className="tw-card">
            <h2>Создать свой тир-лист</h2>
            <p>Переход в конструктор для создания своего тир-листа.</p>
          </div>
        </Link>
      </section>
    </>
  )
}

// pages moved to separate files

export default App

function AuthArea() {
  const [user, setUser] = useState<User | undefined>(() => getCurrentUser())
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  if (!user) {
    return (
      <div className="tw-auth">
        <button className="tm-tier-btn" onClick={() => {
          const u = { id: crypto.randomUUID(), name: 'Гость', avatarUrl: '' }
          setCurrentUser(u)
          setUser(u)
        }}>Зарегистрироваться</button>
        <button className="tm-tier-btn" onClick={() => {
          const u = { id: crypto.randomUUID(), name: 'Гость', avatarUrl: '' }
          setCurrentUser(u)
          setUser(u)
        }}>Войти</button>
      </div>
    )
  }

  return (
    <div className="tw-auth" ref={ref}>
      <img src={user.avatarUrl || '/public/logo.svg'} alt={user.name} className="tw-avatar" onClick={() => setOpen(v => !v)} />
      {open && (
        <div className="tw-menu">
          <div style={{ padding: '6px 8px', color: '#94a3b8' }}>Вы вошли как {user.name}</div>
          <Link to="/profile">Профиль</Link>
          <button onClick={() => { clearCurrentUser(); setUser(undefined); setOpen(false); window.location.href = '/#/' }}>Выйти</button>
        </div>
      )}
    </div>
  )
}

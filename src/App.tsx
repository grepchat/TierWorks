import React from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { clearCurrentUser, getCurrentUser, setCurrentUser, type User } from './storage'
import Builder from './pages/Builder'
import PublicTemplates from './pages/Public'
import PublicDetail from './pages/PublicDetail'
import Profile from './pages/Profile'

function App() {
  const location = useLocation()
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
          <Route path="/builder" element={<Builder />} />
          <Route path="/public" element={<PublicTemplates />} />
          <Route path="/public/:id" element={<PublicDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      <footer className="tw-footer">© {new Date().getFullYear()} TierWorks</footer>
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
            <p>Перейди в конструктор и начни с нуля или с импорта.</p>
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

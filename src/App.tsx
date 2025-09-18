import React from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Builder from './pages/Builder'
import PublicTemplates from './pages/Public'
import PublicDetail from './pages/PublicDetail'

function App() {
  const location = useLocation()
  return (
    <div className="app-root">
      <header className="tw-header">
        <Link to="/" className="tw-brand"><img src="/public/logo.svg" alt="TierWorks" className="brand-mark" /> TierWorks</Link>
        <nav className="tw-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : undefined}>Главная</NavLink>
          <NavLink to="/public" className={({ isActive }) => isActive ? 'active public-link' : 'public-link'}>Публичные тир-листы</NavLink>
          <NavLink to="/builder" className={({ isActive }) => isActive ? 'active' : undefined}>Конструктор</NavLink>
        </nav>
      </header>

      <main className="tw-main">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/public" element={<PublicTemplates />} />
          <Route path="/public/:id" element={<PublicDetail />} />
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

      <section className="tw-grid">
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

import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Datasets from './pages/Datasets'
import Builder from './pages/Builder'
import Gallery from './pages/Gallery'

export default function App() {
  return (
    <div className="min-h-full">
      <header className="border-b border-slate-800">
        <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6">
          <Link to="/" className="font-semibold text-indigo-400">TierWorks</Link>
          <Link to="/datasets" className="text-slate-300 hover:text-white">Датасеты</Link>
          <Link to="/builder" className="text-slate-300 hover:text-white">Конструктор</Link>
          <Link to="/gallery" className="text-slate-300 hover:text-white">Галерея</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>
    </div>
  )
}

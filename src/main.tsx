import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { supabase } from './lib/supabase.ts'
import { useAuth } from './store/auth.ts'

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuth.getState().set({ session: data.session ?? null, user: data.session?.user ?? null })
  })
  supabase.auth.onAuthStateChange((_e, session) => {
    useAuth.getState().set({ session: session ?? null, user: session?.user ?? null })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

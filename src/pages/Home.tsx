import { supabase } from "../lib/supabase"
import { useAuth } from "../store/auth"

export default function Home() {
  const user = useAuth((s) => s.user)

  const signIn = async (provider: "github" | "google") => {
    if (!supabase) return alert('Supabase не настроен')
    await supabase.auth.signInWithOAuth({ provider })
  }
  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Добро пожаловать в TierWorks</h1>
      <div className="text-slate-300">Статус: {user ? `вошли как ${user.email ?? user.id}` : "гость"}</div>
      <div className="flex gap-3">
        {!user && (
          <button onClick={() => signIn("github")} className="px-3 py-2 bg-indigo-600 rounded">Войти через GitHub</button>
        )}
        {user && <button onClick={signOut} className="px-3 py-2 bg-slate-800 rounded">Выйти</button>}
      </div>
    </div>
  )
}



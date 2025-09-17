import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'

type AuthState = {
  user: User | null
  session: Session | null
  set: (s: Partial<AuthState>) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  set,
}))



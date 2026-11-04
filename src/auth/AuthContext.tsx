import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, setUnauthorizedHandler, tokenStore } from '../api/client'
import type { User } from '../api/types'
import { isTelegramWebApp, telegramWebApp } from '../lib/telegram'

interface AuthState {
  user: User | null
  loading: boolean
  /** Telegram ichida avtomatik kirish bo'lmadi — sababi (masalan hisob ulanmagan) */
  telegramError: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => !!tokenStore.get() || isTelegramWebApp())
  const [telegramError, setTelegramError] = useState<string | null>(null)

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    qc.clear()
  }, [qc])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    // Bot ichida (WebApp): Telegram imzosi bilan parolsiz kiramiz
    if (isTelegramWebApp()) {
      telegramWebApp()
        .then((app) => {
          if (!app?.initData)
            throw new Error('Bu tugma eskirgan. Botga /start yuboring, so‘ng «✍️ Ish yozish» tugmasini bosing — forma o‘zi ochiladi.')
          return api.post<{ token: string; user: User }>('/auth/telegram', { initData: app.initData })
        })
        .then((res) => {
          tokenStore.set(res.token)
          setUser(res.user)
        })
        .catch((e: Error) => setTelegramError(e.message))
        .finally(() => setLoading(false))
      return
    }
    if (!tokenStore.get()) return
    api
      .get<User>('/auth/me')
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false))
  }, [logout])

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { username, password })
    tokenStore.set(res.token)
    setUser(res.user)
  }, [])

  const value = useMemo(() => ({ user, loading, telegramError, login, logout }), [user, loading, telegramError, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return ctx
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser } from '@/types'
import { loginUser } from '@/db'
import { setToken, getToken } from '@/api/client'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)
const SESSION_KEY = 'canvasgo_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem(SESSION_KEY)
      const token = getToken()
      if (saved && token) {
        try {
          // Optimistically restore from localStorage first (fast)
          setUser(JSON.parse(saved))
          // Then verify token is still valid with server
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!res.ok) {
            // Token expired or invalid — clear session
            localStorage.removeItem(SESSION_KEY)
            setToken(null)
            setUser(null)
          } else {
            // Update user info from server
            const freshUser = await res.json()
            const authUser = { id: freshUser.id, name: freshUser.name, email: freshUser.email, role: freshUser.role }
            setUser(authUser)
            localStorage.setItem(SESSION_KEY, JSON.stringify(authUser))
          }
        } catch {
          // Network error — keep local session (offline support)
        }
      }
      setLoading(false)
    }
    restore()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await loginUser(email, password)
    if (!result) return false
    const authUser: AuthUser = { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }
    setUser(authUser)
    setToken(result.token)
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser))
    return true
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

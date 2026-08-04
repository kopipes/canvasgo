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
    // Restore session from localStorage
    const saved = localStorage.getItem(SESSION_KEY)
    const token = getToken()
    if (saved && token) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem(SESSION_KEY)
        setToken(null)
      }
    }
    setLoading(false)
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

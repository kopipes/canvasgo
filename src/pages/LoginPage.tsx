import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email.trim(), password)
    setLoading(false)
    if (!ok) {
      setError('Email atau password salah.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-primary-600 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-primary-600 font-black text-2xl">CG</span>
          </div>
          <h1 className="text-white text-3xl font-black">CanvasGo</h1>
          <p className="text-primary-200 text-sm mt-1">Sales Canvassing App</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <p className="text-center font-medium text-gray-500">Demo accounts:</p>
            <p>Admin: admin@canvasgo.app / admin123</p>
            <p>Manager: manager@canvasgo.app / manager123</p>
            <p>Rep: rep@canvasgo.app / rep123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { changePassword } from '@/db'
import { ChevronLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import UserBadge from '@/components/UserBadge'

export default function ChangePasswordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPw.trim().length < 6) { setError('Password baru minimal 6 karakter'); return }
    if (newPw.trim() !== confirmPw.trim()) { setError('Konfirmasi password tidak cocok'); return }
    setSaving(true)
    const result = await changePassword(oldPw, newPw)
    setSaving(false)
    if (!result.ok) { setError(result.error ?? 'Gagal mengganti password'); return }
    setSuccess(true)
    setOldPw(''); setNewPw(''); setConfirmPw('')
  }

  const backTo = user?.role === 'rep' ? '/rep' : user?.role === 'manager' ? '/manager' : '/admin/users'

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(backTo)} className="p-1 -ml-1 text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Ganti Password</h1>
        </div>
        <UserBadge />
      </div>

      <div className="px-4 pt-6 space-y-4">
        {/* User info */}
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {user?.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <KeyRound size={16} />
            Password berhasil diganti!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old password */}
          <div>
            <label className="label">Password Lama</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="••••••••"
                value={oldPw}
                onChange={e => setOldPw(e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
              <button type="button" onClick={() => setShowOld(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="label">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Minimal 6 karakter"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="label">Konfirmasi Password Baru</label>
            <input
              type="password"
              className="input-field"
              placeholder="Ulangi password baru"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

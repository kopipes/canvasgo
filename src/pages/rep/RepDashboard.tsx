import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getDashboardStats } from '@/db'
import { PlusCircle, TrendingUp, Clock, CheckCircle, AlertCircle, X } from 'lucide-react'
import UserBadge from '@/components/UserBadge'

interface Stats {
  total: number
  interested: number
  follow_up: number
  closed: number
  this_week: number
}

export default function RepDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ total: 0, interested: 0, follow_up: 0, closed: 0, this_week: 0 })
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (user) getDashboardStats(user.id, dateFrom || undefined, dateTo || undefined).then(setStats)
  }, [user, dateFrom, dateTo])

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const hasFilter = dateFrom || dateTo

  return (
    <div className="pb-4">
      <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">{today}</p>
          <h1 className="text-2xl font-black text-gray-900">Halo, {user?.name.split(' ')[0]} 👋</h1>
        </div>
        <UserBadge />
      </div>

      {/* Quick action */}
      <button
        onClick={() => navigate('/rep/new')}
        className="btn-primary flex items-center justify-center gap-2 mb-5"
      >
        <PlusCircle size={20} />
        Tambah Prospek Baru
      </button>

      {/* Date filter */}
      <div className="card mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Tanggal</p>
          {hasFilter && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              className="flex items-center gap-1 text-xs text-red-500 font-medium">
              <X size={12} /> Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Dari</label>
            <input type="date" className="input-field py-2 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Sampai</label>
            <input type="date" className="input-field py-2 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ringkasan Kamu</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-primary-600" />
            <span className="text-xs text-gray-500">Total Visit</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-yellow-500" />
            <span className="text-xs text-gray-500">Last 7 Days</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.this_week}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Tertarik</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.interested}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">Follow Up</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.follow_up}</p>
        </div>
      </div>
      </div>
    </div>
  )
}

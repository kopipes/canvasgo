import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getDashboardStats } from '@/db'
import { PlusCircle, TrendingUp, Clock, CheckCircle, AlertCircle, X, Users, MapPin } from 'lucide-react'
import UserBadge from '@/components/UserBadge'

interface Stats {
  total: number
  total_leads: number
  total_visited: number
  interested: number
  follow_up: number
  closed: number
  this_week: number
}

export default function RepDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ total: 0, total_leads: 0, total_visited: 0, interested: 0, follow_up: 0, closed: 0, this_week: 0 })
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (user) getDashboardStats(user.id, dateFrom || undefined, dateTo || undefined).then(setStats)
  }, [user, dateFrom, dateTo])

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const hasFilter = dateFrom || dateTo

  const StatCard = ({ icon: Icon, iconClass, label, value }: { icon: React.ElementType, iconClass: string, label: string, value: number }) => (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className={iconClass} />
        <span className="text-xs text-gray-500 leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  )

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
      <button onClick={() => navigate('/rep/new')} className="btn-primary flex items-center justify-center gap-2 mb-5">
        <PlusCircle size={20} />
        Tambah Prospek Baru
      </button>

      {/* Date filter */}
      <div className="card mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Tanggal</p>
          {hasFilter && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }} className="flex items-center gap-1 text-xs text-red-500 font-medium">
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

      {/* Stats grid — 3 columns */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ringkasan Kamu</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard icon={Users} iconClass="text-sky-500" label="Total Leads" value={stats.total_leads} />
        <StatCard icon={MapPin} iconClass="text-primary-600" label="Total Visit" value={stats.total_visited} />
        <StatCard icon={Clock} iconClass="text-yellow-500" label="Last 7 Days" value={stats.this_week} />
        <StatCard icon={AlertCircle} iconClass="text-green-500" label="Tertarik" value={stats.interested} />
        <StatCard icon={CheckCircle} iconClass="text-blue-500" label="In Progress" value={stats.follow_up} />
        <StatCard icon={TrendingUp} iconClass="text-purple-500" label="Close Deal" value={stats.closed} />
      </div>
      </div>
    </div>
  )
}

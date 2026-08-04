import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getDashboardStats, getUsers } from '@/db'
import { User } from '@/types'
import { TrendingUp, Clock, CheckCircle, Users, AlertCircle, X } from 'lucide-react'
import UserBadge from '@/components/UserBadge'

interface Stats {
  total: number
  interested: number
  follow_up: number
  closed: number
  this_week: number
}

const EMPTY_STATS: Stats = { total: 0, interested: 0, follow_up: 0, closed: 0, this_week: 0 }

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [reps, setReps] = useState<User[]>([])
  const [repStats, setRepStats] = useState<Record<number, Stats>>({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadStats = (from: string, to: string) => {
    getDashboardStats(undefined, from || undefined, to || undefined).then(setStats)
    getUsers().then(async (users) => {
      const repList = users.filter((u) => u.role === 'rep')
      setReps(repList)
      const statsMap: Record<number, Stats> = {}
      for (const rep of repList) {
        statsMap[rep.id] = await getDashboardStats(rep.id, from || undefined, to || undefined)
      }
      setRepStats(statsMap)
    })
  }

  useEffect(() => { loadStats(dateFrom, dateTo) }, [user, dateFrom, dateTo])

  const hasFilter = dateFrom || dateTo
  const clearFilter = () => { setDateFrom(''); setDateTo('') }

  return (
    <div className="pb-4">
      <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <UserBadge />
      </div>
      <p className="text-sm text-gray-500 mb-4">Ringkasan aktivitas tim</p>

      {/* Date filter */}
      <div className="card mb-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Tanggal</p>
          {hasFilter && (
            <button onClick={clearFilter} className="flex items-center gap-1 text-xs text-red-500 font-medium">
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

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
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
            <span className="text-xs text-gray-500">Minggu Ini</span>
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
            <span className="text-xs text-gray-500">Closing</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.closed}</p>
        </div>
      </div>

      {/* Per rep */}
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Per Sales Rep</h2>
      </div>
      <div className="space-y-3">
        {reps.length === 0 && <p className="text-gray-400 text-sm">Tidak ada sales rep.</p>}
        {reps.map((rep) => {
          const s = repStats[rep.id] ?? EMPTY_STATS
          return (
            <div key={rep.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">{rep.name}</p>
                <span className="text-xs text-gray-400">{s.this_week} minggu ini</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-black text-gray-900">{s.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-xl font-black text-green-600">{s.interested}</p>
                  <p className="text-xs text-gray-500">Tertarik</p>
                </div>
                <div>
                  <p className="text-xl font-black text-yellow-500">{s.follow_up}</p>
                  <p className="text-xs text-gray-500">Follow Up</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}

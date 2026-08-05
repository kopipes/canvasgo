import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getDashboardStats, getUsers, getFollowUpSummary, FollowUpSummaryItem } from '@/db'
import { User } from '@/types'
import { TrendingUp, Clock, CheckCircle, Users, AlertCircle, X, CalendarCheck, ChevronRight, MapPin } from 'lucide-react'
import UserBadge from '@/components/UserBadge'
import { STATUS_LABELS, STATUS_COLORS, formatDate } from '@/utils'

interface Stats {
  total: number
  total_leads: number
  total_visited: number
  interested: number
  follow_up: number
  closed: number
  this_week: number
}

const EMPTY_STATS: Stats = { total: 0, total_leads: 0, total_visited: 0, interested: 0, follow_up: 0, closed: 0, this_week: 0 }

const StatCard = ({ icon: Icon, iconClass, label, value }: { icon: React.ElementType, iconClass: string, label: string, value: number }) => (
  <div className="card p-3">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={13} className={iconClass} />
      <span className="text-xs text-gray-500 leading-tight">{label}</span>
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
  </div>
)

export default function ManagerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [reps, setReps] = useState<User[]>([])
  const [repStats, setRepStats] = useState<Record<number, Stats>>({})
  const [followUps, setFollowUps] = useState<FollowUpSummaryItem[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadStats = (from: string, to: string) => {
    getDashboardStats(undefined, from || undefined, to || undefined).then(setStats)
    getFollowUpSummary(undefined, from || undefined, to || undefined).then(setFollowUps)
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

      {/* Overall stats — 3 columns */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatCard icon={Users} iconClass="text-sky-500" label="Total Leads" value={stats.total_leads} />
        <StatCard icon={MapPin} iconClass="text-primary-600" label="Total Visit" value={stats.total_visited} />
        <StatCard icon={Clock} iconClass="text-yellow-500" label="Last 7 Days" value={stats.this_week} />
        <StatCard icon={AlertCircle} iconClass="text-green-500" label="Tertarik" value={stats.interested} />
        <StatCard icon={CheckCircle} iconClass="text-blue-500" label="Follow Up" value={stats.follow_up} />
        <StatCard icon={TrendingUp} iconClass="text-purple-500" label="Closing" value={stats.closed} />
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

      {/* Follow Up History */}
      {followUps.length > 0 && (
        <div className="px-4 mt-2 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck size={16} className="text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Riwayat Follow Up</h2>
            <span className="badge bg-primary-100 text-primary-700">{followUps.length}</span>
          </div>
          <div className="space-y-2">
            {followUps.map((v) => (
              <button
                key={v.id}
                className="card w-full text-left"
                onClick={() => navigate(`/manager/visit/${v.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">{v.location_name}</p>
                      {v.interested ? (
                        <span className="badge bg-green-100 text-green-700 text-xs">Tertarik</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{v.pic_name} · {v.user_name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`badge text-xs ${STATUS_COLORS[v.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[v.status as keyof typeof STATUS_LABELS] ?? v.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Kunjungan ke-<span className="font-bold text-primary-600">{v.activity_count}</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        Terakhir: {formatDate(v.last_activity_date)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

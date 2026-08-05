import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getVisits } from '@/db'
import { Visit, VisitStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, ALL_VISIT_STATUSES, formatDateTime } from '@/utils'
import { Search, ChevronRight, MapPin, Filter, X } from 'lucide-react'
import UserBadge from '@/components/UserBadge'

export default function MyActivitiesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [visits, setVisits] = useState<Visit[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<VisitStatus | ''>('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getVisits({
      userId: user.id,
      search,
      status: filterStatus || undefined,
      dateFrom: filterFrom || undefined,
      dateTo: filterTo || undefined,
    }).then((v) => {
      setVisits(v)
      setLoading(false)
    })
  }, [user, search, filterStatus, filterFrom, filterTo, location.key])

  const activeFilters = [filterStatus, filterFrom, filterTo].filter(Boolean).length
  const clearFilters = () => { setFilterStatus(''); setFilterFrom(''); setFilterTo('') }

  return (
    <div className="pb-4">
      <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-gray-900">Aktivitas Saya</h1>
        <UserBadge />
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            className="input-field pl-10"
            placeholder="Cari perusahaan, PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors flex-shrink-0 ${
            activeFilters > 0 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          <Filter size={15} />
          {activeFilters > 0 ? `(${activeFilters})` : 'Filter'}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card mb-3 space-y-3">
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value as VisitStatus | '')}>
              <option value="">Semua Status</option>
              {ALL_VISIT_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Dari</label>
              <input type="date" className="input-field py-2 text-sm" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            </div>
            <div>
              <label className="label">Sampai</label>
              <input type="date" className="input-field py-2 text-sm" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 font-medium">
              <X size={14} /> Reset Filter
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat...</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada data</p>
          <p className="text-sm mt-1">Tambah prospek pertamamu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{visits.length} data ditemukan</p>
          {visits.map((v) => (
            <button
              key={v.id}
              className="card w-full text-left flex items-center gap-3"
              onClick={() => navigate(`/rep/visit/${v.id}`)}
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={22} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{v.location_name}</p>
                <p className="text-sm text-gray-500 truncate">{v.pic_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${STATUS_COLORS[v.status]}`}>{STATUS_LABELS[v.status]}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(v.created_at)}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

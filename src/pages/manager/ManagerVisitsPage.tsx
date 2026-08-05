import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVisits, getUsers } from '@/db'
import { Visit, User, VisitStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, ALL_VISIT_STATUSES, formatDateTime } from '@/utils'
import { Search, ChevronRight, MapPin, Filter, ChevronLeft } from 'lucide-react'
import UserBadge from '@/components/UserBadge'
import PhotoModal from '@/components/PhotoModal'

const PAGE_SIZE = 10

export default function ManagerVisitsPage() {
  const navigate = useNavigate()
  const [visits, setVisits] = useState<Visit[]>([])
  const [reps, setReps] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRep, setFilterRep] = useState<number | ''>('')
  const [filterStatus, setFilterStatus] = useState<VisitStatus | ''>('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [modalPhoto, setModalPhoto] = useState<string | null>(null)

  useEffect(() => {
    getUsers().then((u) => setReps(u.filter((x) => x.role === 'rep')))
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    getVisits({
      userId: filterRep || undefined,
      status: filterStatus || undefined,
      dateFrom: filterFrom || undefined,
      dateTo: filterTo || undefined,
      search: search || undefined,
    }).then((v) => {
      setVisits(v)
      setLoading(false)
    })
  }, [search, filterRep, filterStatus, filterFrom, filterTo])

  const activeFilters = [filterRep, filterStatus, filterFrom, filterTo].filter(Boolean).length
  const totalPages = Math.max(1, Math.ceil(visits.length / PAGE_SIZE))
  const paged = visits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="pb-4">
      <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-gray-900">Semua Visit</h1>
        <div className="flex items-center gap-2">
          <UserBadge />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              activeFilters > 0 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            <Filter size={15} />
            Filter{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          className="input-field pl-10"
          placeholder="Cari lokasi, PIC, catatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card mb-3 space-y-3">
          <div>
            <label className="label">Sales Rep</label>
            <select className="input-field" value={filterRep} onChange={(e) => setFilterRep(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Semua Rep</option>
              {reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as VisitStatus | '')}>
              <option value="">Semua Status</option>
              {ALL_VISIT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Dari Tanggal</label>
              <input className="input-field" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
            </div>
            <div>
              <label className="label">Sampai</label>
              <input className="input-field" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setFilterRep(''); setFilterStatus(''); setFilterFrom(''); setFilterTo('') }}
            className="text-sm text-red-500 font-medium"
          >
            Reset Filter
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat...</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Tidak ada kunjungan</p>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{visits.length} kunjungan ditemukan</p>
            <p className="text-sm text-gray-500">Hal. {page}/{totalPages}</p>
          </div>
          {paged.map((v) => (
            <button
              key={v.id}
              className="card w-full text-left flex items-center gap-3"
              onClick={() => navigate(`/manager/visit/${v.id}`)}
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={22} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{v.location_name}</p>
                <p className="text-sm text-gray-500 truncate">{v.pic_name} · {v.user_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${STATUS_COLORS[v.status]}`}>{STATUS_LABELS[v.status]}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(v.created_at)}</span>
                </div>
                {(() => { try { const p: string[] = JSON.parse(v.products); return p.length > 0 ? (
                  <p className="text-xs text-primary-600 truncate mt-0.5">{p.join(' · ')}</p>
                ) : null } catch { return null } })()}
              </div>
              <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 text-gray-600"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold border transition-colors ${
                    p === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 text-gray-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
      </div>
      {modalPhoto && <PhotoModal src={modalPhoto} onClose={() => setModalPhoto(null)} />}
    </div>
  )
}

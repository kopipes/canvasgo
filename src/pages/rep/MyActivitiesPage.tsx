import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getVisits } from '@/db'
import { Visit } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, formatDateTime } from '@/utils'
import { Search, ChevronRight, MapPin } from 'lucide-react'
import UserBadge from '@/components/UserBadge'
import PhotoModal from '@/components/PhotoModal'

export default function MyActivitiesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [visits, setVisits] = useState<Visit[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalPhoto, setModalPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getVisits({ userId: user.id, search }).then((v) => {
      setVisits(v)
      setLoading(false)
    })
  }, [user, search])

  return (
    <div className="pb-4">
      <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-gray-900">Aktivitas Saya</h1>
        <UserBadge />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          className="input-field pl-10"
          placeholder="Cari lokasi, PIC, catatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat...</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada kunjungan</p>
          <p className="text-sm mt-1">Catat kunjungan pertamamu!</p>
        </div>
      ) : (
        <div className="space-y-3">
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
      {modalPhoto && <PhotoModal src={modalPhoto} onClose={() => setModalPhoto(null)} />}
    </div>
  )
}

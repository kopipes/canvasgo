import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getVisitById, deleteVisit } from '@/db'
import { Visit } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, formatDateTime, formatDate } from '@/utils'
import { ChevronLeft, Trash2, Phone, Mail, Globe, MapPin, Calendar } from 'lucide-react'

export default function VisitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) getVisitById(Number(id)).then(setVisit)
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Hapus kunjungan ini?')) return
    setDeleting(true)
    await deleteVisit(Number(id))
    navigate(-1)
  }

  if (!visit) return <div className="flex items-center justify-center h-40 text-gray-400">Memuat...</div>

  const parsedProducts: string[] = (() => {
    try { return JSON.parse(visit.products) } catch { return [] }
  })()

  const canDelete = user?.role === 'admin' || user?.role === 'manager' || user?.id === visit.user_id

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{visit.location_name}</h1>
        </div>
        {canDelete && (
          <button onClick={handleDelete} disabled={deleting} className="p-2 text-red-500">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Photo */}
      {visit.photo && (
        <img src={visit.photo} alt="Foto kunjungan" className="w-full h-56 object-cover" />
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Status + date */}
        <div className="flex items-center justify-between">
          <span className={`badge text-sm px-3 py-1 ${STATUS_COLORS[visit.status]}`}>{STATUS_LABELS[visit.status]}</span>
          <span className="text-sm text-gray-400">{formatDateTime(visit.created_at)}</span>
        </div>

        {/* Rep info (manager view) */}
        {user?.role !== 'rep' && visit.user_name && (
          <div className="card bg-primary-50 border-primary-100">
            <p className="text-xs text-primary-600 font-medium">Sales Rep</p>
            <p className="font-semibold text-gray-900">{visit.user_name}</p>
          </div>
        )}

        {/* PIC */}
        <div className="card space-y-2">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Kontak PIC</h2>
          <p className="font-bold text-gray-900 text-lg">{visit.pic_name}</p>
          {visit.pic_phone && (
            <a href={`tel:${visit.pic_phone}`} className="flex items-center gap-2 text-primary-600">
              <Phone size={16} /><span>{visit.pic_phone}</span>
            </a>
          )}
          {visit.pic_email && (
            <a href={`mailto:${visit.pic_email}`} className="flex items-center gap-2 text-primary-600">
              <Mail size={16} /><span className="break-all">{visit.pic_email}</span>
            </a>
          )}
          {visit.website && (
            <a href={visit.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600">
              <Globe size={16} /><span className="break-all">{visit.website}</span>
            </a>
          )}
        </div>

        {/* Products */}
        {parsedProducts.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2">Produk Ditawarkan</h2>
            <div className="flex flex-wrap gap-2">
              {parsedProducts.map((p) => (
                <span key={p} className="badge bg-primary-100 text-primary-700 px-3 py-1">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Existing system */}
        {visit.existing_system && (
          <div className="card">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-1">Sistem Eksisting</h2>
            <p className="text-gray-900">{visit.existing_system}</p>
          </div>
        )}

        {/* Follow up */}
        {visit.next_follow_up && (
          <div className="card flex items-center gap-3">
            <Calendar size={20} className="text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Follow Up</p>
              <p className="font-semibold text-gray-900">{formatDate(visit.next_follow_up)}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {visit.notes && (
          <div className="card">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-1">Catatan</h2>
            <p className="text-gray-900 whitespace-pre-wrap">{visit.notes}</p>
          </div>
        )}

        {/* GPS */}
        {visit.lat && visit.lng && (
          <a
            href={`https://maps.google.com/?q=${visit.lat},${visit.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-3 text-primary-600"
          >
            <MapPin size={20} className="flex-shrink-0" />
            <span className="text-sm">Lihat di Google Maps</span>
          </a>
        )}
      </div>
    </div>
  )
}

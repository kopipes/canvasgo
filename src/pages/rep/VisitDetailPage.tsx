import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getVisitById, deleteVisit, updateVisit, getProducts } from '@/db'
import { Visit, Product, VisitStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, VISIT_STATUSES, formatDateTime, formatDate, compressImage } from '@/utils'
import { ChevronLeft, Trash2, Phone, Mail, Globe, MapPin, Calendar, Pencil, Check, X, Camera } from 'lucide-react'
import CanvassingActivities from '@/components/CanvassingActivities'
import PhotoModal from '@/components/PhotoModal'

export default function VisitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [modalPhoto, setModalPhoto] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Visit> & { selectedProducts: string[] }>({
    selectedProducts: []
  })

  useEffect(() => {
    if (id) getVisitById(Number(id)).then(setVisit)
    getProducts(true).then(setProducts)
  }, [id])

  const canEdit = user?.role === 'admin' || (visit ? user?.id === visit.user_id : false)
  const canDelete = user?.role === 'admin' || (visit ? user?.id === visit.user_id : false)

  const startEdit = () => {
    if (!visit) return
    const parsed: string[] = (() => { try { return JSON.parse(visit.products) } catch { return [] } })()
    setForm({
      location_name: visit.location_name,
      pic_name: visit.pic_name,
      pic_phone: visit.pic_phone,
      pic_email: visit.pic_email,
      existing_system: visit.existing_system,
      website: visit.website,
      status: visit.status,
      next_follow_up: visit.next_follow_up,
      notes: visit.notes,
      photo: visit.photo,
      selectedProducts: parsed,
    })
    setEditing(true)
  }

  const handleDelete = async () => {
    if (!confirm('Hapus kunjungan ini?')) return
    setDeleting(true)
    await deleteVisit(Number(id))
    navigate(-1)
  }

  const handleSave = async () => {
    if (!visit || !form.location_name?.trim() || !form.pic_name?.trim()) return
    setSaving(true)
    await updateVisit(visit.id, {
      location_name: form.location_name.trim(),
      pic_name: form.pic_name!.trim(),
      pic_phone: form.pic_phone ?? '',
      pic_email: form.pic_email ?? '',
      existing_system: form.existing_system ?? '',
      website: form.website ?? '',
      status: form.status as VisitStatus,
      next_follow_up: form.next_follow_up ?? '',
      notes: form.notes ?? '',
      photo: form.photo ?? '',
      products: JSON.stringify(form.selectedProducts),
    })
    const updated = await getVisitById(visit.id)
    setVisit(updated)
    setSaving(false)
    setEditing(false)
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file)
      setForm(f => ({ ...f, photo: compressed }))
    } catch { /* ignore */ }
  }

  const toggleProduct = (name: string) => {
    setForm(f => ({
      ...f,
      selectedProducts: f.selectedProducts!.includes(name)
        ? f.selectedProducts!.filter(p => p !== name)
        : [...f.selectedProducts!, name]
    }))
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  if (!visit) return <div className="flex items-center justify-center h-40 text-gray-400">Memuat...</div>

  const parsedProducts: string[] = (() => { try { return JSON.parse(visit.products) } catch { return [] } })()

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { setEditing(false); navigate(-1) }} className="p-1 -ml-1 text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {editing ? 'Edit Kunjungan' : visit.location_name}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {!editing && canEdit && (
            <button onClick={startEdit} className="p-2 text-primary-600">
              <Pencil size={20} />
            </button>
          )}
          {editing && (
            <>
              <button onClick={handleSave} disabled={saving} className="p-2 text-green-600">
                <Check size={22} />
              </button>
              <button onClick={() => setEditing(false)} className="p-2 text-gray-400">
                <X size={22} />
              </button>
            </>
          )}
          {!editing && canDelete && (
            <button onClick={handleDelete} disabled={deleting} className="p-2 text-red-500">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── VIEW MODE ── */}
      {!editing && (
        <>
          {visit.photo && (
            <img src={visit.photo} alt="Foto kunjungan" className="w-full h-56 object-cover cursor-pointer" onClick={() => setModalPhoto(visit.photo)} />
          )}
          <div className="px-4 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`badge text-sm px-3 py-1 ${STATUS_COLORS[visit.status]}`}>{STATUS_LABELS[visit.status]}</span>
              <span className="text-sm text-gray-400">{formatDateTime(visit.created_at)}</span>
            </div>
            {user?.role !== 'rep' && visit.user_name && (
              <div className="card bg-primary-50 border-primary-100">
                <p className="text-xs text-primary-600 font-medium">Sales Rep</p>
                <p className="font-semibold text-gray-900">{visit.user_name}</p>
              </div>
            )}
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
            {parsedProducts.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2">Produk Ditawarkan</h2>
                <div className="flex flex-wrap gap-2">
                  {parsedProducts.map(p => (
                    <span key={p} className="badge bg-primary-100 text-primary-700 px-3 py-1">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {visit.existing_system && (
              <div className="card">
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-1">Sistem Eksisting</h2>
                <p className="text-gray-900">{visit.existing_system}</p>
              </div>
            )}
            {visit.next_follow_up && (
              <div className="card flex items-center gap-3">
                <Calendar size={20} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Follow Up</p>
                  <p className="font-semibold text-gray-900">{formatDate(visit.next_follow_up)}</p>
                </div>
              </div>
            )}
            {visit.notes && (
              <div className="card">
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-1">Catatan</h2>
                <p className="text-gray-900 whitespace-pre-wrap">{visit.notes}</p>
              </div>
            )}

            {/* Canvassing Activities */}
            <CanvassingActivities visitId={visit.id} visitOwnerId={visit.user_id} />

            {visit.lat && visit.lng && (
              <a href={`https://maps.google.com/?q=${visit.lat},${visit.lng}`} target="_blank" rel="noopener noreferrer"
                className="card flex items-center gap-3 text-primary-600">
                <MapPin size={20} className="flex-shrink-0" />
                <span className="text-sm">Lihat di Google Maps</span>
              </a>
            )}
          </div>
        </>
      )}

      {/* ── EDIT MODE ── */}
      {editing && (
        <div className="px-4 pt-4 space-y-4">
          {/* Photo */}
          <div>
            {form.photo ? (
              <div className="relative">
                <img src={form.photo} alt="" className="w-full h-48 object-cover rounded-2xl" />
                <button type="button" onClick={() => set('photo', '')}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="w-full h-36 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50 cursor-pointer">
                <Camera size={28} />
                <span className="text-sm">Ganti Foto</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
              </label>
            )}
          </div>

          <div>
            <label className="label">Nama Lokasi <span className="text-red-500">*</span></label>
            <input className="input-field" value={form.location_name ?? ''} onChange={e => set('location_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Nama PIC <span className="text-red-500">*</span></label>
            <input className="input-field" value={form.pic_name ?? ''} onChange={e => set('pic_name', e.target.value)} />
          </div>
          <div>
            <label className="label">No. HP PIC</label>
            <input className="input-field" type="tel" value={form.pic_phone ?? ''} onChange={e => set('pic_phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Email PIC</label>
            <input className="input-field" type="email" value={form.pic_email ?? ''} onChange={e => set('pic_email', e.target.value)} />
          </div>

          {products.length > 0 && (
            <div>
              <label className="label">Produk Ditawarkan</label>
              <div className="flex flex-wrap gap-2">
                {products.map(p => (
                  <button key={p.id} type="button" onClick={() => toggleProduct(p.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      form.selectedProducts!.includes(p.name)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">Sistem Eksisting</label>
            <input className="input-field" value={form.existing_system ?? ''} onChange={e => set('existing_system', e.target.value)} />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input-field" type="url" value={form.website ?? ''} onChange={e => set('website', e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={form.status ?? 'follow_up'} onChange={e => set('status', e.target.value)}>
              {VISIT_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          {(form.status === 'follow_up' || form.status === 'propose') && (
            <div>
              <label className="label">Jadwal Follow Up</label>
              <input className="input-field" type="date" value={form.next_follow_up ?? ''} onChange={e => set('next_follow_up', e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Catatan</label>
            <textarea className="input-field resize-none" rows={3} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      )}

      {/* Photo modal */}
      {modalPhoto && <PhotoModal src={modalPhoto} onClose={() => setModalPhoto(null)} />}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getActivities, createActivity, updateActivity, deleteActivity } from '@/db'
import { CanvassingActivity, VisitStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, VISIT_STATUSES, formatDateTime, compressImage } from '@/utils'
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Camera } from 'lucide-react'
import PhotoModal from '@/components/PhotoModal'

interface Props {
  visitId: number
  visitOwnerId: number
}

export default function CanvassingActivities({ visitId, visitOwnerId }: Props) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<CanvassingActivity[]>([])
  const [expanded, setExpanded] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [modalPhoto, setModalPhoto] = useState<string | null>(null)

  const emptyForm = { tanggal: new Date().toISOString().slice(0, 10), catatan: '', status: '' as VisitStatus | '', photo: '' }
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)

  const reload = () => getActivities(visitId).then(setActivities)

  useEffect(() => { reload() }, [visitId])

  const canEdit = (a: CanvassingActivity) =>
    user?.role === 'admin' || user?.id === a.user_id

  const canAdd = user?.role === 'admin' || user?.id === visitOwnerId

  const handlePhoto = async (file: File, target: 'add' | 'edit') => {
    try {
      const photo = await compressImage(file)
      if (target === 'add') setForm(f => ({ ...f, photo }))
      else setEditForm(f => ({ ...f, photo }))
    } catch {
      alert('Gagal memuat foto.')
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.catatan.trim() || !user) return
    setSaving(true)
    await createActivity({
      visit_id: visitId,
      user_id: user.id,
      tanggal: form.tanggal,
      catatan: form.catatan.trim(),
      status: form.status,
      photo: form.photo,
    })
    setForm(emptyForm)
    setShowAdd(false)
    setSaving(false)
    reload()
  }

  const handleUpdate = async (id: number) => {
    if (!editForm.catatan.trim()) return
    setSaving(true)
    await updateActivity(id, editForm.catatan.trim(), editForm.tanggal, editForm.status, editForm.photo)
    setEditId(null)
    setSaving(false)
    reload()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus aktivitas ini?')) return
    await deleteActivity(id)
    reload()
  }

  return (
    <div className="card">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Aktivitas Canvassing
          </h2>
          <span className="badge bg-primary-100 text-primary-700">{activities.length}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Add button */}
          {canAdd && !showAdd && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 py-1"
            >
              <Plus size={16} />
              Tambah Aktivitas
            </button>
          )}

          {/* Add form */}
          {showAdd && (
            <form onSubmit={handleAdd} className="bg-primary-50 rounded-xl p-3 space-y-2 border border-primary-100">
              <div>
                <label className="label">Tanggal</label>
                <input
                  className="input-field py-2"
                  type="date"
                  value={form.tanggal}
                  onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Catatan Aktivitas</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Isi aktivitas kunjungan, hasil diskusi, dll..."
                  value={form.catatan}
                  onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Foto (opsional)</label>
                {form.photo ? (
                  <div className="relative">
                    <img src={form.photo} alt="Foto aktivitas" className="w-full h-36 rounded-xl object-cover" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, photo: '' }))}
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 cursor-pointer">
                    <Camera size={18} />
                    Tambah Foto
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => { const file = e.target.files?.[0]; if (file) handlePhoto(file, 'add') }} />
                  </label>
                )}
              </div>
              <div>
                <label className="label">Update Status (opsional)</label>
                <select
                  className="input-field py-2"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as VisitStatus | '' }))}
                >
                  <option value="">-- Tidak ada perubahan status --</option>
                  {VISIT_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary py-2 flex-1 text-sm">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => { setShowAdd(false); setForm(emptyForm) }}
                  className="btn-secondary py-2 flex-1 text-sm">
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Activity list */}
          {activities.length === 0 && !showAdd && (
            <p className="text-sm text-gray-400 py-2">Belum ada aktivitas dicatat.</p>
          )}

          {activities.map(a => (
            <div key={a.id} className="border-l-2 border-primary-200 pl-3 py-1">
              {editId === a.id ? (
                <div className="space-y-2">
                  <input
                    className="input-field py-2"
                    type="date"
                    value={editForm.tanggal}
                    onChange={e => setEditForm(f => ({ ...f, tanggal: e.target.value }))}
                  />
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    value={editForm.catatan}
                    onChange={e => setEditForm(f => ({ ...f, catatan: e.target.value }))}
                    autoFocus
                  />
                  <div>
                    <label className="label">Foto (opsional)</label>
                    {editForm.photo ? (
                      <div className="relative">
                        <img src={editForm.photo} alt="Foto aktivitas" className="w-full h-36 rounded-xl object-cover" />
                        <button type="button" onClick={() => setEditForm(f => ({ ...f, photo: '' }))}
                          className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 cursor-pointer">
                        <Camera size={18} />
                        Tambah Foto
                        <input type="file" accept="image/*" capture="environment" className="hidden"
                          onChange={e => { const file = e.target.files?.[0]; if (file) handlePhoto(file, 'edit') }} />
                      </label>
                    )}
                  </div>
                  <select
                    className="input-field py-2"
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value as VisitStatus | '' }))}
                  >
                    <option value="">-- Tidak ada perubahan status --</option>
                    {VISIT_STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(a.id)} disabled={saving}
                      className="btn-primary py-2 flex-1 text-sm">
                      <Check size={14} className="inline mr-1" />Simpan
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="btn-secondary py-2 flex-1 text-sm">
                      <X size={14} className="inline mr-1" />Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-primary-700">
                          {new Date(a.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {a.status && (
                          <span className={`badge text-xs ${STATUS_COLORS[a.status as VisitStatus]}`}>
                            {STATUS_LABELS[a.status as VisitStatus]}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{a.user_name}</span>
                      </div>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{a.catatan}</p>
                      {a.photo && (
                        <img src={a.photo} alt="Foto aktivitas" className="mt-2 w-full max-h-48 rounded-xl object-cover cursor-pointer"
                          onClick={() => setModalPhoto(a.photo)} />
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(a.created_at)}</p>
                    </div>
                    {canEdit(a) && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditId(a.id); setEditForm({ tanggal: a.tanggal, catatan: a.catatan, status: a.status, photo: a.photo ?? '' }) }}
                          className="text-gray-400 p-1"
                        >
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-400 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {modalPhoto && <PhotoModal src={modalPhoto} onClose={() => setModalPhoto(null)} />}
    </div>
  )
}

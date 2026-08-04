import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createVisit, getProducts } from '@/db'
import { Product, VisitStatus } from '@/types'
import { VISIT_STATUSES, STATUS_LABELS, compressImage } from '@/utils'
import { Camera, X, ChevronLeft, MapPin } from 'lucide-react'

export default function NewVisitPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [locating, setLocating] = useState(false)

  const [form, setForm] = useState({
    location_name: '',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    existing_system: '',
    website: '',
    status: 'follow_up' as VisitStatus,
    next_follow_up: '',
    notes: '',
    selectedProducts: [] as string[],
    photo: '',
    lat: null as number | null,
    lng: null as number | null,
  })

  useEffect(() => {
    getProducts(true).then(setProducts)
  }, [])

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const toggleProduct = (name: string) => {
    setForm((f) => ({
      ...f,
      selectedProducts: f.selectedProducts.includes(name)
        ? f.selectedProducts.filter((p) => p !== name)
        : [...f.selectedProducts, name],
    }))
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file)
      set('photo', compressed)
    } catch {
      alert('Gagal memuat foto.')
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('lat', pos.coords.latitude)
        set('lng', pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!form.location_name.trim() || !form.pic_name.trim()) return
    setSaving(true)
    try {
      await createVisit({
        user_id: user.id,
        location_name: form.location_name.trim(),
        pic_name: form.pic_name.trim(),
        pic_phone: form.pic_phone.trim(),
        pic_email: form.pic_email.trim(),
        products: JSON.stringify(form.selectedProducts),
        existing_system: form.existing_system.trim(),
        website: form.website.trim(),
        status: form.status,
        next_follow_up: form.next_follow_up,
        notes: form.notes.trim(),
        photo: form.photo,
        lat: form.lat,
        lng: form.lng,
      })
      navigate('/rep/activities', { replace: true })
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Catat Kunjungan</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Photo */}
        <div>
          {form.photo ? (
            <div className="relative">
              <img src={form.photo} alt="Foto kunjungan" className="w-full h-48 object-cover rounded-2xl" />
              <button
                type="button"
                onClick={() => set('photo', '')}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50"
            >
              <Camera size={32} />
              <span className="text-sm font-medium">Tambah Foto</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Location */}
        <div>
          <label className="label">Nama Lokasi / Toko <span className="text-red-500">*</span></label>
          <input className="input-field" placeholder="cth. Apollo Wu Artisan" value={form.location_name} onChange={(e) => set('location_name', e.target.value)} required />
        </div>

        {/* PIC */}
        <div>
          <label className="label">Nama PIC <span className="text-red-500">*</span></label>
          <input className="input-field" placeholder="cth. Ibu Stephany" value={form.pic_name} onChange={(e) => set('pic_name', e.target.value)} required />
        </div>
        <div>
          <label className="label">No. HP PIC</label>
          <input className="input-field" type="tel" placeholder="08xxxxxxxxxx" value={form.pic_phone} onChange={(e) => set('pic_phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Email PIC</label>
          <input className="input-field" type="email" placeholder="email@perusahaan.com" value={form.pic_email} onChange={(e) => set('pic_email', e.target.value)} />
        </div>

        {/* Products */}
        {products.length > 0 && (
          <div>
            <label className="label">Produk yang Ditawarkan</label>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.selectedProducts.includes(p.name)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing system */}
        <div>
          <label className="label">Sistem yang Sudah Dipakai</label>
          <input className="input-field" placeholder="cth. Chope, Moka, dll." value={form.existing_system} onChange={(e) => set('existing_system', e.target.value)} />
        </div>

        {/* Website */}
        <div>
          <label className="label">Website</label>
          <input className="input-field" type="url" placeholder="https://..." value={form.website} onChange={(e) => set('website', e.target.value)} />
        </div>

        {/* Status */}
        <div>
          <label className="label">Status Kunjungan <span className="text-red-500">*</span></label>
          <select className="input-field" value={form.status} onChange={(e) => set('status', e.target.value as VisitStatus)}>
            {VISIT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Next follow up */}
        {(form.status === 'follow_up' || form.status === 'interested') && (
          <div>
            <label className="label">Jadwal Follow Up</label>
            <input className="input-field" type="date" value={form.next_follow_up} onChange={(e) => set('next_follow_up', e.target.value)} />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="label">Catatan</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="cth. Diminta kirim Company Profile dahulu ke email."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        {/* GPS */}
        <div>
          <button type="button" onClick={getLocation} className="btn-secondary flex items-center justify-center gap-2">
            <MapPin size={18} />
            {locating ? 'Mencari lokasi...' : form.lat ? `GPS: ${form.lat.toFixed(4)}, ${form.lng?.toFixed(4)}` : 'Tandai Lokasi GPS (opsional)'}
          </button>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Kunjungan'}
        </button>
      </form>
    </div>
  )
}

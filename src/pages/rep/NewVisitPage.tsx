import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createVisit } from '@/db'
import { LeadSource, LEAD_SOURCES, LEAD_SOURCE_LABELS } from '@/types'
import { ChevronLeft, MapPin } from 'lucide-react'
import ProductSelector, { encodeProducts, ProductEntry } from '@/components/ProductSelector'

export default function NewVisitPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [saving, setSaving] = useState(false)
  const [locating, setLocating] = useState(false)

  const [form, setForm] = useState({
    lead_source: '' as LeadSource | '',
    location_name: '',
    address: '',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    existing_system: '',
    website: '',
    interested: 0,
    notes: '',
    selectedProducts: {} as ProductEntry,
    lat: null as number | null,
    lng: null as number | null,
  })

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

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
        location_name: form.location_name.trim(),
        address: form.address.trim(),
        lead_source: form.lead_source,
        pic_name: form.pic_name.trim(),
        pic_phone: form.pic_phone.trim(),
        pic_email: form.pic_email.trim(),
        products: encodeProducts(form.selectedProducts),
        existing_system: form.existing_system.trim(),
        website: form.website.trim(),
        status: 'new',
        interested: form.interested,
        next_follow_up: '',
        notes: form.notes.trim(),
        photo: '',
        lat: form.lat,
        lng: form.lng,
      })
      navigate(user.role === 'admin' || user.role === 'manager' ? '/manager/visits' : '/rep/activities', { replace: true })
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
        <div>
          <h1 className="text-lg font-bold text-gray-900">Tambah Prospek</h1>
          <p className="text-xs text-gray-400">Data awal sebelum kunjungan pertama</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">

        {/* Leads berasal dari */}
        <div>
          <label className="label">Leads Berasal Dari</label>
          <div className="flex flex-wrap gap-2">
            {LEAD_SOURCES.map((s) => (
              <button key={s} type="button" onClick={() => set('lead_source', form.lead_source === s ? '' : s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.lead_source === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}>
                {LEAD_SOURCE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Perusahaan */}
        <div>
          <label className="label">Perusahaan <span className="text-red-500">*</span></label>
          <input className="input-field" placeholder="cth. Apollo Wu Artisan" value={form.location_name} onChange={(e) => set('location_name', e.target.value)} required />
        </div>

        {/* Alamat */}
        <div>
          <label className="label">Alamat</label>
          <textarea className="input-field resize-none" rows={2} placeholder="cth. Jl. Sudirman No. 1, Jakarta" value={form.address} onChange={(e) => set('address', e.target.value)} />
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
        <div>
          <label className="label">Produk yang Ditawarkan</label>
          <ProductSelector
            value={form.selectedProducts}
            onChange={(val) => set('selectedProducts', val)}
          />
        </div>

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

        {/* Notes */}
        <div>
          <label className="label">Catatan</label>
          <textarea className="input-field resize-none" rows={3}
            placeholder="cth. Diminta kirim Company Profile dahulu ke email."
            value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        {/* GPS */}
        <div>
          <button type="button" onClick={getLocation} className="btn-secondary flex items-center justify-center gap-2">
            <MapPin size={18} />
            {locating ? 'Mencari lokasi...' : form.lat ? `GPS: ${form.lat.toFixed(4)}, ${form.lng?.toFixed(4)}` : 'Tandai Lokasi GPS (opsional)'}
          </button>
        </div>

        {/* Tertarik — paling bawah */}
        <button type="button" onClick={() => set('interested', form.interested ? 0 : 1)}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl2 border-2 transition-all ${
            form.interested ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500'
          }`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            form.interested ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {form.interested ? <span className="text-white text-xs font-bold">✓</span> : null}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">Tertarik</p>
            <p className="text-xs opacity-70">Prospek tertarik dengan produk kita</p>
          </div>
        </button>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Prospek'}
        </button>
      </form>
    </div>
  )
}

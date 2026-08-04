import { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '@/db'
import { User, Role } from '@/types'
import { Plus, Pencil, Trash2, Check, X, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import UserBadge from '@/components/UserBadge'

const ROLES: { value: Role; label: string }[] = [
  { value: 'rep', label: 'Sales Rep' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

interface UserForm {
  name: string
  email: string
  password: string
  role: Role
}

const EMPTY_FORM: UserForm = { name: '', email: '', password: '', role: 'rep' }

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<UserForm>(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<UserForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const reload = () => getUsers().then((u) => { setUsers(u); setLoading(false) })
  useEffect(() => { reload() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return
    setSaving(true)
    await createUser(form.name.trim(), form.email.trim(), form.password.trim(), form.role)
    setSaving(false)
    setForm(EMPTY_FORM)
    setShowAdd(false)
    reload()
  }

  const handleEdit = async (id: number) => {
    setSaving(true)
    await updateUser(id, editForm.name.trim(), editForm.email.trim(), editForm.role, editForm.password || undefined)
    setSaving(false)
    setEditId(null)
    reload()
  }

  const handleDelete = async (id: number) => {
    if (id === me?.id) { alert('Tidak bisa hapus akun sendiri.'); return }
    if (!confirm('Hapus pengguna ini?')) return
    await deleteUser(id)
    reload()
  }

  const roleLabel = (r: Role) => ROLES.find((x) => x.value === r)?.label ?? r
  const roleBadge: Record<Role, string> = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    rep: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-primary-600" />
          <h1 className="text-2xl font-black text-gray-900">Pengguna</h1>
        </div>
        <div className="flex items-center gap-2">
          <UserBadge />
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="bg-primary-600 text-white px-3 py-2 rounded-xl flex items-center gap-1 text-sm font-semibold"
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5">Kelola akun pengguna</p>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="card mb-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Pengguna Baru</h2>
          <div>
            <label className="label">Nama</label>
            <input className="input-field" placeholder="Nama lengkap" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" placeholder="email@domain.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowAdd(false)}>Batal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="card">
              {editId === u.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="label">Nama</label>
                    <input className="input-field" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input-field" type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Password Baru (kosongkan jika tidak diubah)</label>
                    <input className="input-field" type="password" placeholder="Password baru..." value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input-field" value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as Role }))}>
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(u.id)} className="btn-primary flex-1 py-2" disabled={saving}>
                      <Check size={16} className="inline mr-1" />Simpan
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-secondary flex-1 py-2">
                      <X size={16} className="inline mr-1" />Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      {u.id === me?.id && <span className="text-xs text-primary-500">(Saya)</span>}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                    <span className={`badge mt-1 ${roleBadge[u.role]}`}>{roleLabel(u.role)}</span>
                  </div>
                  <button
                    onClick={() => { setEditId(u.id); setEditForm({ name: u.name, email: u.email, password: '', role: u.role }) }}
                    className="text-gray-400 p-1"
                  >
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

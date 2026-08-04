import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/db'
import { Product } from '@/types'
import { Plus, Pencil, Trash2, Check, X, Package } from 'lucide-react'
import UserBadge from '@/components/UserBadge'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = () => getProducts(false).then((p) => { setProducts(p); setLoading(false) })
  useEffect(() => { reload() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await createProduct(newName.trim())
    setNewName('')
    reload()
  }

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return
    const p = products.find((x) => x.id === id)!
    await updateProduct(id, editName.trim(), p.active)
    setEditId(null)
    reload()
  }

  const handleToggleActive = async (p: Product) => {
    await updateProduct(p.id, p.name, p.active ? 0 : 1)
    reload()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return
    await deleteProduct(id)
    reload()
  }

  return (
    <div className="pb-6">
      <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Package size={22} className="text-primary-600" />
          <h1 className="text-2xl font-black text-gray-900">Produk</h1>
        </div>
        <UserBadge />
      </div>
      <p className="text-sm text-gray-500 mb-5">Kelola daftar produk untuk sales rep</p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          className="input-field flex-1"
          placeholder="Nama produk baru..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" className="bg-primary-600 text-white px-4 rounded-xl flex items-center gap-1 font-semibold">
          <Plus size={18} />
        </button>
      </form>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className={`card flex items-center gap-3 ${!p.active ? 'opacity-50' : ''}`}>
              {editId === p.id ? (
                <>
                  <input
                    className="input-field flex-1 py-2"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => handleEdit(p.id)} className="text-green-600 p-1"><Check size={18} /></button>
                  <button onClick={() => setEditId(null)} className="text-gray-400 p-1"><X size={18} /></button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    {!p.active && <span className="text-xs text-gray-400">Nonaktif</span>}
                  </div>
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`text-xs font-medium px-2 py-1 rounded-lg ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {p.active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button onClick={() => { setEditId(p.id); setEditName(p.name) }} className="text-gray-400 p-1"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 p-1"><Trash2 size={16} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, List, BarChart2, Users, Package, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Role } from '@/types'

interface Props {
  role: Role
}

export default function BottomNav({ role }: Props) {
  const { logout } = useAuth()

  const repLinks = [
    { to: '/rep', label: 'Beranda', icon: Home, end: true },
    { to: '/rep/new', label: 'Catat', icon: PlusCircle, end: false },
    { to: '/rep/activities', label: 'Aktivitas', icon: List, end: false },
  ]

  const managerLinks = [
    { to: '/manager', label: 'Dashboard', icon: BarChart2, end: true },
    { to: '/manager/visits', label: 'Semua Visit', icon: List, end: false },
  ]

  const adminLinks = [
    { to: '/manager', label: 'Dashboard', icon: BarChart2, end: true },
    { to: '/manager/visits', label: 'Semua Visit', icon: List, end: false },
    { to: '/admin/products', label: 'Produk', icon: Package, end: false },
    { to: '/admin/users', label: 'Pengguna', icon: Users, end: false },
  ]

  const links = role === 'rep' ? repLinks : role === 'manager' ? managerLinks : adminLinks

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 flex items-center justify-around px-2 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`
          }
        >
          <Icon size={22} strokeWidth={1.8} />
          <span className="mt-0.5">{label}</span>
        </NavLink>
      ))}
      <button
        onClick={logout}
        className="flex flex-col items-center py-2 px-3 text-xs font-medium text-gray-500"
      >
        <LogOut size={22} strokeWidth={1.8} />
        <span className="mt-0.5">Keluar</span>
      </button>
    </nav>
  )
}

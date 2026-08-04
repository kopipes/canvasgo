import { useAuth } from '@/context/AuthContext'
import { Role } from '@/types'

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  rep: 'Sales Rep',
}

const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  rep: 'bg-gray-100 text-gray-600',
}

export default function UserBadge() {
  const { user } = useAuth()
  if (!user) return null

  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
        <span className={`badge text-xs ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</span>
      </div>
      <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {initials}
      </div>
    </div>
  )
}

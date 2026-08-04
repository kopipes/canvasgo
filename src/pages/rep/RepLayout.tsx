import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'

export default function RepLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'rep') return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <div className="flex-1 pb-20">
        <Outlet />
      </div>
      <BottomNav role="rep" />
    </div>
  )
}

import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'

export default function AdminLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-primary-600"><div className="text-white text-xl font-bold">CanvasGo</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <div className="flex-1 pb-20">
        <Outlet />
      </div>
      <BottomNav role="admin" />
    </div>
  )
}

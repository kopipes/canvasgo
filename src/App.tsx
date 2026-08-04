import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import RepLayout from '@/pages/rep/RepLayout'
import RepDashboard from '@/pages/rep/RepDashboard'
import NewVisitPage from '@/pages/rep/NewVisitPage'
import MyActivitiesPage from '@/pages/rep/MyActivitiesPage'
import VisitDetailPage from '@/pages/rep/VisitDetailPage'
import ManagerLayout from '@/pages/manager/ManagerLayout'
import ManagerDashboard from '@/pages/manager/ManagerDashboard'
import ManagerVisitsPage from '@/pages/manager/ManagerVisitsPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminUsers from '@/pages/admin/AdminUsers'
import ChangePasswordPage from '@/pages/ChangePasswordPage'
import ProfileLayout from '@/pages/ProfileLayout'

function RoleRouter() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-primary-600">
      <div className="text-white text-xl font-bold">CanvasGo</div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'admin') return <Navigate to="/manager" replace />
  if (user.role === 'manager') return <Navigate to="/manager" replace />
  return <Navigate to="/rep" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Profile - accessible to all roles */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<ChangePasswordPage />} />
          </Route>

          {/* Rep routes */}
          <Route path="/rep" element={<RepLayout />}>
            <Route index element={<RepDashboard />} />
            <Route path="new" element={<NewVisitPage />} />
            <Route path="activities" element={<MyActivitiesPage />} />
            <Route path="visit/:id" element={<VisitDetailPage />} />
          </Route>

          {/* Manager routes */}
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="visits" element={<ManagerVisitsPage />} />
            <Route path="visit/:id" element={<VisitDetailPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<RoleRouter />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

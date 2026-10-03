import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { Loading } from './components/ui'
import { isManager, isSuperadmin } from './lib/roles'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MyAppealsPage } from './pages/MyAppealsPage'
import { ProfilePage } from './pages/ProfilePage'
import { TasksPage } from './pages/TasksPage'
import { DepartmentsPage } from './pages/admin/DepartmentsPage'
import { ReportsPage } from './pages/admin/ReportsPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { StaffDetailPage } from './pages/admin/StaffDetailPage'
import { StaffListPage } from './pages/admin/StaffListPage'
import { QuarterlyReportPage } from './pages/admin/QuarterlyReportPage'
import { UsersPage } from './pages/admin/UsersPage'

/** Eski havolalar (/hisobot/xodim/:id) yangi manzilga yo'naltiriladi */
function LegacyStaffRedirect() {
  const { id } = useParams()
  return <Navigate to={`/xodimlar/${id}`} replace />
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="ishlar" element={<MyAppealsPage />} />
        <Route path="murojaatlar" element={<Navigate to="/ishlar" replace />} />
        <Route path="topshiriqlar" element={<TasksPage />} />
        <Route path="profil" element={<ProfilePage />} />
        {isManager(user.role) && (
          <>
            <Route path="hisobot" element={<ReportsPage />} />
            <Route path="xodimlar" element={<StaffListPage />} />
            <Route path="hisobot/chorak" element={<QuarterlyReportPage />} />
            <Route path="xodimlar/:id" element={<StaffDetailPage />} />
            <Route path="hisobot/xodim/:id" element={<LegacyStaffRedirect />} />
          </>
        )}
        {isSuperadmin(user.role) && (
          <>
            <Route path="boshqaruv/foydalanuvchilar" element={<UsersPage />} />
            <Route path="boshqaruv/bolimlar" element={<DepartmentsPage />} />
            <Route path="boshqaruv/sozlamalar" element={<SettingsPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

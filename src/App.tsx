import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
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
import { DeliveriesPage } from './pages/admin/DeliveriesPage'
import { StaffDetailPage } from './pages/admin/StaffDetailPage'
import { StaffListPage } from './pages/admin/StaffListPage'
import { QuarterlyReportPage } from './pages/admin/QuarterlyReportPage'
import { UsersPage } from './pages/admin/UsersPage'
import { TgWritePage } from './pages/TgWritePage'
import { RatingPage } from './pages/RatingPage'

/** Eski havolalar (/hisobot/xodim/:id) yangi manzilga yo'naltiriladi */
function LegacyStaffRedirect() {
  const { id } = useParams()
  return <Navigate to={`/xodimlar/${id}`} replace />
}

export default function App() {
  const { user, loading, telegramError } = useAuth()
  const location = useLocation()

  if (loading) return <Loading />
  if (!user) {
    // Bot ichida (WebApp) login formasi o'rniga sababini ko'rsatamiz
    if (telegramError)
      return (
        <div className="tech-bg flex min-h-dvh items-center justify-center p-6 text-center">
          <div className="max-w-sm rounded-xl border border-line bg-white p-6 shadow-card">
            <p className="font-semibold text-slate-900">Kirib bo‘lmadi</p>
            <p className="mt-2 text-sm text-slate-600">{telegramError}</p>
          </div>
        </div>
      )
    return <LoginPage />
  }
  // Bot ichidagi ixcham sahifa — menyusiz
  if (location.pathname.startsWith('/tg/')) return <TgWritePage />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="ishlar" element={<MyAppealsPage />} />
        <Route path="murojaatlar" element={<Navigate to="/ishlar" replace />} />
        <Route path="topshiriqlar" element={<TasksPage />} />
        <Route path="profil" element={<ProfilePage />} />
        <Route path="reyting" element={<RatingPage />} />
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
            <Route path="boshqaruv/bot-xabarlari" element={<DeliveriesPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

import { useEffect, useState } from 'react'
import { BarChart3, Building2, FileText, House, ListTodo, LogOut, Menu, Settings, Users, UsersRound, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROLE_LABELS, isManager, isSuperadmin } from '../lib/roles'
import { firstName } from '../lib/humanize'
import { Avatar } from './ui'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  end?: boolean
}

function SidebarLink({ to, icon: Icon, label, end }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-sm transition ${
          isActive ? 'bg-white font-bold text-brand-700 shadow-card' : 'font-medium text-slate-600 hover:bg-hover hover:text-slate-800'
        }`
      }
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.9} aria-hidden />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function Sidebar() {
  const { user, logout } = useAuth()
  const main: NavItem[] = [
    { to: '/', icon: House, label: 'Bosh sahifa', end: true },
    { to: '/ishlar', icon: FileText, label: 'Mening ishlarim' },
    { to: '/topshiriqlar', icon: ListTodo, label: 'Topshiriqlar' },
  ]
  if (isManager(user?.role)) {
    main.push({ to: '/xodimlar', icon: UsersRound, label: 'Xodimlar' }, { to: '/hisobot', icon: BarChart3, label: 'Hisobot' })
  }
  const admin: NavItem[] = isSuperadmin(user?.role)
    ? [
        { to: '/boshqaruv/foydalanuvchilar', icon: Users, label: 'Foydalanuvchilar' },
        { to: '/boshqaruv/bolimlar', icon: Building2, label: "Bo'limlar" },
        { to: '/boshqaruv/sozlamalar', icon: Settings, label: 'Sozlamalar' },
      ]
    : []

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
        <img src="/logo.png" alt="Andijon davlat universiteti logotipi" className="size-10 rounded-full" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-extrabold text-slate-800">ADU ATM</p>
          <p className="truncate text-xs text-slate-500">Ishlar va topshiriqlar</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {main.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
        {admin.length > 0 && (
          <>
            <p className="px-2.5 pt-5 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Boshqaruv</p>
            {admin.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-white p-2 shadow-card">
          <NavLink to="/profil" className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-hover">
            {user && <Avatar name={user.fullName} />}
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold text-slate-800">{user ? firstName(user.fullName) : ''}</span>
              <span className="block truncate text-xs text-slate-500">{user && ROLE_LABELS[user.role]}</span>
            </span>
          </NavLink>
          <button onClick={logout} className="mt-1 flex h-8 w-full items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-500 hover:bg-hover hover:text-slate-800">
            <LogOut className="size-4" strokeWidth={1.9} aria-hidden />
            Chiqish
          </button>
        </div>
      </div>
    </div>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="min-h-screen md:flex">
      {/* Kompyuter: doimiy yon panel */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">
        <Sidebar />
      </aside>

      {/* Telefon: yuqori panel + ochiladigan yon panel */}
      <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-line bg-page/95 px-2 backdrop-blur md:hidden">
        <button onClick={() => setOpen(true)} aria-label="Menyuni ochish" className="flex size-9 items-center justify-center rounded-xl text-slate-600 hover:bg-hover">
          <Menu className="size-5" strokeWidth={1.9} />
        </button>
        <img src="/logo.png" alt="" className="size-7 rounded-full" />
        <span className="text-sm font-semibold text-slate-800">ADU ATM</span>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menyu">
          <div className="absolute inset-0 bg-[rgba(15,15,15,0.4)]" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-up shadow-notion">
            <Sidebar />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1180px] animate-fade-up px-4 pt-6 pb-16 sm:px-8 md:pt-10 lg:px-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

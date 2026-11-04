import { useEffect, useState } from 'react'
import { BarChart3, Building2, FileText, House, ListTodo, LogOut, Menu, ScrollText, Send, Settings, Trophy, Users, UsersRound, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useSettings } from '../api/hooks'
import { ROLE_LABELS, isManager, isSuperadmin } from '../lib/roles'
import { firstName } from '../lib/humanize'
import { Avatar } from './ui'
import { ThemeButton, ThemeToggle } from './ThemeToggle'

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
        `group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition ${
          isActive ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-hover hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute top-1.5 bottom-1.5 -left-3 w-0.5 rounded-r bg-brand-600" aria-hidden />}
          <Icon className={`size-4 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={2} aria-hidden />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

/** Reyting xodimlarga ko'rinadimi (superadmin sozlamasi); rahbarlar har doim ko'radi */
function useRatingVisible() {
  const { user } = useAuth()
  const settings = useSettings().data
  return isManager(user?.role) || (settings?.ratingVisible ?? false)
}

function Sidebar() {
  const { user, logout } = useAuth()
  const ratingVisible = useRatingVisible()
  const main: NavItem[] = [
    { to: '/', icon: House, label: 'Bosh sahifa', end: true },
    { to: '/ishlar', icon: FileText, label: 'Mening ishlarim' },
    { to: '/topshiriqlar', icon: ListTodo, label: 'Topshiriqlar' },
    ...(ratingVisible ? [{ to: '/reyting', icon: Trophy, label: 'Reyting' }] : []),
  ]
  if (isManager(user?.role)) {
    main.push(
      { to: '/xodimlar', icon: UsersRound, label: 'Xodimlar' },
      { to: '/hisobot', icon: BarChart3, label: 'Hisobot', end: true },
      { to: '/hisobot/chorak', icon: ScrollText, label: 'Choraklik hisobot' },
    )
  }
  const admin: NavItem[] = isSuperadmin(user?.role)
    ? [
        { to: '/boshqaruv/foydalanuvchilar', icon: Users, label: 'Foydalanuvchilar' },
        { to: '/boshqaruv/bolimlar', icon: Building2, label: "Bo'limlar" },
        { to: '/boshqaruv/bot-xabarlari', icon: Send, label: 'Bot xabarlari' },
        { to: '/boshqaruv/sozlamalar', icon: Settings, label: 'Sozlamalar' },
      ]
    : []

  return (
    <div className="flex h-full flex-col border-r border-line bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <img src="/logo.png" alt="Andijon davlat universiteti logotipi" className="size-8 rounded-full ring-1 ring-line" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold text-slate-900">ADU ATM</p>
          <p className="flex items-center gap-1.5 truncate font-mono text-[10.5px] text-slate-500">
            <span className="live-dot size-1.5 rounded-full bg-ink-green" aria-hidden />
            tizim ishlayapti
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <p className="px-2.5 pb-1 font-mono text-[10.5px] font-medium tracking-wider text-slate-400 uppercase">Asosiy</p>
        {main.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
        {admin.length > 0 && (
          <>
            <p className="px-2.5 pt-5 pb-1 font-mono text-[10.5px] font-medium tracking-wider text-slate-400 uppercase">Boshqaruv</p>
            {admin.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-line p-3">
        <ThemeToggle />
        <div className="mt-2">
          <NavLink to="/profil" className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-hover">
            {user && <Avatar name={user.fullName} />}
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-medium text-slate-900">{user ? firstName(user.fullName) : ''}</span>
              <span className="block truncate text-xs text-slate-500">{user && ROLE_LABELS[user.role]}</span>
            </span>
          </NavLink>
          <button onClick={logout} className="mt-1 flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] text-slate-500 hover:bg-hover hover:text-slate-900">
            <LogOut className="size-4" strokeWidth={1.9} aria-hidden />
            Chiqish
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Telefon uchun pastki doimiy menyu (ilovalardagidek): asosiy bo'limlar bir bosishda,
 * qolganlari "Menyu" orqali yon panelda.
 */
function BottomNav({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth()
  const ratingVisible = useRatingVisible()
  const items: NavItem[] = [
    { to: '/', icon: House, label: 'Bosh sahifa', end: true },
    { to: '/ishlar', icon: FileText, label: 'Ishlarim' },
    { to: '/topshiriqlar', icon: ListTodo, label: 'Topshiriqlar' },
    ...(isManager(user?.role)
      ? [{ to: '/xodimlar', icon: UsersRound, label: 'Xodimlar' }]
      : ratingVisible
        ? [{ to: '/reyting', icon: Trophy, label: 'Reyting' }]
        : []),
  ]
  const tab = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition'
  return (
    <nav
      aria-label="Asosiy menyu"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/90 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {items.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `${tab} ${isActive ? 'text-brand-600' : 'text-slate-500'}`}>
          {({ isActive }) => (
            <>
              <span className={`flex h-7 w-12 items-center justify-center rounded-md transition ${isActive ? 'bg-brand-50' : ''}`}>
                <Icon className="size-5" strokeWidth={isActive ? 2.2 : 1.9} aria-hidden />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
      <button type="button" onClick={onMenu} className={`${tab} text-slate-500`}>
        <span className="flex h-7 w-12 items-center justify-center rounded-full">
          <Menu className="size-5" strokeWidth={1.9} aria-hidden />
        </span>
        Menyu
      </button>
    </nav>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="app-bg min-h-screen md:flex">
      {/* Kompyuter: doimiy yon panel */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 md:block">
        <Sidebar />
      </aside>

      {/* Telefon: yuqorida faqat logo; asosiy navigatsiya — pastki panelda */}
      <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-line bg-surface/90 px-4 backdrop-blur-md md:hidden">
        <img src="/logo.png" alt="" className="size-7 rounded-full ring-1 ring-line" />
        <span className="text-sm font-semibold text-slate-900">ADU ATM</span>
        <ThemeButton className="ml-auto" />
      </header>
      <BottomNav onMenu={() => setOpen(true)} />
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menyu">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-up bg-surface shadow-notion">
            <Sidebar />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1">
        {/* Telefonda pastki panel uchun joy qoldiramiz */}
        <div className="mx-auto max-w-[1200px] animate-fade-up px-4 pt-5 pb-28 sm:px-6 md:pt-8 md:pb-16 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

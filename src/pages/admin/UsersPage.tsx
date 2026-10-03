import { Check, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useDeleteUser, useDepartments, useSaveUser, useTelegramTest, useUsers } from '../../api/hooks'
import type { Role, User } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/Toast'
import { Badge, Button, Card, ErrorText, Field, Input, Loading, PageHeader, Select } from '../../components/ui'
import { ROLE_LABELS, ROLE_OPTIONS } from '../../lib/roles'

function UserForm({ user, onDone }: { user?: User; onDone: () => void }) {
  const save = useSaveUser()
  const departments = useDepartments()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(user?.role ?? 'xodim')
  const [departmentId, setDepartmentId] = useState(user?.departmentId ?? '')
  const [telegramId, setTelegramId] = useState(user?.telegramId ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await save.mutateAsync({ id: user?.id, fullName, username, role, departmentId: departmentId || null, telegramId: telegramId.trim(), ...(password ? { password } : {}) })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="F.I.Sh">
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
      </Field>
      <Field label="Login" hint="lotin harf, raqam, . _ -">
        <Input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} autoComplete="off" />
      </Field>
      <Field label={user ? 'Yangi parol' : 'Parol'} hint={user ? "o'zgartirmasangiz bo'sh qoldiring" : 'kamida 8 belgi'}>
        <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required={!user} minLength={8} maxLength={100} autoComplete="off" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rol">
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Bo'lim">
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">— Bo'limsiz —</option>
            {departments.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Telegram ID" hint="ixtiyoriy — topshiriq xabarlari uchun">
        <Input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} inputMode="numeric" placeholder="Masalan: 123456789" autoComplete="off" />
      </Field>
      <p className="-mt-2 text-xs text-slate-500">Xodim botga /start bosadi — bot unga ID raqamini yuboradi. Shu raqamni kiriting.</p>
      {role === 'bolim_boshligi' && !departmentId && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Bo'lim boshlig'iga bo'lim biriktiring — aks holda u topshiriq bera olmaydi.</p>
      )}
      <ErrorText>{save.error?.message}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>
          Saqlash
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Bekor qilish
        </Button>
      </div>
    </form>
  )
}

export function UsersPage() {
  const { user: me } = useAuth()
  const users = useUsers()
  const departments = useDepartments()
  const remove = useDeleteUser()
  const telegramTest = useTelegramTest()
  const toast = useToast()
  const [editing, setEditing] = useState<User | 'new' | null>(null)
  const deptName = (id?: string) => departments.data?.find((d) => d.id === id)?.name ?? "Bo'limsiz"

  async function handleDelete(u: User) {
    if (!confirm(`${u.fullName} ni o'chirasizmi?`)) return
    try {
      await remove.mutateAsync(u.id)
      toast.success(`${u.fullName} o'chirildi`)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function handleTelegramTest(u: User) {
    try {
      await telegramTest.mutateAsync(u.id)
      toast.success(`${u.fullName} ga sinov xabari yuborildi`)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <>
      <PageHeader icon={Users} title="Foydalanuvchilar" subtitle="Login/parol, rol va bo'limni faqat superadmin boshqaradi" action={<Button onClick={() => setEditing('new')}>+ Qo'shish</Button>} />
      <Card>
        {users.isLoading ? (
          <Loading />
        ) : (
          <ul className="-my-2 divide-y divide-line">
            {users.data?.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link to={`/xodimlar/${u.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                    {u.fullName}
                  </Link>{' '}
                  <Badge tone={u.role === 'xodim' ? 'slate' : 'amber'}>{ROLE_LABELS[u.role]}</Badge>
                  <p className="text-xs text-slate-500">
                    @{u.username} · {deptName(u.departmentId)} ·{' '}
                    {u.telegramId ? <span className="inline-flex items-center gap-0.5 text-good-ink">
                        Telegram <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                      </span> : <span className="text-slate-400">Telegram yo'q</span>}
                  </p>
                </div>
                <div className="flex gap-1">
                  {u.telegramId && (
                    <Button variant="ghost" className="px-2 py-1 text-xs" disabled={telegramTest.isPending} onClick={() => handleTelegramTest(u)}>
                      Sinov xabari
                    </Button>
                  )}
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing(u)}>
                    Tahrirlash
                  </Button>
                  {u.id !== me?.id && (
                    <Button variant="ghost" className="px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => handleDelete(u)}>
                      O'chirish
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && (
        <Modal title={editing === 'new' ? 'Yangi foydalanuvchi' : 'Tahrirlash'} onClose={() => setEditing(null)}>
          <UserForm user={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </>
  )
}

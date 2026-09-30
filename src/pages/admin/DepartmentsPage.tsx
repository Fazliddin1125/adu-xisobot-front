import { Building2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useDeleteDepartment, useDepartments, useSaveDepartment, useUsers } from '../../api/hooks'
import type { Department } from '../../api/types'
import { useToast } from '../../components/Toast'
import { Button, Card, ErrorText, Input, Loading, PageHeader } from '../../components/ui'

export function DepartmentsPage() {
  const departments = useDepartments()
  const users = useUsers()
  const save = useSaveDepartment()
  const remove = useDeleteDepartment()
  const toast = useToast()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Department | null>(null)
  const [editName, setEditName] = useState('')

  const count = (id: string) => users.data?.filter((u) => u.departmentId === id).length ?? 0

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    await save.mutateAsync({ name })
    setName('')
  }

  async function handleRename(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    await save.mutateAsync({ id: editing.id, name: editName })
    setEditing(null)
  }

  async function handleDelete(d: Department) {
    if (!confirm(`"${d.name}" bo'limini o'chirasizmi?`)) return
    try {
      await remove.mutateAsync(d.id)
      toast.success(`"${d.name}" o'chirildi`)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <>
      <PageHeader icon={Building2} title="Bo'limlar" subtitle="Xodimlarni guruhlash va hisobotda bo'lim kesimini ko'rish uchun" />
      <Card>
        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yangi bo'lim nomi" aria-label="Bo'lim nomi" required minLength={2} />
          <Button type="submit" disabled={save.isPending}>
            Qo'shish
          </Button>
        </form>
        <ErrorText>{save.error?.message}</ErrorText>
        {departments.isLoading ? (
          <Loading />
        ) : (
          <ul className="divide-y divide-line">
            {departments.data?.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                {editing?.id === d.id ? (
                  <form onSubmit={handleRename} className="flex flex-1 gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} aria-label="Yangi nom" autoFocus required minLength={2} />
                    <Button type="submit">Saqlash</Button>
                    <Button variant="secondary" onClick={() => setEditing(null)}>
                      Bekor
                    </Button>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-500">{count(d.id)} xodim</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        className="px-2 py-1 text-xs"
                        onClick={() => {
                          setEditing(d)
                          setEditName(d.name)
                        }}
                      >
                        Nomini o'zgartirish
                      </Button>
                      <Button variant="ghost" className="px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => handleDelete(d)}>
                        O'chirish
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
            {!departments.data?.length && <li className="py-6 text-center text-sm text-slate-400">Hali bo'lim yo'q</li>}
          </ul>
        )}
      </Card>
    </>
  )
}

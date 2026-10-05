import { ListTodo } from 'lucide-react'
import { useState } from 'react'
import { useMoveTask, useTasks, useUsers } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { Modal } from '../components/Modal'
import { TaskBoard } from '../components/tasks/TaskBoard'
import { CommonTasks } from '../components/tasks/CommonTasks'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { TaskForm } from '../components/tasks/TaskForm'
import { Button, ErrorText, Loading, PageHeader, Segmented, Select } from '../components/ui'
import { isManager } from '../lib/roles'

export function TasksPage() {
  const { user } = useAuth()
  const manager = isManager(user?.role)
  const [scope, setScope] = useState<'all' | 'mine'>(manager ? 'all' : 'mine')
  const [assigneeId, setAssigneeId] = useState('')
  const [includeArchive, setIncludeArchive] = useState(false)
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const users = useUsers(manager)
  const tasks = useTasks({ scope, assigneeId: assigneeId || undefined, includeArchive })
  const common = useTasks({ scope: 'common' })
  const move = useMoveTask()

  return (
    <>
      <PageHeader
        icon={ListTodo}
        title="Topshiriqlar"
        subtitle="Kartochkani sudrab keyingi bosqichga o'tkazing yoki bosib batafsil oching"
        action={manager && <Button onClick={() => setCreating(true)}>+ Topshiriq berish</Button>}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          label="Ko'rinish"
          options={[
            { value: 'all', label: 'Barchasi' },
            { value: 'mine', label: 'Menga tegishli' },
          ]}
          value={scope}
          onChange={setScope}
        />
        {manager && (
          <Select aria-label="Ijrochi bo'yicha" className="sm:w-56" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Barcha ijrochilar</option>
            {users.data?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </Select>
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={includeArchive} onChange={(e) => setIncludeArchive(e.target.checked)} className="size-4 accent-brand-600" />
          30 kundan eski bajarilganlarni ham ko'rsatish
        </label>
      </div>

      <ErrorText>{move.error?.message}</ErrorText>
      <CommonTasks tasks={common.data ?? []} onOpen={setOpenId} />
      {/* Umumiy ishlar yuqorida alohida — doskada faqat egasi bor topshiriqlar */}
      {tasks.isLoading ? <Loading /> : <TaskBoard tasks={(tasks.data ?? []).filter((t) => t.assignees.length > 0)} onOpen={setOpenId} />}

      {creating && (
        <Modal title="Yangi topshiriq" onClose={() => setCreating(false)}>
          <TaskForm onDone={() => setCreating(false)} />
        </Modal>
      )}
      {openId && <TaskDetail id={openId} onClose={() => setOpenId(null)} />}
    </>
  )
}

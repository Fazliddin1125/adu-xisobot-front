import { useState } from 'react'
import { Lock, MessageCircle } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useMoveTask } from '../../api/hooks'
import type { Task, TaskStatus } from '../../api/types'
import { firstName } from '../../lib/humanize'
import { TASK_COLUMNS, isReturn } from '../../lib/tasks'
import { Modal } from '../Modal'
import { ReturnForm } from './ReturnForm'
import { Avatar, Badge } from '../ui'
import { DeadlineChip } from './DeadlineChip'
import { QuickStatusButton } from './QuickStatusButton'

function CardBody({ task }: { task: Task }) {
  return (
    <>
      <p className="text-sm font-semibold break-words text-slate-800">
        {task.visibility === 'private' && (
          <Lock className="mr-1 inline size-3.5 -translate-y-px text-slate-400" strokeWidth={2.2} aria-label="Yopiq — faqat ijrochilar ko'radi" />
        )}
        {task.title}
      </p>
      <div className="mt-2.5">
        <DeadlineChip deadline={task.deadline} done={task.status === 'bajarildi'} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex -space-x-2">
          {task.assignees.slice(0, 3).map((a) => (
            <span key={a.id} className="rounded-full ring-2 ring-white">
              <Avatar name={a.fullName} size="sm" />
            </span>
          ))}
          {task.assignees.length > 3 && (
            <span className="flex size-6 items-center justify-center rounded-full bg-tag-gray-bg text-[10px] font-bold text-tag-gray ring-2 ring-white">
              +{task.assignees.length - 3}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-400">
          {task.commentsCount > 0 && (
            <span title="Izohlar" className="inline-flex items-center gap-1">
              <MessageCircle className="size-3.5" strokeWidth={2} aria-hidden />
              {task.commentsCount}
            </span>
          )}
          <span className="truncate">Muallif: {firstName(task.creator.fullName)}</span>
        </span>
      </div>
    </>
  )
}

const cardCls = 'w-full rounded-2xl bg-white p-3.5 text-left shadow-card'

function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const movable = task.allowedStatuses.length > 0
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, disabled: !movable })
  return (
    <div className={`${cardCls} transition hover:-translate-y-0.5 hover:shadow-soft ${isDragging ? 'opacity-40' : ''}`}>
      {/* Ustki qism: bosilsa ochiladi, ushlab sudraladi */}
      <button
        ref={setNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        onClick={onOpen}
        aria-roledescription={movable ? 'Suriladigan kartochka' : undefined}
        className={`block w-full text-left ${movable ? 'cursor-grab touch-manipulation' : ''}`}
      >
        <CardBody task={task} />
      </button>
      {/* Pastki qism: telefondan bir bosishda keyingi bosqich */}
      <QuickStatusButton task={task} className="mt-3 w-full" />
    </div>
  )
}

function Column({ status, label, tone, dot, bg, tasks, dragging, onOpen }: (typeof TASK_COLUMNS)[number] & { tasks: Task[]; dragging: Task | null; onOpen: (id: string) => void }) {
  const droppable = !!dragging && dragging.allowedStatuses.includes(status)
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !droppable })
  return (
    <section
      ref={setNodeRef}
      aria-label={label}
      className={`flex min-h-40 flex-col rounded-3xl p-2.5 outline-2 -outline-offset-2 transition-all ${bg} ${
        isOver && droppable ? 'outline-brand-500' : droppable ? 'outline-dashed outline-brand-500/40' : 'outline-transparent'
      } ${dragging && !droppable && dragging.status !== status ? 'opacity-50' : ''}`}
    >
      <header className="flex items-center gap-2 px-1.5 pt-1 pb-3">
        <Badge tone={tone}>
          <span className={`size-2 rounded-full ${dot}`} />
          {label}
        </Badge>
        <span className="tabular text-sm text-slate-400">{tasks.length}</span>
      </header>
      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={() => onOpen(t.id)} />
        ))}
        {!tasks.length && <p className="py-8 text-center text-xs text-slate-400">{dragging ? 'Shu yerga tashlang' : 'Hozircha bo\'sh'}</p>}
      </div>
    </section>
  )
}

/**
 * Kanban doska. Kartochka faqat foydalanuvchiga ruxsat etilgan ustunga suriladi
 * (ruxsat serverdan keladigan `allowedStatuses` bo'yicha; server ham qayta tekshiradi).
 * Sichqoncha: 6px siljigach surish boshlanadi (oddiy bosish kartochkani ochadi).
 * Telefon: barmoqni 250ms bosib turib suriladi (oddiy suring — sahifa aylanadi).
 */
export function TaskBoard({ tasks, onOpen }: { tasks: Task[]; onOpen: (id: string) => void }) {
  const move = useMoveTask()
  const [dragging, setDragging] = useState<Task | null>(null)
  /** Bajarilgan kartochka orqaga surilganda — izoh so'raymiz */
  const [returning, setReturning] = useState<{ id: string; to: TaskStatus } | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(e: DragStartEvent) {
    setDragging(tasks.find((t) => t.id === e.active.id) ?? null)
  }

  function handleDragEnd(e: DragEndEvent) {
    const target = e.over?.id as TaskStatus | undefined
    if (dragging && target && dragging.allowedStatuses.includes(target)) {
      if (isReturn(dragging.status, target)) setReturning({ id: dragging.id, to: target })
      else move.mutate({ id: dragging.id, status: target })
    }
    setDragging(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="grid gap-3 md:grid-cols-3">
        {TASK_COLUMNS.map((col) => (
          <Column key={col.status} {...col} tasks={tasks.filter((t) => t.status === col.status)} dragging={dragging} onOpen={onOpen} />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {dragging && (
          <div className={`${cardCls} rotate-2 cursor-grabbing shadow-notion`}>
            <CardBody task={dragging} />
          </div>
        )}
      </DragOverlay>
      {returning && (
        <Modal title="Orqaga qaytarish" onClose={() => setReturning(null)}>
          <ReturnForm taskId={returning.id} to={returning.to} onDone={() => setReturning(null)} onCancel={() => setReturning(null)} />
        </Modal>
      )}
    </DndContext>
  )
}

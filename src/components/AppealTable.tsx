import { useState } from 'react'
import { Check, Clock3, FileText, Footprints, Inbox, Pencil, Phone, Send, Trash2, type LucideIcon } from 'lucide-react'
import type { Appeal, Channel } from '../api/types'
import { useAppealFields, useDeleteAppeal, useUpdateAppeal } from '../api/hooks'
import { firstName, relativeTime } from '../lib/humanize'
import { CHANNEL_LABELS, STATUS_LABELS, VISITOR_LABELS, isOnline } from '../lib/labels'
import { AppealForm } from './AppealForm'
import { Modal } from './Modal'
import { useToast } from './Toast'
import { Avatar, Badge, Empty } from './ui'

interface Props {
  appeals: Appeal[]
  showStaff?: boolean
  /** Ixcham ro'yxat — tor ustunlar uchun (bosh sahifa) */
  compact?: boolean
}

const CHANNEL_ICON: Record<Channel, LucideIcon> = { offline: Footprints, telefon: Phone, telegram: Send }
const CHANNEL_COLOR: Record<Channel, string> = { offline: 'bg-tag-orange-bg text-tag-orange', telefon: 'bg-tag-green-bg text-tag-green', telegram: 'bg-tag-blue-bg text-tag-blue' }

/** Murojaat qanday kelganini ko'rsatuvchi yumaloq ikonka */
function ChannelIcon({ channel }: { channel?: Channel }) {
  const Icon = channel ? CHANNEL_ICON[channel] : FileText
  return (
    <span
      title={channel ? (isOnline(channel) ? `Online · ${CHANNEL_LABELS[channel]}` : 'Offline — shaxsan keldi') : undefined}
      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${channel ? CHANNEL_COLOR[channel] : 'bg-slate-100 text-slate-500'}`}
      aria-hidden
    >
      <Icon className="size-[18px]" strokeWidth={1.9} />
    </span>
  )
}

function ChannelBadge({ appeal: a }: { appeal: Appeal }) {
  if (!a.channel) return <span className="text-slate-300">—</span>
  return <Badge tone={isOnline(a.channel) ? 'blue' : 'slate'}>{isOnline(a.channel) ? CHANNEL_LABELS[a.channel] : 'Shaxsan'}</Badge>
}

function StatusBadge({ appeal: a }: { appeal: Appeal }) {
  if (!a.status) return <span className="text-slate-300">—</span>
  return (
    <Badge tone={a.status === 'hal_qilindi' ? 'green' : 'orange'}>
      {a.status === 'hal_qilindi' ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : <Clock3 className="size-3.5" strokeWidth={2.2} aria-hidden />}
      {STATUS_LABELS[a.status]}
    </Badge>
  )
}

function IconButton({ label, onClick, danger, icon: Icon }: { label: string; onClick: () => void; danger?: boolean; icon: LucideIcon }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-lg text-sm text-slate-400 transition hover:bg-hover ${danger ? 'hover:text-ink-red' : 'hover:text-slate-800'}`}
    >
      <Icon className="size-4" strokeWidth={1.9} />
    </button>
  )
}

export function AppealTable({ appeals, showStaff, compact }: Props) {
  const [editing, setEditing] = useState<Appeal | null>(null)
  const update = useUpdateAppeal()
  const remove = useDeleteAppeal()
  const toast = useToast()
  const fields = useAppealFields()

  if (!appeals.length) {
    return (
      <Empty icon={Inbox} hint="Boshqa davrni tanlab ko'ring">
        Bu davrda ish qayd etilmagan
      </Empty>
    )
  }

  async function handleDelete(a: Appeal) {
    if (!confirm(`"${a.title}" ishini o'chirasizmi?`)) return
    try {
      await remove.mutateAsync(a.id)
      toast.success("Ish o'chirildi")
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const actions = (a: Appeal) =>
    a.editable && (
      <span className="inline-flex shrink-0">
        <IconButton label="Tahrirlash" icon={Pencil} onClick={() => setEditing(a)} />
        <IconButton label="O'chirish" icon={Trash2} danger onClick={() => handleDelete(a)} />
      </span>
    )

  const meta = (a: Appeal) =>
    [fields.visitorType && a.visitorType && VISITOR_LABELS[a.visitorType], fields.channel && a.channel && (isOnline(a.channel) ? CHANNEL_LABELS[a.channel] : 'shaxsan keldi')]
      .filter(Boolean)
      .join(' · ')

  const list = compact ? (
    <ul className="-mx-2 space-y-1">
      {appeals.map((a) => (
        <li key={a.id} className="group flex gap-3 rounded-xl px-2 py-2.5 transition hover:bg-hover">
          <ChannelIcon channel={fields.channel ? a.channel : undefined} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold break-words text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500">
                  {relativeTime(a.createdAt)}
                  {meta(a) && ` · ${meta(a)}`}
                </p>
              </div>
              <span className="opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">{actions(a)}</span>
            </div>
            {fields.status && a.status && (
              <div className="mt-1.5">
                <StatusBadge appeal={a} />
              </div>
            )}
            {a.comment && <p className="mt-1.5 rounded-lg bg-slate-100/70 px-2.5 py-1.5 text-sm break-words text-slate-600">{a.comment}</p>}
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs font-semibold text-slate-400">
          <tr>
            <th className="py-2 pr-3 pl-5 font-semibold">Ish</th>
            {fields.channel && <th className="px-3 py-2 font-semibold">Qanday keldi</th>}
            {fields.status && <th className="px-3 py-2 font-semibold">Holat</th>}
            {showStaff && <th className="px-3 py-2 font-semibold">Kim bajardi</th>}
            <th className="px-3 py-2 font-semibold">Izoh</th>
            <th className="py-2 pr-5 pl-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {appeals.map((a) => (
            <tr key={a.id} className="group align-top transition hover:bg-slate-50">
              <td className="py-3 pr-3 pl-5">
                <div className="font-semibold text-slate-800">{a.title}</div>
                <div className="text-xs text-slate-500">
                  {relativeTime(a.createdAt)}
                  {fields.visitorType && a.visitorType && ` · ${VISITOR_LABELS[a.visitorType]}`}
                </div>
              </td>
              {fields.channel && (
                <td className="px-3 py-3">
                  <ChannelBadge appeal={a} />
                </td>
              )}
              {fields.status && (
                <td className="px-3 py-3">
                  <StatusBadge appeal={a} />
                </td>
              )}
              {showStaff && (
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 text-slate-700">
                    <Avatar name={a.staffName} size="sm" />
                    {firstName(a.staffName)}
                  </span>
                </td>
              )}
              <td className="max-w-xs px-3 py-3 break-words text-slate-600">{a.comment || <span className="text-slate-300">—</span>}</td>
              <td className="py-2 pr-5 pl-3 text-right">{actions(a)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      {list}

      {editing && (
        <Modal title="Ishni tahrirlash" onClose={() => setEditing(null)}>
          <AppealForm
            initial={editing}
            submitLabel="Saqlash"
            submitting={update.isPending}
            error={update.error?.message}
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              await update.mutateAsync({ id: editing.id, ...input })
              setEditing(null)
              toast.success("O'zgarishlar saqlandi")
            }}
          />
        </Modal>
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { EmptyState, LoadingSpinner } from '../../components/ui'
import { notificationService } from '../../services'
import { formatTimeAgo } from '../../utils/formatters'
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_ICONS = { INFO: Info, SUCCESS: CheckCircle, WARNING: AlertTriangle, DANGER: AlertCircle }
const TYPE_COLORS = { INFO: 'bg-blue-50 text-blue-600', SUCCESS: 'bg-emerald-50 text-emerald-600', WARNING: 'bg-amber-50 text-amber-600', DANGER: 'bg-red-50 text-red-600' }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  const load = () => { notificationService.getAll().then(r => setNotifications(r.data || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const markRead = async (id) => {
    try { await notificationService.markRead(id); load() } catch {}
  }
  const markAllRead = async () => {
    try { await notificationService.markAllRead(); toast.success('All marked as read'); load() } catch {}
  }

  const filtered = tab === 'unread' ? notifications.filter(n => !n.read) : notifications

  if (loading) return <DashboardLayout title="Notifications"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Notifications">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['all', 'unread'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'bg-white text-textMuted border border-gray-200 hover:bg-gray-50'}`}>
              {t === 'all' ? 'All' : 'Unread'}{t === 'unread' && ` (${notifications.filter(n => !n.read).length})`}
            </button>
          ))}
        </div>
        <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1"><CheckCheck size={16} />Mark all read</button>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Bell} title="No notifications" description={tab === 'unread' ? 'You\'re all caught up!' : 'Notifications will appear here.'} /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const Icon = TYPE_ICONS[n.type] || Info
            const colorCls = TYPE_COLORS[n.type] || TYPE_COLORS.INFO
            return (
              <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                className={`card p-4 cursor-pointer transition-all hover:shadow-card-hover ${!n.read ? 'border-l-4 border-l-primary' : 'opacity-75'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${colorCls} flex-shrink-0 mt-0.5`}><Icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-textMain text-sm">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-textMuted mt-0.5">{n.message}</p>
                    <p className="text-xs text-textMuted/60 mt-1">{formatTimeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

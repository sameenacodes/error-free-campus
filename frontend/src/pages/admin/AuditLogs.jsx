import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingSpinner, EmptyState } from '../../components/ui'
import { adminService } from '../../services'
import { formatDateTime } from '../../utils/formatters'
import { Shield, User, FileText, Settings, LogIn, AlertTriangle } from 'lucide-react'

const ACTION_ICONS = {
  COMPLAINT_CREATED: FileText, COMPLAINT_ASSIGNED: User, COMPLAINT_RESOLVED: Shield,
  STATUS_CHANGED: Settings, USER_CREATED: User, USER_UPDATED: User, USER_STATUS_CHANGED: User,
  USER_LOGIN: LogIn, SYSTEM_INIT: Settings,
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    setLoading(true)
    adminService.getAuditLogs(page)
      .then(r => { setLogs(r.data.content || r.data || []); setTotalPages(r.data.totalPages || 1) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [page])

  if (loading) return <DashboardLayout title="Audit Logs"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Audit Logs">
      {logs.length === 0 ? (
        <div className="card"><EmptyState icon={Shield} title="No audit logs" description="System activity will appear here." /></div>
      ) : (
        <div className="card">
          <div className="space-y-0">
            {logs.map(log => {
              const Icon = ACTION_ICONS[log.action] || Shield
              return (
                <div key={log.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary mt-0.5"><Icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-textMain">{log.action?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-textMuted mt-0.5">{log.description}</p>
                    <p className="text-xs text-textMuted mt-1">by {log.performedByName} · {formatDateTime(log.createdAt)}</p>
                  </div>
                  {log.entityType && (
                    <span className="px-2 py-0.5 bg-gray-100 text-textMuted rounded-lg text-xs flex-shrink-0">{log.entityType}</span>
                  )}
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost text-xs">Previous</button>
              <span className="text-xs text-textMuted self-center">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost text-xs">Next</button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}

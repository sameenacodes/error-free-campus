import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatusBadge, PriorityBadge, EmptyState, LoadingSpinner } from '../../components/ui'
import { principalService } from '../../services'
import { AlertTriangle, Clock, ArrowRight, CheckCircle2, Building2, User, RefreshCw } from 'lucide-react'
import { formatDateTime, formatComplaintId, getErrorMessage } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function Escalations() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const loadData = () => {
    setLoading(true)
    principalService.getEscalations()
      .then(r => setItems(r.data || []))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleResolveEscalation = async (id) => {
    setActionLoading(id)
    try {
      await principalService.resolveEscalation(id)
      toast.success('Escalation marked as resolved')
      loadData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <DashboardLayout title="Escalations"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Principal Escalations">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-textMain">Active High-Priority Escalations</h2>
          <p className="text-textMuted text-sm">Tickets requiring executive intervention due to SLA breach or critical safety risks</p>
        </div>
        <button onClick={loadData} className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CheckCircle2}
            title="No active escalations"
            description="All escalated complaints have been addressed. The campus complaint pipeline is operating within normal SLA parameters."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(e => (
            <div key={e.id} className="card p-5 border-l-4 border-l-danger hover:shadow-card-hover transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-textMuted">{formatComplaintId(e.complaintId)}</span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                      Escalation Level {e.escalationLevel || 1}
                    </span>
                    <StatusBadge status={e.status} />
                    <PriorityBadge priority={e.priority} />
                  </div>

                  <h3
                    onClick={() => navigate(`/complaints/${e.complaintId}`)}
                    className="text-base font-bold text-textMain hover:text-primary cursor-pointer transition-colors"
                  >
                    {e.complaintTitle}
                  </h3>

                  <div className="mt-2.5 p-3 rounded-xl bg-red-50/60 border border-red-100">
                    <p className="text-xs font-semibold text-danger mb-0.5">Reason for Escalation:</p>
                    <p className="text-sm text-textMain leading-relaxed">{e.reason}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-textMuted flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 size={13} className="text-textMuted" /> {e.departmentName}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-textMuted" /> Student: {e.studentName}
                    </span>
                    <span>Escalated by: <strong className="text-textMain">{e.escalatedByName}</strong></span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-textMuted" /> {formatDateTime(e.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0 self-start lg:self-center">
                  <button
                    onClick={() => navigate(`/complaints/${e.complaintId}`)}
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    Review Ticket <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => handleResolveEscalation(e.id)}
                    disabled={actionLoading === e.id}
                    className="btn-primary text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} />
                    {actionLoading === e.id ? 'Resolving...' : 'Resolve Escalation'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

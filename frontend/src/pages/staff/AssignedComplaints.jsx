import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatusBadge, PriorityBadge, EmptyState, LoadingSpinner, Modal } from '../../components/ui'
import { staffService, complaintService } from '../../services'
import { formatDate, formatComplaintId, getErrorMessage } from '../../utils/formatters'
import { ClipboardList, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AssignedComplaints() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showResolve, setShowResolve] = useState(null)
  const [resolveForm, setResolveForm] = useState({ resolutionNotes: '', actionTaken: '', materialsUsed: '' })
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    staffService.getComplaints()
      .then(r => setComplaints(r.data.content || r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleAccept = async (id) => {
    setActionLoading(true)
    try {
      await complaintService.updateStatus(id, { status: 'IN_PROGRESS', remark: 'Staff started working' })
      toast.success('Complaint accepted!'); load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setActionLoading(false) }
  }

  const handleResolve = async () => {
    setActionLoading(true)
    try {
      await complaintService.resolve(showResolve, resolveForm)
      toast.success('Complaint resolved!'); setShowResolve(null); setResolveForm({ resolutionNotes: '', actionTaken: '', materialsUsed: '' }); load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setActionLoading(false) }
  }

  if (loading) return <DashboardLayout title="Assigned Complaints"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Assigned Complaints">
      {complaints.length === 0 ? (
        <div className="card"><EmptyState icon={ClipboardList} title="No assigned complaints" description="You don't have any complaints assigned yet." /></div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className="card p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/complaints/${c.id}`)}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-textMuted">{formatComplaintId(c.id)}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    {c.serviceUnitDisplayName && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                        {c.serviceUnitDisplayName}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-textMain truncate">{c.title}</p>
                  <p className="text-xs text-textMuted mt-1">
                    Student Dept: <span className="font-semibold text-textMain">{c.studentDepartmentName || c.departmentName}</span> · Category: {c.categoryName} · {formatDate(c.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  {c.status === 'ASSIGNED' && (
                    <button onClick={() => handleAccept(c.id)} disabled={actionLoading} className="btn-primary text-xs">Accept</button>
                  )}
                  {c.status === 'IN_PROGRESS' && (
                    <button onClick={() => setShowResolve(c.id)} className="btn-primary text-xs flex items-center gap-1"><CheckCircle2 size={14} />Resolve</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!showResolve} onClose={() => setShowResolve(null)} title="Resolve Complaint">
        <div className="space-y-4">
          <div><label className="label">Resolution Summary *</label><textarea className="input-field min-h-[100px]" value={resolveForm.resolutionNotes} onChange={e => setResolveForm(p => ({ ...p, resolutionNotes: e.target.value }))} /></div>
          <div><label className="label">Action Taken</label><input className="input-field" value={resolveForm.actionTaken} onChange={e => setResolveForm(p => ({ ...p, actionTaken: e.target.value }))} /></div>
          <div><label className="label">Materials Used</label><input className="input-field" value={resolveForm.materialsUsed} onChange={e => setResolveForm(p => ({ ...p, materialsUsed: e.target.value }))} /></div>
          <div className="flex gap-3 justify-end"><button onClick={() => setShowResolve(null)} className="btn-ghost">Cancel</button>
            <button onClick={handleResolve} disabled={actionLoading || !resolveForm.resolutionNotes} className="btn-primary">{actionLoading ? 'Resolving...' : 'Resolve'}</button></div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

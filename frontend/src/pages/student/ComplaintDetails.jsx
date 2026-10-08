import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../components/layout'
import { StatusBadge, PriorityBadge, LoadingSpinner, Modal } from '../../components/ui'
import { complaintService, hodService, publicService } from '../../services'
import { formatDateTime, formatComplaintId, getErrorMessage } from '../../utils/formatters'
import { SERVICE_UNITS } from '../../utils/constants'
import {
  ArrowLeft, MapPin, Calendar, User, Clock, Sparkles, CheckCircle2,
  AlertTriangle, ShieldAlert, Cpu, Wrench, UserPlus, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ComplaintDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showResolve, setShowResolve] = useState(false)
  const [showEscalate, setShowEscalate] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [escalateReason, setEscalateReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [resolveForm, setResolveForm] = useState({ resolutionNotes: '', actionTaken: '', materialsUsed: '' })

  // HOD Assignment state
  const [serviceUnits, setServiceUnits] = useState(SERVICE_UNITS)
  const [selectedServiceUnit, setSelectedServiceUnit] = useState('')
  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [assignRemark, setAssignRemark] = useState('')
  const [staffLoading, setStaffLoading] = useState(false)

  const load = () => {
    setLoading(true)
    complaintService.getDetail(id)
      .then(r => setData(r.data))
      .catch(err => { toast.error(getErrorMessage(err)); navigate(-1) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    publicService.getServiceUnits().then(r => {
      if (r.data?.length) setServiceUnits(r.data)
    }).catch(() => {})
  }, [id])

  const openAssignModal = () => {
    const c = data?.complaint
    const unit = c?.serviceUnit || c?.aiSuggestedServiceUnit || 'MAINTENANCE'
    setSelectedServiceUnit(unit)
    setSelectedStaff('')
    setAssignRemark('')
    setShowAssign(true)
    fetchStaffForUnit(unit)
  }

  const fetchStaffForUnit = (unit) => {
    setStaffLoading(true)
    hodService.getStaff(unit)
      .then(r => setStaffList(r.data || []))
      .catch(() => setStaffList([]))
      .finally(() => setStaffLoading(false))
  }

  const handleServiceUnitChange = (unit) => {
    setSelectedServiceUnit(unit)
    setSelectedStaff('')
    fetchStaffForUnit(unit)
  }

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Select a staff member')
      return
    }
    setActionLoading(true)
    try {
      await complaintService.assign(id, {
        staffId: parseInt(selectedStaff),
        serviceUnit: selectedServiceUnit,
        remark: assignRemark || `Assigned to ${selectedServiceUnit} staff`
      })
      toast.success('Complaint assigned to staff successfully!')
      setShowAssign(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (status, remark) => {
    setActionLoading(true)
    try {
      await complaintService.updateStatus(id, { status, remark })
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}`)
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setActionLoading(false) }
  }

  const handleResolve = async () => {
    setActionLoading(true)
    try {
      await complaintService.resolve(id, resolveForm)
      toast.success('Complaint resolved successfully!')
      setShowResolve(false)
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setActionLoading(false) }
  }

  const handleReopen = async () => {
    setActionLoading(true)
    try {
      await complaintService.reopen(id)
      toast.success('Complaint reopened and routed to HOD/Staff')
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setActionLoading(false) }
  }

  const handleEscalate = async () => {
    if (!escalateReason.trim()) {
      toast.error('Please enter a reason for escalation')
      return
    }
    setActionLoading(true)
    try {
      await complaintService.escalate(id, escalateReason)
      toast.success('Complaint successfully escalated to Principal!')
      setShowEscalate(false)
      setEscalateReason('')
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setActionLoading(false) }
  }

  if (loading) return <DashboardLayout title="Complaint Details"><LoadingSpinner /></DashboardLayout>
  if (!data) return null

  const c = data.complaint
  const ai = data.aiAnalysis
  const isUnresolved = c.status !== 'RESOLVED' && c.status !== 'CLOSED'

  return (
    <DashboardLayout title="Complaint Details">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-textMuted hover:text-primary mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-mono text-textMuted">{formatComplaintId(c.id)}</span>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
              {c.serviceUnit && (
                <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-200 flex items-center gap-1">
                  <Wrench size={12} /> {c.serviceUnitDisplayName || c.serviceUnit}
                </span>
              )}
              {c.overdue && (
                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-lg font-medium border border-red-200">
                  Overdue SLA
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-textMain">{c.title}</h2>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {user?.role === 'HOD' && c.status === 'PENDING' && (
              <button onClick={openAssignModal} disabled={actionLoading} className="btn-primary text-sm flex items-center gap-1.5">
                <UserPlus size={16} /> Assign Staff
              </button>
            )}
            {user?.role === 'STAFF' && c.status === 'ASSIGNED' && (
              <button onClick={() => handleStatusChange('IN_PROGRESS', 'Staff commenced work on the issue')} disabled={actionLoading} className="btn-primary text-sm">
                Accept & Start Work
              </button>
            )}
            {user?.role === 'STAFF' && c.status === 'IN_PROGRESS' && (
              <button onClick={() => setShowResolve(true)} className="btn-primary text-sm flex items-center gap-1">
                <CheckCircle2 size={16} /> Mark Resolved
              </button>
            )}
            {user?.role === 'STUDENT' && c.status === 'RESOLVED' && (
              <button onClick={handleReopen} disabled={actionLoading} className="btn-secondary text-sm">
                Reopen Complaint
              </button>
            )}
            {isUnresolved && (
              <button
                onClick={() => setShowEscalate(true)}
                className="btn-ghost text-sm text-danger hover:bg-red-50 flex items-center gap-1 border border-red-200"
              >
                <AlertTriangle size={15} /> Escalate Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold text-textMain mb-3">Description</h3>
            <p className="text-sm text-textMuted whitespace-pre-line leading-relaxed">{c.description}</p>
            {c.additionalNotes && (
              <>
                <h4 className="font-medium text-textMain mt-4 mb-1 text-sm">Additional Notes</h4>
                <p className="text-sm text-textMuted leading-relaxed">{c.additionalNotes}</p>
              </>
            )}
          </div>

          {data.resolutionNotes && (
            <div className="card border-l-4 border-l-success">
              <h3 className="font-semibold text-textMain mb-2 flex items-center gap-1.5 text-success">
                <CheckCircle2 size={18} /> Resolution Details
              </h3>
              <p className="text-sm text-textMuted leading-relaxed">{data.resolutionNotes}</p>
              {data.actionTaken && (
                <p className="text-sm text-textMuted mt-2">
                  <span className="font-medium text-textMain">Action Taken:</span> {data.actionTaken}
                </p>
              )}
              {data.materialsUsed && (
                <p className="text-sm text-textMuted mt-1">
                  <span className="font-medium text-textMain">Materials / Parts:</span> {data.materialsUsed}
                </p>
              )}
            </div>
          )}

          {/* Timeline from DB */}
          <div className="card">
            <h3 className="font-semibold text-textMain mb-4">Complaint Lifecycle Timeline</h3>
            <div className="space-y-0">
              {data.timeline?.map((t, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary/30 mt-1.5" />
                    {i < data.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold text-textMain">{t.toStatus?.replace(/_/g, ' ')}</p>
                    {t.remark && <p className="text-xs text-textMuted mt-0.5">{t.remark}</p>}
                    <p className="text-xs text-textMuted mt-1">{t.changedByName} · {formatDateTime(t.changedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Card */}
          {ai && ai.aiAvailable && (
            <div className="card border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <h3 className="font-semibold text-textMain">AI Complaint Intelligence</h3>
                </div>
                {ai.source === 'AI_MODEL' ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    Google Gemini
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    Rule-based Engine
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                {[
                  { label: 'Category', val: ai.suggestedCategory, conf: ai.categoryConfidence },
                  { label: 'Priority', val: ai.suggestedPriority, conf: ai.priorityConfidence },
                  { label: 'Suggested Service Unit', val: ai.suggestedServiceUnit || c.serviceUnit },
                ].map(x => (
                  <div key={x.label} className="p-2 rounded-lg bg-primary/5">
                    <p className="text-xs text-textMuted">{x.label}</p>
                    <p className="text-sm font-semibold text-textMain">{x.val || '—'}</p>
                    {x.conf != null && <p className="text-xs text-primary font-medium">{Math.round(x.conf * 100)}% conf</p>}
                  </div>
                ))}
              </div>
              {ai.summary && (
                <p className="text-sm text-textMuted">
                  <span className="font-medium text-textMain">Summary:</span> {ai.summary}
                </p>
              )}
              {ai.suggestedResolution && (
                <p className="text-sm text-textMuted mt-2 whitespace-pre-line">
                  <span className="font-medium text-textMain">Recommended Resolution:</span><br />
                  {ai.suggestedResolution}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-textMain mb-3">Ticket Information</h3>
            <div className="space-y-3 text-sm">
              {[
                { icon: User, label: 'Student', value: c.studentName },
                { icon: Building2, label: 'Student Academic Dept', value: c.studentDepartmentName || c.departmentName || '—' },
                { label: 'Category', value: c.categoryName },
                { icon: Wrench, label: 'Assigned Service Unit', value: c.serviceUnitDisplayName || c.serviceUnit || '—' },
                { icon: MapPin, label: 'Location', value: c.location || '—' },
                { icon: Calendar, label: 'Created', value: formatDateTime(c.createdAt) },
                { icon: Clock, label: 'Updated', value: formatDateTime(c.updatedAt) },
                { icon: Clock, label: 'SLA Due Date', value: c.dueDate ? formatDateTime(c.dueDate) : '—' },
                { label: 'Assigned HOD', value: c.assignedHodName || '—' },
                { label: 'Assigned Staff', value: c.assignedStaffName || '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-0.5">
                  <span className="text-textMuted text-xs flex items-center gap-1.5">
                    {item.icon && <item.icon size={13} className="text-textMuted" />}
                    {item.label}
                  </span>
                  <span className="font-medium text-textMain text-right text-xs max-w-[180px] truncate">{item.value}</span>
                </div>
              ))}
              {c.resolvedAt && (
                <div className="flex justify-between items-center py-0.5 border-t border-gray-50 pt-2">
                  <span className="text-textMuted text-xs">Resolved At</span>
                  <span className="font-semibold text-success text-xs">{formatDateTime(c.resolvedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HOD Assign Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="HOD Staff Assignment">
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
            <p className="text-textMuted"><strong className="text-textMain">Student Dept:</strong> {c.studentDepartmentName || c.departmentName}</p>
            {c.aiSuggestedServiceUnit && (
              <p className="text-primary font-medium flex items-center gap-1">
                <Sparkles size={13} /> AI Suggested Unit: <strong>{c.aiSuggestedServiceUnit}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="label font-semibold text-textMain">Select Target Service Unit</label>
            <select
              className="input-field"
              value={selectedServiceUnit}
              onChange={e => handleServiceUnitChange(e.target.value)}
            >
              {serviceUnits.map(u => (
                <option key={u.code} value={u.code}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label font-semibold text-textMain">Select Staff Member *</label>
            {staffLoading ? (
              <div className="p-3 text-xs text-textMuted flex items-center gap-2">
                <LoadingSpinner size="sm" /> Loading {selectedServiceUnit} staff...
              </div>
            ) : (
              <select
                className="input-field"
                value={selectedStaff}
                onChange={e => setSelectedStaff(e.target.value)}
              >
                <option value="">Choose staff member...</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.serviceUnit || selectedServiceUnit}) - {s.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">HOD Instructions</label>
            <input
              className="input-field"
              placeholder="e.g. Please inspect and resolve today"
              value={assignRemark}
              onChange={e => setAssignRemark(e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowAssign(false)} className="btn-ghost">Cancel</button>
            <button
              onClick={handleAssign}
              disabled={actionLoading || !selectedStaff}
              className="btn-primary"
            >
              {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal open={showResolve} onClose={() => setShowResolve(false)} title="Resolve Complaint">
        <div className="space-y-4">
          <div>
            <label className="label">Resolution Summary *</label>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Describe how the issue was resolved and verified..."
              value={resolveForm.resolutionNotes}
              onChange={e => setResolveForm(p => ({ ...p, resolutionNotes: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Action Taken</label>
            <input
              className="input-field"
              placeholder="e.g. Replaced capacitor and serviced fan bearings"
              value={resolveForm.actionTaken}
              onChange={e => setResolveForm(p => ({ ...p, actionTaken: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Materials / Parts Used</label>
            <input
              className="input-field"
              placeholder="e.g. 2.5uF capacitor, 10A switch"
              value={resolveForm.materialsUsed}
              onChange={e => setResolveForm(p => ({ ...p, materialsUsed: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowResolve(false)} className="btn-ghost">Cancel</button>
            <button
              onClick={handleResolve}
              disabled={actionLoading || !resolveForm.resolutionNotes.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {actionLoading ? 'Saving...' : 'Mark Resolved'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Escalate Modal */}
      <Modal open={showEscalate} onClose={() => setShowEscalate(false)} title="Escalate Complaint to Principal">
        <div className="space-y-4">
          <p className="text-sm text-textMuted">
            Escalating will notify the Principal and Department Head immediately and flag this ticket for expedited operational priority.
          </p>
          <div>
            <label className="label">Reason for Escalation *</label>
            <textarea
              className="input-field min-h-[90px]"
              placeholder="Explain the urgency, delay, safety risk, or lack of resolution..."
              value={escalateReason}
              onChange={e => setEscalateReason(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowEscalate(false)} className="btn-ghost">Cancel</button>
            <button
              onClick={handleEscalate}
              disabled={actionLoading || !escalateReason.trim()}
              className="btn-primary bg-danger hover:bg-red-600 flex items-center gap-2"
            >
              {actionLoading ? 'Escalating...' : 'Confirm Escalation'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

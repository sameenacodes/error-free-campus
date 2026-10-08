import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatusBadge, PriorityBadge, EmptyState, LoadingSpinner, Modal } from '../../components/ui'
import { hodService, complaintService, publicService } from '../../services'
import { formatDate, formatComplaintId, getErrorMessage } from '../../utils/formatters'
import { SERVICE_UNITS } from '../../utils/constants'
import { Building2, ArrowRight, UserPlus, Sparkles, Wrench, Shield, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DepartmentComplaints() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [serviceUnits, setServiceUnits] = useState(SERVICE_UNITS)
  const [selectedServiceUnit, setSelectedServiceUnit] = useState('')
  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [remark, setRemark] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [staffLoading, setStaffLoading] = useState(false)

  const load = () => {
    hodService.getComplaints()
      .then(r => setComplaints(r.data.content || r.data || []))
      .catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    publicService.getServiceUnits().then(r => {
      if (r.data?.length) setServiceUnits(r.data)
    }).catch(() => {})
  }, [])

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint)
    const initialUnit = complaint.serviceUnit || complaint.aiSuggestedServiceUnit || 'MAINTENANCE'
    setSelectedServiceUnit(initialUnit)
    setSelectedStaff('')
    setRemark('')
    fetchStaffForUnit(initialUnit)
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
    setAssignLoading(true)
    try {
      await complaintService.assign(selectedComplaint.id, {
        staffId: parseInt(selectedStaff),
        serviceUnit: selectedServiceUnit,
        remark: remark || `Assigned to ${selectedServiceUnit} staff`
      })
      toast.success('Complaint assigned to service staff successfully!')
      setSelectedComplaint(null)
      setSelectedStaff('')
      setRemark('')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAssignLoading(false)
    }
  }

  if (loading) return <DashboardLayout title="Department Complaints"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Department Complaints">
      {complaints.length === 0 ? (
        <div className="card">
          <EmptyState icon={Building2} title="No complaints" description="No complaints in your department." />
        </div>
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
                    {c.serviceUnit && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Wrench size={11} /> {c.serviceUnitDisplayName || c.serviceUnit}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-textMain text-base truncate">{c.title}</p>
                  <div className="flex items-center gap-2 text-xs text-textMuted mt-1.5 flex-wrap">
                    <span className="font-medium text-textMain">Student: {c.studentName} ({c.studentDepartmentName || 'Department Student'})</span>
                    <span>·</span>
                    <span>Category: {c.categoryName || 'General'}</span>
                    {c.location && <span>· Location: {c.location}</span>}
                    <span>·</span>
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                  {c.aiSuggestedServiceUnit && c.status === 'PENDING' && (
                    <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                      <Sparkles size={12} /> AI Suggested Unit: {c.aiSuggestedServiceUnit}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0 items-center">
                  {c.status === 'PENDING' && (
                    <button
                      onClick={() => openAssignModal(c)}
                      className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3 shadow-sm"
                    >
                      <UserPlus size={14} /> Assign Staff
                    </button>
                  )}
                  <ArrowRight size={16} className="text-textMuted cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/complaints/${c.id}`)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <Modal open={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} title="HOD Review & Staff Assignment">
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-textMuted font-medium">Student:</span>
                <span className="font-semibold text-textMain">{selectedComplaint.studentName} ({selectedComplaint.studentDepartmentName || 'Dept'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted font-medium">Complaint:</span>
                <span className="font-semibold text-textMain max-w-[240px] truncate">{selectedComplaint.title}</span>
              </div>
              {selectedComplaint.aiSuggestedServiceUnit && (
                <div className="flex justify-between items-center text-primary pt-1 border-t border-gray-200/60">
                  <span className="font-medium flex items-center gap-1"><Sparkles size={12} /> AI Suggested Service Unit:</span>
                  <span className="font-bold">{selectedComplaint.aiSuggestedServiceUnit}</span>
                </div>
              )}
            </div>

            <div>
              <label className="label font-semibold text-textMain">Select Target Service Unit / Team</label>
              <select
                className="input-field"
                value={selectedServiceUnit}
                onChange={e => handleServiceUnitChange(e.target.value)}
              >
                {serviceUnits.map(u => (
                  <option key={u.code} value={u.code}>{u.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-textMuted mt-1">Staff members below will be filtered based on this service unit.</p>
            </div>

            <div>
              <label className="label font-semibold text-textMain">Assign To Staff Member *</label>
              {staffLoading ? (
                <div className="p-3 text-xs text-textMuted flex items-center gap-2">
                  <LoadingSpinner size="sm" /> Loading {selectedServiceUnit} staff members...
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
              {staffList.length === 0 && !staffLoading && (
                <p className="text-xs text-amber-600 mt-1">
                  No active staff found for {selectedServiceUnit}. Admin can create staff in User Management.
                </p>
              )}
            </div>

            <div>
              <label className="label">HOD Remark / Instructions (Optional)</label>
              <input
                className="input-field"
                placeholder="e.g. Please inspect AC compressor on priority"
                value={remark}
                onChange={e => setRemark(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setSelectedComplaint(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={handleAssign}
                disabled={assignLoading || !selectedStaff}
                className="btn-primary"
              >
                {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

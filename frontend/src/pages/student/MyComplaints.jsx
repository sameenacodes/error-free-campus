import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatusBadge, PriorityBadge, EmptyState, PageSkeleton } from '../../components/ui'
import { complaintService } from '../../services'
import { formatDate, formatComplaintId } from '../../utils/formatters'
import { FileText, Search, Plus, ArrowRight } from 'lucide-react'

export default function MyComplaints() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    complaintService.getMyComplaints()
      .then(r => setComplaints(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = complaints.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !String(c.id).includes(search)) return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  if (loading) return <DashboardLayout title="My Complaints"><PageSkeleton /></DashboardLayout>

  return (
    <DashboardLayout title="My Complaints">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input className="input-field pl-9" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-white text-textMuted hover:bg-gray-50 border border-gray-200'}`}>
              {s ? s.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={FileText} title={search || statusFilter ? 'No matching complaints' : 'No complaints yet'}
            description={search || statusFilter ? 'Try adjusting your filters.' : 'Create your first complaint to get started.'}
            action={!search && !statusFilter && <button onClick={() => navigate('/student/complaints/new')} className="btn-primary"><Plus size={16} className="mr-1 inline" />Create Complaint</button>} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} onClick={() => navigate(`/student/complaints/${c.id}`)}
              className="card hover:shadow-card-hover cursor-pointer transition-all group p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono text-textMuted">{formatComplaintId(c.id)}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    {c.overdue && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-lg font-medium">Overdue</span>}
                  </div>
                  <p className="font-medium text-textMain truncate">{c.title}</p>
                  <p className="text-xs text-textMuted mt-1">{c.categoryName} · {c.departmentName} · {formatDate(c.createdAt)}</p>
                </div>
                <ArrowRight size={16} className="text-textMuted group-hover:text-primary ml-3 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

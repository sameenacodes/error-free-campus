import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatusBadge, PriorityBadge, EmptyState, LoadingSpinner } from '../../components/ui'
import { adminService } from '../../services'
import { formatDate, formatComplaintId } from '../../utils/formatters'
import { STATUSES, PRIORITIES } from '../../utils/constants'
import { FileText, Search, ArrowRight } from 'lucide-react'

export default function AdminComplaints() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const params = {}
    if (statusFilter) params.status = statusFilter
    adminService.getComplaints(params)
      .then(r => setComplaints(r.data.content || r.data || []))
      .catch(() => {}).finally(() => setLoading(false))
  }, [statusFilter])

  const filtered = complaints.filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()) || String(c.id).includes(search))

  if (loading) return <DashboardLayout title="All Complaints"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="All Complaints">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input className="input-field pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setLoading(true) }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={FileText} title="No complaints" description="No complaints match your criteria." /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} onClick={() => navigate(`/complaints/${c.id}`)} className="card p-4 hover:shadow-card-hover cursor-pointer transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-textMuted">{formatComplaintId(c.id)}</span>
                    <StatusBadge status={c.status} /><PriorityBadge priority={c.priority} />
                  </div>
                  <p className="font-medium text-textMain truncate">{c.title}</p>
                  <p className="text-xs text-textMuted mt-1">{c.studentName} · {c.departmentName} · {formatDate(c.createdAt)}</p>
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

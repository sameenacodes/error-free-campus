import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../components/layout'
import { StatCard, StatusBadge, PriorityBadge, EmptyState, PageSkeleton } from '../../components/ui'
import { studentService, complaintService } from '../../services'
import { formatDate, formatComplaintId } from '../../utils/formatters'
import { FileText, Clock, Loader2, CheckCircle, Plus, ArrowRight } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentService.getDashboard(),
      complaintService.getMyComplaints()
    ]).then(([s, c]) => {
      setStats(s.data)
      setComplaints(c.data.slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Student Dashboard"><PageSkeleton /></DashboardLayout>

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-textMain">Welcome back, {user?.firstName}!</h2>
        <p className="text-textMuted text-sm">Here's an overview of your complaints</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Total Complaints" value={stats?.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="amber" />
        <StatCard icon={Loader2} label="In Progress" value={stats?.inProgress} color="orange" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolved} color="green" />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => navigate('/student/complaints/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Report an Issue
        </button>
        <button onClick={() => navigate('/student/complaints')} className="btn-secondary flex items-center gap-2">
          <FileText size={18} /> View My Complaints
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-textMain">Recent Complaints</h3>
          {complaints.length > 0 && (
            <button onClick={() => navigate('/student/complaints')} className="text-primary text-sm font-medium hover:underline">View All</button>
          )}
        </div>
        {complaints.length === 0 ? (
          <EmptyState icon={FileText} title="No complaints yet" description="Create your first complaint to get started."
            action={<button onClick={() => navigate('/student/complaints/new')} className="btn-primary">+ Create Complaint</button>} />
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c.id} onClick={() => navigate(`/student/complaints/${c.id}`)}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-primary/[0.02] cursor-pointer transition-all group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-textMuted">{formatComplaintId(c.id)}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <p className="font-medium text-textMain text-sm truncate">{c.title}</p>
                  <p className="text-xs text-textMuted mt-0.5">{c.categoryName} · {c.departmentName} · {formatDate(c.createdAt)}</p>
                </div>
                <ArrowRight size={16} className="text-textMuted group-hover:text-primary transition-colors flex-shrink-0 ml-3" />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

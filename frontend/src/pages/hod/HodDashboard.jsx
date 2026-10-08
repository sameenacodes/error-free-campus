import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatCard, PageSkeleton } from '../../components/ui'
import { hodService } from '../../services'
import { Building2, Clock, Loader2, CheckCircle, AlertTriangle, Users } from 'lucide-react'

export default function HodDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hodService.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="HOD Dashboard"><PageSkeleton /></DashboardLayout>

  return (
    <DashboardLayout title="HOD Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Building2} label="Department Complaints" value={stats?.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="amber" />
        <StatCard icon={Loader2} label="In Progress" value={stats?.inProgress} color="orange" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolved} color="green" />
      </div>

      {stats?.staffWorkload?.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2"><Users size={18} className="text-primary" />Staff Workload</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.staffWorkload.map(s => (
              <div key={s.staffId} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="font-medium text-textMain">{s.staffName}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm"><span className="font-semibold text-primary">{s.active}</span> <span className="text-textMuted">active</span></span>
                  <span className="text-sm"><span className="font-semibold text-success">{s.resolved}</span> <span className="text-textMuted">resolved</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => navigate('/hod/complaints')} className="btn-primary">View Department Complaints</button>
        <button onClick={() => navigate('/hod/staff-assignment')} className="btn-secondary">Staff Assignment</button>
      </div>
    </DashboardLayout>
  )
}

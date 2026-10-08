import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatCard, StatusBadge, PriorityBadge, EmptyState, PageSkeleton } from '../../components/ui'
import { staffService } from '../../services'
import { formatDate, formatComplaintId } from '../../utils/formatters'
import { ClipboardList, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    staffService.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Staff Dashboard"><PageSkeleton /></DashboardLayout>

  return (
    <DashboardLayout title="Staff Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardList} label="Total Assigned" value={stats?.total} color="primary" />
        <StatCard icon={ClipboardList} label="Assigned" value={stats?.assigned} color="blue" />
        <StatCard icon={Loader2} label="In Progress" value={stats?.inProgress} color="orange" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolved} color="green" />
      </div>
      <button onClick={() => navigate('/staff/complaints')} className="btn-primary">View Assigned Complaints</button>
    </DashboardLayout>
  )
}

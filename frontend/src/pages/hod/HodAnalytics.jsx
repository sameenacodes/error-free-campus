import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { StatCard, StatusBadge, PriorityBadge, PageSkeleton, EmptyState } from '../../components/ui'
import { hodService } from '../../services'
import { formatDateTime, formatComplaintId, getErrorMessage } from '../../utils/formatters'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Building2, Clock, Loader2, CheckCircle, AlertTriangle, AlertCircle,
  TrendingUp, Users, Tag, ShieldAlert, RefreshCw
} from 'lucide-react'

const COLORS = ['#635BFF', '#4F7CFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function HodAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    hodService.getAnalytics()
      .then(r => setStats(r.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <DashboardLayout title="Department Analytics"><PageSkeleton /></DashboardLayout>

  if (error) {
    return (
      <DashboardLayout title="Department Analytics">
        <div className="card text-center py-12">
          <div className="inline-flex p-3 rounded-full bg-red-50 text-danger mb-3">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-semibold text-textMain mb-1">Failed to load analytics</h3>
          <p className="text-textMuted text-sm mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary inline-flex items-center gap-2 text-sm mx-auto">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <DashboardLayout title="Department Analytics">
        <div className="card">
          <EmptyState
            icon={Building2}
            title="No department complaints found"
            description="Departmental analytics will be calculated once tickets are submitted in your department."
          />
        </div>
      </DashboardLayout>
    )
  }

  const catData = stats.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value })) : []
  const priorityData = stats.byPriority ? Object.entries(stats.byPriority).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })) : []
  const statusData = stats.byStatus ? Object.entries(stats.byStatus).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })) : []
  const staffData = stats.staffWorkload || []
  const criticalList = stats.criticalComplaintsSummary || []
  const trendData = stats.monthlyTrend || []

  return (
    <DashboardLayout title="Department Analytics">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-textMain">Department Operations & Performance</h2>
          <p className="text-textMuted text-sm">Real-time complaint telemetry and staff capacity for your department</p>
        </div>
        <button onClick={loadData} className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard icon={Building2} label="Total Tickets" value={stats.total} color="primary" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="amber" />
        <StatCard icon={Users} label="Assigned" value={stats.assigned} color="blue" />
        <StatCard icon={Loader2} label="In Progress" value={stats.inProgress} color="orange" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="green" />
        <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} color="red" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Monthly Ticket Intake
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(60,60,120,0.12)' }}
                labelFormatter={(v, item) => item?.[0]?.payload?.month || v}
              />
              <Line type="monotone" dataKey="count" name="Complaints" stroke="#635BFF" strokeWidth={3} dot={{ r: 4, fill: '#635BFF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <Tag size={18} className="text-secondary" /> Issues by Category
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={catData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-20} textAnchor="end" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="value" name="Count" fill="#635BFF" radius={[6, 6, 0, 0]}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Capacity & Critical issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Workload */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <Users size={18} className="text-primary" /> Department Staff Workload
          </h3>
          {staffData.length === 0 ? (
            <p className="text-sm text-textMuted">No staff assigned to this department yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={staffData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="staffName" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" />
                <Bar dataKey="active" name="Active" fill="#635BFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Critical Issues */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-textMain flex items-center gap-2">
              <ShieldAlert size={18} className="text-danger" /> Urgent Department Issues
            </h3>
            <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-lg font-semibold">
              {criticalList.length} Critical
            </span>
          </div>
          {criticalList.length === 0 ? (
            <p className="text-sm text-textMuted">No urgent or critical issues pending in department.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[240px] pr-1">
              {criticalList.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-red-50/50 border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold text-textMuted">{formatComplaintId(item.id)}</span>
                    <span className="text-[10px] uppercase font-bold text-red-600 px-1.5 py-0.5 bg-white rounded border border-red-200">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-textMain">{item.title}</p>
                  <p className="text-xs text-textMuted mt-1">{item.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { StatCard, StatusBadge, PriorityBadge, PageSkeleton, EmptyState } from '../../components/ui'
import { principalService } from '../../services'
import { formatDateTime, formatComplaintId, getErrorMessage } from '../../utils/formatters'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  FileText, Clock, Loader2, CheckCircle, AlertTriangle, AlertCircle,
  TrendingUp, Building2, Tag, ShieldAlert, Activity, CheckCheck, RefreshCw
} from 'lucide-react'

const COLORS = ['#635BFF', '#4F7CFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#64748B']
const PRIORITY_COLOR_MAP = {
  LOW: '#22C55E',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  CRITICAL: '#EF4444'
}

export default function PrincipalAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    principalService.getAnalytics()
      .then(r => setStats(r.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout title="Principal Analytics">
        <PageSkeleton />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Principal Analytics">
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
      <DashboardLayout title="Principal Analytics">
        <div className="card">
          <EmptyState
            icon={TrendingUp}
            title="No analytics data available yet"
            description="Analytics will automatically compute and populate once complaints are recorded."
          />
        </div>
      </DashboardLayout>
    )
  }

  // Chart datasets
  const deptData = stats.byDepartment ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value })) : []
  const catData = stats.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value })) : []
  const priorityData = stats.byPriority ? Object.entries(stats.byPriority).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })) : []
  const statusData = stats.byStatus ? Object.entries(stats.byStatus).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })) : []
  const trendData = stats.monthlyTrend || []
  const staffData = stats.staffWorkload || []
  const topUnresolved = stats.topUnresolvedDepartments || []
  const criticalList = stats.criticalComplaintsSummary || []
  const recentActs = stats.recentActivity || []

  return (
    <DashboardLayout title="Principal Analytics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-textMain">College-Wide Analytics & Intelligence</h2>
          <p className="text-textMuted text-sm">Real-time complaint telemetry, SLA metrics, and operational performance</p>
        </div>
        <button onClick={loadData} className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* A. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <StatCard icon={FileText} label="Total" value={stats.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={Loader2} label="In Progress" value={stats.inProgress} color="orange" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="green" />
        <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} color="red" />
        <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="red" />
        <StatCard icon={TrendingUp} label="Resolution" value={`${stats.resolutionRate ?? 0}%`} color="blue" />
        <StatCard icon={Activity} label="Avg Time" value={`${stats.averageResolutionHours ?? 0}h`} color="purple" />
      </div>

      {/* G. Resolution Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="card p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Resolution Rate</p>
          <p className="text-2xl font-bold text-textMain">{stats.resolutionRate ?? 0}%</p>
          <p className="text-xs text-textMuted mt-1">{stats.resolved} of {stats.total} total resolved</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">SLA Compliance</p>
          <p className="text-2xl font-bold text-textMain">{stats.slaComplianceRate ?? 100}%</p>
          <p className="text-xs text-textMuted mt-1">Resolved within targeted deadline</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Resolved This Month</p>
          <p className="text-2xl font-bold text-textMain">{stats.resolvedThisMonth ?? 0}</p>
          <p className="text-xs text-textMuted mt-1">Current calendar month</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Average Resolution</p>
          <p className="text-2xl font-bold text-textMain">{stats.averageResolutionHours ?? 0} hrs</p>
          <p className="text-xs text-textMuted mt-1">From ticket creation to closure</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/20">
          <p className="text-xs font-semibold text-danger uppercase tracking-wider mb-1">Active Escalations</p>
          <p className="text-2xl font-bold text-textMain">{stats.escalated ?? 0}</p>
          <p className="text-xs text-textMuted mt-1">Awaiting principal intervention</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* B. Monthly Complaint Trend (All 12 Months) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-textMain flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Monthly Complaint Trend (Annual)
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">All 12 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(60,60,120,0.12)' }}
                labelFormatter={(v, item) => item?.[0]?.payload?.month || v}
              />
              <Line type="monotone" dataKey="count" name="Complaints" stroke="#635BFF" strokeWidth={3} dot={{ r: 4, fill: '#635BFF' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* C. Complaints by Department (Horizontal Layout with Zero Overlap) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-textMain flex items-center gap-2">
              <Building2 size={18} className="text-primary" /> Complaints by Department
            </h3>
            <span className="text-xs text-textMuted">Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: '#172033' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(60,60,120,0.12)' }} />
              <Bar dataKey="value" name="Complaints" fill="#635BFF" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* F. Complaints by Category */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-textMain flex items-center gap-2">
              <Tag size={18} className="text-secondary" /> Complaints by Category
            </h3>
            <span className="text-xs text-textMuted">{catData.length} Categories</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={catData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-25} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(60,60,120,0.12)' }} />
              <Bar dataKey="value" name="Count" fill="#4F7CFF" radius={[6, 6, 0, 0]}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* D & E. Status and Priority Distributions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status Breakdown */}
          <div className="card">
            <h4 className="font-semibold text-textMain text-sm mb-3">Complaints by Status</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.name === 'Resolved' ? '#22C55E' : entry.name === 'Escalated' ? '#EF4444' : COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Breakdown */}
          <div className="card">
            <h4 className="font-semibold text-textMain text-sm mb-3">Complaints by Priority</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={PRIORITY_COLOR_MAP[entry.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables & Deep Dive Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* H. Top Departments with Unresolved Complaints */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Unresolved Backlog by Dept
          </h3>
          {topUnresolved.length === 0 ? (
            <p className="text-sm text-textMuted">No unresolved complaints. All clear!</p>
          ) : (
            <div className="space-y-3">
              {topUnresolved.map((dept, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-medium text-textMain text-sm">{dept.department}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                    {dept.unresolvedCount} pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* I. Critical Complaint Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-textMain flex items-center gap-2">
              <ShieldAlert size={18} className="text-danger" /> Critical Complaints
            </h3>
            <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-lg font-semibold border border-red-200">
              {criticalList.length} Active
            </span>
          </div>
          {criticalList.length === 0 ? (
            <p className="text-sm text-textMuted">No active critical complaints requiring safety protocol.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
              {criticalList.map(crit => (
                <div key={crit.id} className="p-3 rounded-xl bg-red-50/50 border border-red-100 hover:border-red-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold text-textMuted">{formatComplaintId(crit.id)}</span>
                    <span className="text-[10px] uppercase font-bold text-red-600 px-1.5 py-0.5 bg-white rounded border border-red-200">
                      {crit.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-textMain leading-snug">{crit.title}</p>
                  <p className="text-xs text-textMuted mt-1">{crit.department} · {crit.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* J. Recent Activity Feed */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Recent System Activity
          </h3>
          {recentActs.length === 0 ? (
            <p className="text-sm text-textMuted">No recent transitions recorded.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
              {recentActs.slice(0, 5).map(act => (
                <div key={act.id} className="flex gap-2.5 items-start pb-2 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-textMain truncate">
                      {act.complaintTitle}
                    </p>
                    <p className="text-[11px] text-textMuted">
                      <span className="font-semibold text-primary">{act.toStatus}</span> by {act.changedBy}
                    </p>
                    <p className="text-[10px] text-textMuted/70">{formatDateTime(act.changedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Staff Workload Capacity */}
      {staffData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <CheckCheck size={18} className="text-primary" /> Maintenance Staff Resolution Performance
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={staffData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="staffName" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(60,60,120,0.12)' }} />
              <Legend iconType="circle" />
              <Bar dataKey="active" name="Active / In Progress" fill="#635BFF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Successfully Resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardLayout>
  )
}

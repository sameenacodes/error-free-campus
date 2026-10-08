import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { StatCard, StatusBadge, PriorityBadge, PageSkeleton, EmptyState } from '../../components/ui'
import { adminService } from '../../services'
import { formatDateTime, formatComplaintId, getErrorMessage } from '../../utils/formatters'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  FileText, Users, Clock, Loader2, CheckCircle, AlertTriangle, AlertCircle,
  TrendingUp, Building2, Tag, Shield, Download, RefreshCw, Activity, CheckCheck
} from 'lucide-react'

const COLORS = ['#635BFF', '#4F7CFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316']

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    adminService.getAnalytics()
      .then(r => setStats(r.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const exportCSV = () => {
    if (!stats) return
    const rows = [
      ['Metric', 'Value'],
      ['Total Complaints', stats.total || 0],
      ['Pending Complaints', stats.pending || 0],
      ['In Progress Complaints', stats.inProgress || 0],
      ['Resolved Complaints', stats.resolved || 0],
      ['Critical Complaints', stats.critical || 0],
      ['Overdue Complaints', stats.overdue || 0],
      ['Resolution Rate (%)', stats.resolutionRate || 0],
      ['Average Resolution Time (Hours)', stats.averageResolutionHours || 0],
      ['SLA Compliance Rate (%)', stats.slaComplianceRate || 0],
      ['Active Escalations', stats.escalated || 0],
    ]

    let csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `campus_analytics_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <DashboardLayout title="Admin Analytics">
        <PageSkeleton />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Admin Analytics">
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
      <DashboardLayout title="Admin Analytics">
        <div className="card">
          <EmptyState
            icon={TrendingUp}
            title="No system analytics data available yet"
            description="System telemetry will compute automatically as complaints are submitted and processed."
          />
        </div>
      </DashboardLayout>
    )
  }

  const deptData = stats.byDepartment ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value })) : []
  const catData = stats.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value })) : []
  const priorityData = stats.byPriority ? Object.entries(stats.byPriority).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })) : []
  const statusData = stats.byStatus ? Object.entries(stats.byStatus).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })) : []
  const trendData = stats.monthlyTrend || []
  const userStats = stats.userStatsByRole ? Object.entries(stats.userStatsByRole).map(([role, count]) => ({ role, count })) : []
  const deptPerf = stats.departmentPerformance || []
  const staffData = stats.staffWorkload || []
  const recentActs = stats.recentActivity || []

  return (
    <DashboardLayout title="Admin Analytics">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-textMain">System-Wide Operational Analytics</h2>
          <p className="text-textMuted text-sm">Comprehensive metrics across all users, departments, and complaint categories</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={exportCSV} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download size={14} /> Export CSV Report
          </button>
          <button onClick={loadData} className="btn-primary text-xs flex items-center gap-1.5">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <StatCard icon={FileText} label="Total Tickets" value={stats.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={Loader2} label="In Progress" value={stats.inProgress} color="orange" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="green" />
        <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} color="red" />
        <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="red" />
        <StatCard icon={TrendingUp} label="Resolution" value={`${stats.resolutionRate ?? 0}%`} color="blue" />
        <StatCard icon={Activity} label="Avg Time" value={`${stats.averageResolutionHours ?? 0}h`} color="purple" />
      </div>

      {/* User Statistics by Role */}
      {userStats.length > 0 && (
        <div className="card mb-6 p-4">
          <h3 className="font-semibold text-textMain text-sm mb-3 flex items-center gap-2">
            <Users size={16} className="text-primary" /> Active Users by Institutional Role
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {userStats.map(u => (
              <div key={u.role} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-textMuted font-medium">{u.role}</p>
                  <p className="text-xl font-bold text-textMain mt-0.5">{u.count}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {u.role.slice(0, 3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends & Department Horizontal Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-textMain flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Annual Complaint Volume Trend
            </h3>
            <span className="text-xs text-textMuted">Jan - Dec</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
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

        {/* Complaints by Department */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-textMain flex items-center gap-2">
              <Building2 size={18} className="text-primary" /> Complaints by Department
            </h3>
            <span className="text-xs text-textMuted">Volume</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: '#172033' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="value" name="Complaints" fill="#4F7CFF" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category, Status, Priority breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="card">
          <h4 className="font-semibold text-textMain text-sm mb-3 flex items-center gap-2">
            <Tag size={16} className="text-primary" /> Category Distribution
          </h4>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h4 className="font-semibold text-textMain text-sm mb-3">Complaints by Status</h4>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.name === 'Resolved' ? '#22C55E' : entry.name === 'Escalated' ? '#EF4444' : COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h4 className="font-semibold text-textMain text-sm mb-3">Complaints by Priority</h4>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.name === 'CRITICAL' ? '#EF4444' : entry.name === 'HIGH' ? '#F97316' : entry.name === 'MEDIUM' ? '#F59E0B' : '#22C55E'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance Table */}
      {deptPerf.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-primary" /> Department Resolution Performance Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-textMuted border-b border-gray-100">
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium text-center">Total</th>
                  <th className="pb-3 font-medium text-center">Pending</th>
                  <th className="pb-3 font-medium text-center">Resolved</th>
                  <th className="pb-3 font-medium text-center">Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {deptPerf.map(dp => (
                  <tr key={dp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-textMain">{dp.name}</td>
                    <td className="py-3 text-textMuted font-mono text-xs">{dp.code}</td>
                    <td className="py-3 text-center font-semibold text-textMain">{dp.total}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                        {dp.pending}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        {dp.resolved}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-textMain text-xs">{dp.resolutionRate}%</span>
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${dp.resolutionRate}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Workload */}
        {staffData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
              <CheckCheck size={18} className="text-primary" /> Staff Workload & Capacity
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={staffData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="staffName" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="active" name="Active" fill="#635BFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Recent Complaint Audit Activity
          </h3>
          {recentActs.length === 0 ? (
            <p className="text-sm text-textMuted">No recent transitions recorded.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[240px] pr-1">
              {recentActs.slice(0, 6).map(act => (
                <div key={act.id} className="flex gap-2.5 items-start pb-2 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-textMain truncate">{act.complaintTitle}</p>
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
    </DashboardLayout>
  )
}

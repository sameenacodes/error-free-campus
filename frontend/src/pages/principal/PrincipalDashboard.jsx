import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatCard, PageSkeleton } from '../../components/ui'
import { principalService } from '../../services'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileText, Clock, Loader2, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

const COLORS = ['#635BFF', '#4F7CFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function PrincipalDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    principalService.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Principal Dashboard"><PageSkeleton /></DashboardLayout>

  const deptData = stats?.byDepartment ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value })) : []
  const catData = stats?.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value })) : []
  const statusData = stats?.byStatus ? Object.entries(stats.byStatus).filter(([,v]) => v > 0).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })) : []
  const trendData = stats?.monthlyTrend || []

  return (
    <DashboardLayout title="Principal Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-textMain">College Overview</h2>
        <p className="text-textMuted text-sm">Real-time complaint analytics across all departments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={FileText} label="Total" value={stats?.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="amber" />
        <StatCard icon={Loader2} label="In Progress" value={stats?.inProgress} color="orange" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolved} color="green" />
        <StatCard icon={AlertTriangle} label="Critical" value={stats?.critical} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary" />Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(60,60,120,0.12)' }} />
              <Line type="monotone" dataKey="count" stroke="#635BFF" strokeWidth={2.5} dot={{ r: 4, fill: '#635BFF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By Department */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4">Complaints by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(60,60,120,0.12)' }} />
              <Bar dataKey="value" fill="#635BFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Category */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Status */}
        <div className="card">
          <h3 className="font-semibold text-textMain mb-4">Complaints by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/principal/complaints')} className="btn-primary">View All Complaints</button>
        <button onClick={() => navigate('/principal/analytics')} className="btn-secondary">Full Analytics</button>
        <button onClick={() => navigate('/principal/escalations')} className="btn-secondary">Escalations</button>
      </div>
    </DashboardLayout>
  )
}

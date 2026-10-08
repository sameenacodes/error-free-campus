import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { StatCard, PageSkeleton } from '../../components/ui'
import { adminService } from '../../services'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, Users, Clock, CheckCircle, AlertTriangle, Shield, Building2, Tag, BarChart3 } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Admin Dashboard"><PageSkeleton /></DashboardLayout>

  const deptData = stats?.byDepartment ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value })) : []

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-textMain">System Overview</h2>
        <p className="text-textMuted text-sm">Complete system-wide statistics and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Complaints" value={stats?.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="amber" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolved} color="green" />
        <StatCard icon={AlertTriangle} label="Critical" value={stats?.critical} color="red" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdue} color="red" />
      </div>

      <div className="card mb-8">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Manage Users', path: '/admin/users', desc: 'Create, edit, and manage user accounts' },
          { icon: Building2, label: 'Departments', path: '/admin/departments', desc: 'Manage college departments' },
          { icon: Tag, label: 'Categories', path: '/admin/categories', desc: 'Manage complaint categories' },
          { icon: FileText, label: 'All Complaints', path: '/admin/complaints', desc: 'View and manage all complaints' },
          { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', desc: 'Advanced analytics and reports' },
          { icon: Shield, label: 'Audit Logs', path: '/admin/audit-logs', desc: 'View system activity logs' },
        ].map(item => (
          <div key={item.path} onClick={() => navigate(item.path)}
            className="card p-4 hover:shadow-card-hover cursor-pointer transition-all group">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-medium text-textMain">{item.label}</p>
                <p className="text-xs text-textMuted mt-0.5">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}

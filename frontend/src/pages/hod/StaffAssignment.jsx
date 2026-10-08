import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingSpinner } from '../../components/ui'
import { hodService } from '../../services'
import { Users } from 'lucide-react'

export default function StaffAssignment() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hodService.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Staff Assignment"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Staff Assignment">
      <div className="card">
        <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2"><Users size={18} className="text-primary" />Staff Workload Overview</h3>
        {stats?.staffWorkload?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-textMuted border-b border-gray-100">
                <th className="pb-3 font-medium">Staff Member</th>
                <th className="pb-3 font-medium text-center">Active</th>
                <th className="pb-3 font-medium text-center">Resolved</th>
                <th className="pb-3 font-medium text-center">Workload</th>
              </tr></thead>
              <tbody>
                {stats.staffWorkload.map(s => (
                  <tr key={s.staffId} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-textMain">{s.staffName}</td>
                    <td className="py-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{s.active}</span></td>
                    <td className="py-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">{s.resolved}</span></td>
                    <td className="py-3 text-center">
                      <div className="w-24 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (s.active / 10) * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-textMuted text-sm">No staff data available.</p>
        )}
      </div>
    </DashboardLayout>
  )
}

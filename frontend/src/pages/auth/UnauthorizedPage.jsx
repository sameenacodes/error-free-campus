import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 text-danger mb-6"><ShieldX size={40} /></div>
        <h1 className="text-2xl font-bold text-textMain mb-2">Access Denied</h1>
        <p className="text-textMuted mb-6">You don't have permission to access this page.</p>
        <Link to="/" className="btn-primary inline-flex">Go to Dashboard</Link>
      </div>
    </div>
  )
}

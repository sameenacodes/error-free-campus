import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants'

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || STATUS_COLORS.PENDING
  const label = status ? status.replace(/_/g, ' ') : 'Unknown'
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${cls}`}>{label}</span>
}

export function PriorityBadge({ priority }) {
  const cls = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${cls}`}>{priority}</span>
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
}

export function StatCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-textMuted font-medium">{label}</p>
          <p className="text-3xl font-bold text-textMain mt-1">{value ?? 0}</p>
          {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.primary}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 text-primary/40 mb-4">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-textMain">{title}</h3>
      <p className="text-textMuted text-sm mt-1 max-w-md mx-auto">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${s} border-2 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  )
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-dropdown ${maxWidth} w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-textMain">{title}</h3>
            <button onClick={onClose} className="text-textMuted hover:text-textMain p-1 rounded-lg hover:bg-gray-100"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  )
}

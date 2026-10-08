export const ROLES = { STUDENT: 'STUDENT', STAFF: 'STAFF', HOD: 'HOD', PRINCIPAL: 'PRINCIPAL', ADMIN: 'ADMIN' }
export const STATUSES = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED']
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
export const STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 border-orange-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REOPENED: 'bg-purple-50 text-purple-700 border-purple-200',
  CLOSED: 'bg-gray-50 text-gray-500 border-gray-200',
}
export const PRIORITY_COLORS = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
}
export const ROLE_PATHS = {
  STUDENT: '/student/dashboard', STAFF: '/staff/dashboard',
  HOD: '/hod/dashboard', PRINCIPAL: '/principal/dashboard', ADMIN: '/admin/dashboard',
}
export const SERVICE_UNITS = [
  { code: 'LIBRARY', name: 'Library Services' },
  { code: 'HOSTEL', name: 'Hostel & Residential' },
  { code: 'IT_SUPPORT', name: 'IT & Network Support' },
  { code: 'LAB_SUPPORT', name: 'Laboratory Technical Support' },
  { code: 'ELECTRICAL', name: 'Electrical Maintenance' },
  { code: 'PLUMBING', name: 'Plumbing & Water Supply' },
  { code: 'MAINTENANCE', name: 'General Campus Maintenance' },
  { code: 'TRANSPORT', name: 'Campus Transport' },
  { code: 'SECURITY', name: 'Campus Security' },
  { code: 'ADMINISTRATION', name: 'Administrative Services' },
  { code: 'OTHER', name: 'Other Services' }
]

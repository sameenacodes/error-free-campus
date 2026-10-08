import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'MMM d, yyyy') } catch { return dateStr }
}
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'MMM d, yyyy h:mm a') } catch { return dateStr }
}
export function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }) } catch { return dateStr }
}
export function formatComplaintId(id) {
  return `#${String(id).padStart(3, '0')}`
}
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message === 'Network Error') return 'Unable to connect to server. Please check your connection.'
  return 'An unexpected error occurred. Please try again.'
}
export function getConfidenceLabel(val) {
  if (!val) return ''
  const pct = Math.round(val * 100)
  return `${pct}%`
}

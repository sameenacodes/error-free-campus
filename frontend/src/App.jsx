import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ROLE_PATHS } from './utils/constants'
import { LoadingSpinner } from './components/ui'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import UnauthorizedPage from './pages/auth/UnauthorizedPage'
import StudentDashboard from './pages/student/StudentDashboard'
import CreateComplaint from './pages/student/CreateComplaint'
import MyComplaints from './pages/student/MyComplaints'
import ComplaintDetails from './pages/student/ComplaintDetails'
import StaffDashboard from './pages/staff/StaffDashboard'
import AssignedComplaints from './pages/staff/AssignedComplaints'
import HodDashboard from './pages/hod/HodDashboard'
import DepartmentComplaints from './pages/hod/DepartmentComplaints'
import StaffAssignment from './pages/hod/StaffAssignment'
import HodAnalytics from './pages/hod/HodAnalytics'
import PrincipalDashboard from './pages/principal/PrincipalDashboard'
import AllComplaints from './pages/principal/AllComplaints'
import PrincipalAnalytics from './pages/principal/PrincipalAnalytics'
import Escalations from './pages/principal/Escalations'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import DepartmentManagement from './pages/admin/DepartmentManagement'
import CategoryManagement from './pages/admin/CategoryManagement'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AuditLogs from './pages/admin/AuditLogs'
import NotificationsPage from './pages/shared/NotificationsPage'
import ProfilePage from './pages/shared/ProfilePage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_PATHS[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* STUDENT ROUTES */}
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/complaints" element={<ProtectedRoute roles={['STUDENT']}><MyComplaints /></ProtectedRoute>} />
      <Route path="/student/complaints/new" element={<ProtectedRoute roles={['STUDENT']}><CreateComplaint /></ProtectedRoute>} />
      <Route path="/student/complaints/:id" element={<ProtectedRoute roles={['STUDENT']}><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute roles={['STUDENT']}><NotificationsPage /></ProtectedRoute>} />

      {/* STAFF ROUTES */}
      <Route path="/staff/dashboard" element={<ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/complaints" element={<ProtectedRoute roles={['STAFF']}><AssignedComplaints /></ProtectedRoute>} />
      <Route path="/staff/complaints/:id" element={<ProtectedRoute roles={['STAFF']}><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/staff/notifications" element={<ProtectedRoute roles={['STAFF']}><NotificationsPage /></ProtectedRoute>} />

      {/* HOD ROUTES */}
      <Route path="/hod/dashboard" element={<ProtectedRoute roles={['HOD']}><HodDashboard /></ProtectedRoute>} />
      <Route path="/hod/complaints" element={<ProtectedRoute roles={['HOD']}><DepartmentComplaints /></ProtectedRoute>} />
      <Route path="/hod/complaints/:id" element={<ProtectedRoute roles={['HOD']}><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/hod/staff-assignment" element={<ProtectedRoute roles={['HOD']}><StaffAssignment /></ProtectedRoute>} />
      <Route path="/hod/analytics" element={<ProtectedRoute roles={['HOD']}><HodAnalytics /></ProtectedRoute>} />
      <Route path="/hod/notifications" element={<ProtectedRoute roles={['HOD']}><NotificationsPage /></ProtectedRoute>} />

      {/* PRINCIPAL ROUTES */}
      <Route path="/principal/dashboard" element={<ProtectedRoute roles={['PRINCIPAL']}><PrincipalDashboard /></ProtectedRoute>} />
      <Route path="/principal/complaints" element={<ProtectedRoute roles={['PRINCIPAL']}><AllComplaints /></ProtectedRoute>} />
      <Route path="/principal/complaints/:id" element={<ProtectedRoute roles={['PRINCIPAL']}><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/principal/analytics" element={<ProtectedRoute roles={['PRINCIPAL']}><PrincipalAnalytics /></ProtectedRoute>} />
      <Route path="/principal/escalations" element={<ProtectedRoute roles={['PRINCIPAL']}><Escalations /></ProtectedRoute>} />
      <Route path="/principal/notifications" element={<ProtectedRoute roles={['PRINCIPAL']}><NotificationsPage /></ProtectedRoute>} />

      {/* ADMIN ROUTES */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute roles={['ADMIN']}><DepartmentManagement /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute roles={['ADMIN']}><CategoryManagement /></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute roles={['ADMIN']}><AdminComplaints /></ProtectedRoute>} />
      <Route path="/admin/complaints/:id" element={<ProtectedRoute roles={['ADMIN']}><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute roles={['ADMIN']}><NotificationsPage /></ProtectedRoute>} />

      {/* SHARED GENERAL ROUTES */}
      <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* FALLBACK REDIRECT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

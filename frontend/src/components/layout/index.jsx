import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationService } from '../../services'
import {
  LayoutDashboard, Plus, FileText, Bell, User, ClipboardList, Building2, Users,
  BarChart3, AlertTriangle, Shield, Tag, Settings, ChevronLeft, ChevronRight,
  Search, LogOut, Menu, X, CheckCircle2
} from 'lucide-react'

const NAV = {
  STUDENT: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'Report Issue', icon: Plus, path: '/student/complaints/new' },
    { label: 'My Complaints', icon: FileText, path: '/student/complaints' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],
  STAFF: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
    { label: 'Assigned Complaints', icon: ClipboardList, path: '/staff/complaints' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],
  HOD: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/hod/dashboard' },
    { label: 'Dept Complaints', icon: Building2, path: '/hod/complaints' },
    { label: 'Staff Assignment', icon: Users, path: '/hod/staff-assignment' },
    { label: 'Analytics', icon: BarChart3, path: '/hod/analytics' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],
  PRINCIPAL: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/principal/dashboard' },
    { label: 'All Complaints', icon: FileText, path: '/principal/complaints' },
    { label: 'Analytics', icon: BarChart3, path: '/principal/analytics' },
    { label: 'Escalations', icon: AlertTriangle, path: '/principal/escalations' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Departments', icon: Building2, path: '/admin/departments' },
    { label: 'Categories', icon: Tag, path: '/admin/categories' },
    { label: 'Complaints', icon: FileText, path: '/admin/complaints' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Audit Logs', icon: Shield, path: '/admin/audit-logs' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],
}

function Logo({ collapsed }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
        <CheckCircle2 size={20} className="text-white" />
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-textMain leading-tight tracking-tight">Error-Free</p>
          <p className="text-xs font-semibold text-primary leading-tight">Campus</p>
        </div>
      )}
    </Link>
  )
}

export function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth()
  const location = useLocation()
  const items = NAV[user?.role] || []

  return (
    <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-white border-r border-gray-100 z-30 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      <div className="h-16 flex items-center px-4 border-b border-gray-50">
        <Logo collapsed={collapsed} />
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full justify-center text-textMuted hover:text-textMain"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}

export function MobileSidebar({ open, setOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV[user?.role] || []

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-2xl animate-slide-in flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-50">
            <Logo collapsed={false} />
            <button onClick={() => setOpen(false)} className="p-2 text-textMuted hover:text-textMain">
              <X size={20} />
            </button>
          </div>
          <nav className="py-4 px-3 space-y-1">
            {items.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="sidebar-link"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="sidebar-link w-full text-danger hover:bg-red-50"
          >
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function Header({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [showMobile, setShowMobile] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    notificationService.getUnreadCount().then(r => setUnread(r.data.count)).catch(() => {})
    const interval = setInterval(() => {
      notificationService.getUnreadCount().then(r => setUnread(r.data.count)).catch(() => {})
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <MobileSidebar open={showMobile} setOpen={setShowMobile} />
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobile(true)}
            className="lg:hidden p-2 text-textMuted hover:text-textMain rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-textMain">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 text-textMuted hover:text-textMain rounded-xl hover:bg-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-textMain leading-tight">{user?.fullName}</p>
                <p className="text-[11px] text-textMuted leading-tight">{user?.role}</p>
              </div>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-dropdown border border-gray-100 py-1 animate-fade-in z-50">
                <Link
                  to="/profile"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-textMain hover:bg-gray-50"
                >
                  <User size={16} className="text-textMuted" /> Institutional Profile
                </Link>
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export function DashboardLayout({ title, children }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <Header title={title} />
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}

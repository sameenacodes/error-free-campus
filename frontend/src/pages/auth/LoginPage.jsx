import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_PATHS } from '../../utils/constants'
import { getErrorMessage } from '../../utils/formatters'
import { Eye, EyeOff, CheckCircle2, GraduationCap, Shield, Zap, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail)
      setSuccessMsg('Account created successfully! Please login with your password.')
    }
  }, [location.state])

  if (user) {
    navigate(ROLE_PATHS[user.role] || '/')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const userData = await login(email.trim().toLowerCase(), password)
      toast.success(`Welcome back, ${userData.firstName}!`)
      navigate(ROLE_PATHS[userData.role] || '/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (em, pw) => {
    setEmail(em)
    setPassword(pw)
    setError('')
    setSuccessMsg('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-600 to-secondary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Error-Free Campus</p>
              <p className="text-white/60 text-xs">AI-Powered Complaint Management</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Smarter Complaints.<br />
            Faster Resolution.<br />
            Better Campus.
          </h2>
          <p className="text-white/70 text-base max-w-md">
            A modern, AI-powered complaint management system built for educational institutions.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: Zap, text: 'AI-powered complaint analysis & categorization' },
            { icon: Shield, text: 'Role-based dashboards for all stakeholders' },
            { icon: GraduationCap, text: 'End-to-end complaint lifecycle tracking' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <f.icon size={16} />
              </div>
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <CheckCircle2 size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-textMain">Error-Free Campus</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-textMain mb-1">Welcome back</h1>
          <p className="text-textMuted text-sm mb-8">Sign in to your account to continue</p>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Student Registration Link */}
          <div className="mt-5 p-3.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-textMain">New Student?</p>
                <p className="text-[11px] text-textMuted">Register your campus account</p>
              </div>
            </div>
            <Link
              to="/register"
              className="text-xs font-bold text-primary hover:text-primary-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-primary/20 hover:bg-primary hover:text-white transition-all"
            >
              Register
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-medium text-textMuted mb-3 uppercase tracking-wider">
              Demo Credentials
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: 'Student', email: 'student@college.edu', pw: 'Student@123' },
                { label: 'Staff', email: 'staff@college.edu', pw: 'Staff@123' },
                { label: 'HOD', email: 'hod@college.edu', pw: 'Hod@123' },
                { label: 'Principal', email: 'principal@college.edu', pw: 'Principal@123' },
                { label: 'Admin', email: 'admin@college.edu', pw: 'Admin@123' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => demoLogin(d.email, d.pw)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-primary/5 text-textMuted hover:text-primary transition-colors"
                >
                  <span className="font-medium">{d.label}</span>
                  <span className="text-textMuted/50">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

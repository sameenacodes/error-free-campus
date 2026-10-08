import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService, publicService } from '../../services'
import { ROLE_PATHS } from '../../utils/constants'
import { getErrorMessage } from '../../utils/formatters'
import { Eye, EyeOff, CheckCircle2, GraduationCap, Shield, Zap, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    phone: '',
    departmentId: '',
    password: '',
    confirmPassword: '',
  })

  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    navigate(ROLE_PATHS[user.role] || '/')
    return null
  }

  useEffect(() => {
    publicService.getDepartments()
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.content || [])
        setDepartments(list)
      })
      .catch(err => {
        console.error('Failed to load departments', err)
        setError('Failed to load academic departments. Please check server connection.')
      })
      .finally(() => setLoadingDepts(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 6) score++
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500 text-red-600' }
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500 text-amber-600' }
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500 text-blue-600' }
    return { score: 4, label: 'Strong', color: 'bg-emerald-500 text-emerald-600' }
  }

  const strength = getPasswordStrength(form.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validations
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please provide your full first and last name.')
      return
    }

    if (!form.email.trim()) {
      setError('Please provide a valid email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address format.')
      return
    }

    if (!form.studentId.trim()) {
      setError('Please enter your Student ID / Roll Number (e.g., 23CS001).')
      return
    }

    if (!form.departmentId) {
      setError('Please select your Academic Department.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        studentId: form.studentId.trim(),
        phone: form.phone.trim() || null,
        departmentId: Number(form.departmentId),
        password: form.password,
      }

      await authService.register(payload)
      toast.success('Account created successfully! Please login with your new credentials.')
      navigate('/login', { state: { registeredEmail: form.email.trim().toLowerCase() } })
    } catch (err) {
      setError(getErrorMessage(err) || 'Registration failed. Please check the form and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary via-primary-600 to-secondary p-12 flex-col justify-between relative overflow-hidden">
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
            Join Error-Free Campus Today.
          </h2>
          <p className="text-white/70 text-base max-w-md">
            Register your student account to submit issues, track real-time resolution from your Department HOD and service units, and get instant notifications.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: GraduationCap, text: 'Auto-routed to your Department HOD' },
            { icon: Zap, text: 'AI-assisted classification & priority scoring' },
            { icon: Shield, text: 'Direct accountability with campus service staff' },
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

      {/* Right - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-surface overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <CheckCircle2 size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-textMain">Error-Free Campus</p>
                <p className="text-xs text-textMuted">Student Portal Registration</p>
              </div>
            </div>
            <Link to="/login" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-textMain mb-1">Create Student Account</h1>
            <p className="text-textMuted text-sm">
              Enter your student information to register for campus complaint management.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-start gap-2.5">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="e.g. Sameena"
                  className="input-field"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="e.g. Khan"
                  className="input-field"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address (College / Personal) *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="sameena@college.edu or sameena@gmail.com"
                className="input-field"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Student ID / Roll No *</label>
                <input
                  type="text"
                  name="studentId"
                  required
                  placeholder="e.g. 23CS045"
                  className="input-field font-mono uppercase"
                  value={form.studentId}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  className="input-field"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Academic Department *</label>
              <select
                name="departmentId"
                required
                className="input-field"
                value={form.departmentId}
                onChange={handleChange}
                disabled={loadingDepts}
              >
                <option value="">
                  {loadingDepts ? 'Loading academic departments...' : '-- Select Your Department --'}
                </option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-textMuted mt-1">
                Your complaints will automatically route to this department's HOD.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Min 6 characters"
                    className="input-field pr-10"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full rounded-full ${strength.color.split(' ')[0]}`} style={{ width: `${(strength.score / 4) * 100}%` }} />
                    </div>
                    <span className={`text-[11px] font-medium ${strength.color.split(' ')[1]}`}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Re-enter password"
                    className="input-field pr-10"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                  >
                    {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || loadingDepts}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Register Student Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-textMuted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

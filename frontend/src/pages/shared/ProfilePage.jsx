import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../components/layout'
import { profileService } from '../../services'
import { getErrorMessage } from '../../utils/formatters'
import { User, Mail, Phone, Building2, Shield, Save, Hash, CreditCard, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(user)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchProfile = () => {
    setLoading(true)
    profileService.get()
      .then(res => {
        setProfile(res.data)
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || ''
        })
        updateUser(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First and last name are required')
      return
    }
    setSaving(true)
    try {
      const res = await profileService.update(form)
      setProfile(res.data)
      updateUser(res.data)
      toast.success('Profile details updated successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const currentUser = profile || user
  const displayId = currentUser?.employeeId || (currentUser?.id ? `ID-${String(currentUser.id).padStart(4, '0')}` : '—')

  return (
    <DashboardLayout title="Institutional Profile">
      <div className="max-w-2xl">
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-md">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain">{currentUser?.fullName}</h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                {currentUser?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {[
              { icon: Hash, label: 'Database User ID', value: currentUser?.id ? `#${currentUser.id}` : '—' },
              { icon: CreditCard, label: 'Institution ID', value: displayId },
              { icon: Mail, label: 'Email Address', value: currentUser?.email },
              { icon: Shield, label: 'System Role', value: currentUser?.role },
              { icon: Building2, label: 'Department', value: currentUser?.departmentName || 'Campus Wide / Administration' },
              { icon: Phone, label: 'Phone Number', value: currentUser?.phone || 'Not registered' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-textMuted flex items-center gap-2">
                  <item.icon size={15} className="text-textMuted" />
                  {item.label}
                </span>
                <span className="font-semibold text-textMain">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-textMain mb-4">Edit Profile Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  className="input-field"
                  value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  className="input-field"
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                className="input-field"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Institutional Email</label>
              <input
                className="input-field bg-gray-50 text-textMuted cursor-not-allowed"
                value={currentUser?.email || ''}
                disabled
              />
              <p className="text-[11px] text-textMuted mt-1">
                Institutional email and role assignments are managed by System Administration.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? 'Saving changes...' : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

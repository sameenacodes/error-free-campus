import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingSpinner, Modal, EmptyState } from '../../components/ui'
import { adminService, publicService } from '../../services'
import { getErrorMessage } from '../../utils/formatters'
import { SERVICE_UNITS } from '../../utils/constants'
import { Users, Plus, Pencil, Power, Search, Shield, Building2, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['STUDENT', 'STAFF', 'HOD', 'PRINCIPAL', 'ADMIN']

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [serviceUnits, setServiceUnits] = useState(SERVICE_UNITS)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: 'Password@123', phone: '', employeeId: '', role: 'STUDENT', departmentId: '', serviceUnit: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([adminService.getUsers(0, 100), adminService.getDepartments(), publicService.getServiceUnits()])
      .then(([u, d, su]) => {
        setUsers(u.data.content || u.data || [])
        setDepartments(d.data || [])
        if (su?.data?.length) setServiceUnits(su.data)
      })
      .catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => {
    setEditUser(null)
    setForm({ firstName: '', lastName: '', email: '', password: 'Password@123', phone: '', employeeId: '', role: 'STUDENT', departmentId: '', serviceUnit: '' })
    setShowForm(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: '',
      phone: u.phone || '',
      employeeId: u.employeeId || '',
      role: u.role,
      departmentId: u.departmentId || '',
      serviceUnit: u.serviceUnit || ''
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Fill required fields')
      return
    }
    if (form.role === 'STAFF' && !form.serviceUnit) {
      toast.error('Please assign a Service Unit for Staff members')
      return
    }
    if (form.role === 'HOD' && !form.departmentId) {
      toast.error('Please assign an Academic Department for HOD')
      return
    }
    setSaving(true)
    try {
      if (editUser) {
        await adminService.updateUser(editUser.id, form)
      } else {
        await adminService.createUser(form)
      }
      toast.success(editUser ? 'User updated!' : 'User created!')
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id) => {
    try {
      await adminService.toggleUser(id)
      toast.success('User status updated')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const filtered = Array.isArray(users) ? users.filter(u =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.serviceUnit?.toLowerCase().includes(search.toLowerCase()) ||
    u.departmentName?.toLowerCase().includes(search.toLowerCase())
  ) : []

  if (loading) return <DashboardLayout title="User Management"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="User Management">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            className="input-field pl-9"
            placeholder="Search users, email, unit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Create User
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No users found" description="Create users to get started." /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-textMuted border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Academic Dept / Service Unit</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-textMain">{u.fullName}</td>
                  <td className="py-3 text-textMuted">{u.email}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-textMuted">
                    {u.role === 'STAFF' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                        <Wrench size={12} /> {u.serviceUnit || 'MAINTENANCE'}
                      </span>
                    ) : u.departmentName ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Building2 size={12} className="text-textMuted" /> {u.departmentName}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${u.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-textMuted hover:text-primary rounded-lg hover:bg-gray-100 mr-1" title="Edit User">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => toggleActive(u.id)} className="p-1.5 text-textMuted hover:text-warning rounded-lg hover:bg-gray-100" title="Toggle Status">
                      <Power size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editUser ? 'Edit User' : 'Create User'} maxWidth="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input className="input-field" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input className="input-field" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="label">Email *</label>
            <input className="input-field" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} disabled={!!editUser} />
          </div>
          {!editUser && (
            <div className="col-span-2">
              <label className="label">Password</label>
              <input className="input-field" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="label">Role *</label>
            <select className="input-field" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {form.role === 'STAFF' ? (
            <div>
              <label className="label">Service Unit / Team *</label>
              <select className="input-field" value={form.serviceUnit} onChange={e => setForm(p => ({ ...p, serviceUnit: e.target.value }))}>
                <option value="">Select Service Unit</option>
                {serviceUnits.map(u => <option key={u.code} value={u.code}>{u.name}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Academic Department {form.role === 'HOD' || form.role === 'STUDENT' ? '*' : ''}</label>
              <select className="input-field" value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
                <option value="">None / General</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="label">Phone</label>
            <input className="input-field" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Employee / Student ID</label>
            <input className="input-field" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

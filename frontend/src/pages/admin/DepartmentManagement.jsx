import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingSpinner, Modal, EmptyState } from '../../components/ui'
import { adminService } from '../../services'
import { getErrorMessage } from '../../utils/formatters'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DepartmentManagement() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = () => { adminService.getDepartments().then(r => setItems(r.data || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setShowForm(true) }
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code, description: d.description || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Name and code are required'); return }
    setSaving(true)
    try {
      if (editing) { await adminService.updateDepartment(editing.id, form) } else { await adminService.createDepartment(form) }
      toast.success(editing ? 'Updated!' : 'Created!'); setShowForm(false); load()
    } catch (err) { toast.error(getErrorMessage(err)) } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return
    try { await adminService.deleteDepartment(id); toast.success('Deleted!'); load() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  if (loading) return <DashboardLayout title="Department Management"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Department Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-textMuted text-sm">{items.length} departments</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Department</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(d => (
          <div key={d.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary"><Building2 size={20} /></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="p-1.5 text-textMuted hover:text-primary rounded-lg hover:bg-gray-100"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(d.id)} className="p-1.5 text-textMuted hover:text-danger rounded-lg hover:bg-gray-100"><Trash2 size={14} /></button>
              </div>
            </div>
            <h4 className="font-semibold text-textMain">{d.name}</h4>
            <p className="text-xs text-textMuted mt-0.5">Code: {d.code}</p>
            {d.description && <p className="text-xs text-textMuted mt-1">{d.description}</p>}
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-xs font-medium ${d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{d.active ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <div><label className="label">Name *</label><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Code *</label><input className="input-field" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} disabled={!!editing} /></div>
          <div><label className="label">Description</label><textarea className="input-field" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

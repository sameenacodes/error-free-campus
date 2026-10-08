import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingSpinner, Modal, EmptyState } from '../../components/ui'
import { adminService } from '../../services'
import { getErrorMessage } from '../../utils/formatters'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CategoryManagement() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = () => { adminService.getCategories().then(r => setItems(r.data || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editing) { await adminService.updateCategory(editing.id, form) } else { await adminService.createCategory(form) }
      toast.success(editing ? 'Updated!' : 'Created!'); setShowForm(false); load()
    } catch (err) { toast.error(getErrorMessage(err)) } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try { await adminService.deleteCategory(id); toast.success('Deleted!'); load() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  if (loading) return <DashboardLayout title="Category Management"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Category Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-textMuted text-sm">{items.length} categories</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Category</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => (
          <div key={c.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary"><Tag size={20} /></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 text-textMuted hover:text-primary rounded-lg hover:bg-gray-100"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-textMuted hover:text-danger rounded-lg hover:bg-gray-100"><Trash2 size={14} /></button>
              </div>
            </div>
            <h4 className="font-semibold text-textMain">{c.name}</h4>
            {c.description && <p className="text-xs text-textMuted mt-1">{c.description}</p>}
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-xs font-medium ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{c.active ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <div><label className="label">Name *</label><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
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

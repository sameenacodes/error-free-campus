import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../components/layout'
import { LoadingSpinner } from '../../components/ui'
import { complaintService, publicService, aiService } from '../../services'
import { getErrorMessage, formatComplaintId } from '../../utils/formatters'
import { PRIORITIES, SERVICE_UNITS } from '../../utils/constants'
import { Send, Sparkles, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Cpu, ExternalLink, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateComplaint() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', serviceUnit: '', priority: 'MEDIUM', location: '', additionalNotes: '' })
  const [categories, setCategories] = useState([])
  const [serviceUnits, setServiceUnits] = useState(SERVICE_UNITS)
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false)

  useEffect(() => {
    publicService.getCategories()
      .then(c => setCategories(c.data || [])).catch(() => {})
    publicService.getServiceUnits()
      .then(su => { if (su.data?.length) setServiceUnits(su.data) }).catch(() => {})
  }, [])

  const updateField = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const analyzeWithAi = async () => {
    if (!form.title || !form.description) {
      toast.error('Please enter title and description first')
      return
    }
    setAiLoading(true)
    try {
      const r = await aiService.analyze(form.title, form.description)
      setAiResult(r.data)
      setIgnoreDuplicate(false)
      if (r.data?.duplicateFound) {
        toast('Potential duplicate ticket detected', { icon: '⚠️' })
      } else {
        toast.success('Analysis completed!')
      }
    } catch {
      setAiResult({
        aiAvailable: false,
        message: 'AI suggestions are currently unavailable. You can continue manually.'
      })
    } finally {
      setAiLoading(false)
    }
  }

  const applyAiSuggestions = () => {
    if (!aiResult || !aiResult.aiAvailable) return
    const cat = categories.find(c => c.name?.toLowerCase() === aiResult.suggestedCategory?.toLowerCase())
    setForm(p => ({
      ...p,
      categoryId: cat ? cat.id : p.categoryId,
      serviceUnit: aiResult.suggestedServiceUnit || p.serviceUnit,
      priority: aiResult.suggestedPriority || p.priority,
    }))
    toast.success('AI suggestions applied!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required')
      return
    }
    if (aiResult?.duplicateFound && !ignoreDuplicate) {
      toast.error('Please review the duplicate notice below before submitting')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || null,
        serviceUnit: form.serviceUnit || null
      }
      await complaintService.create(payload)
      toast.success('Complaint submitted to your Department HOD!')
      navigate('/student/complaints')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Report an Issue">
      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Student Academic Department Header */}
        <div className="card mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">Your Academic Department</p>
                <p className="text-base font-bold text-textMain">{user?.departmentName || 'Assigned Department'}</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
              Direct Route → {user?.departmentName ? `${user.departmentName} HOD` : 'Department HOD'}
            </span>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-textMain mb-4">Complaint Details</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Complaint Title *</label>
              <input
                className="input-field"
                placeholder="Brief summary of the issue (e.g. Library AC is not working / CSE lab projector faulty)"
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea
                className="input-field min-h-[120px]"
                placeholder="Provide detailed description of the issue, symptoms, safety concerns, or equipment fault..."
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Target Service Unit (Optional)</label>
                <select className="input-field" value={form.serviceUnit} onChange={e => updateField('serviceUnit', e.target.value)}>
                  <option value="">Auto-predict with AI</option>
                  {serviceUnits.map(u => <option key={u.code} value={u.code}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Priority Level</label>
                <select className="input-field" value={form.priority} onChange={e => updateField('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location / Block / Room</label>
                <input className="input-field" placeholder="e.g. Central Library 2nd Floor / CSE Lab 2" value={form.location} onChange={e => updateField('location', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Additional Notes (Optional)</label>
              <textarea className="input-field min-h-[70px]" placeholder="Any other relevant context..." value={form.additionalNotes} onChange={e => updateField('additionalNotes', e.target.value)} />
            </div>
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-textMain">AI Complaint Intelligence</h3>
            </div>
            <button
              type="button"
              onClick={analyzeWithAi}
              disabled={aiLoading}
              className="btn-secondary text-sm flex items-center gap-2 self-start sm:self-auto"
            >
              {aiLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles size={16} /> Analyze with AI</>
              )}
            </button>
          </div>

          {!aiResult && !aiLoading && (
            <p className="text-sm text-textMuted">
              Enter a title and description, then click "Analyze with AI" to receive automated classification, priority assessment, resolution guidance, and duplicate detection.
            </p>
          )}

          {/* Engine indicator badge */}
          {aiResult && aiResult.aiAvailable && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {aiResult.source === 'AI_MODEL' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Sparkles size={13} /> AI Generated (Google Gemini)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <Cpu size={13} /> Rule-based Fallback Engine (Deterministic Classification)
                </span>
              )}
            </div>
          )}

          {/* Duplicate Detection Alert */}
          {aiResult?.duplicateFound && (
            <div className="p-4 mb-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">Similar Unresolved Complaint Already Exists</h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Existing Ticket <strong>#{formatComplaintId(aiResult.duplicateComplaintId)}: {aiResult.duplicateComplaintTitle}</strong> (Similarity: {Math.round(aiResult.duplicateSimilarity * 100)}%)
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/student/complaints/${aiResult.duplicateComplaintId}`)}
                      className="text-xs font-semibold text-primary underline flex items-center gap-1"
                    >
                      View Existing Complaint <ExternalLink size={12} />
                    </button>
                    {!ignoreDuplicate && (
                      <button
                        type="button"
                        onClick={() => setIgnoreDuplicate(true)}
                        className="btn-ghost text-xs px-2.5 py-1 rounded border border-amber-300 text-amber-900 hover:bg-amber-100"
                      >
                        Continue as New Complaint Anyway
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {aiResult && aiResult.aiAvailable && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Category', value: aiResult.suggestedCategory, conf: aiResult.categoryConfidence },
                  { label: 'Priority', value: aiResult.suggestedPriority, conf: aiResult.priorityConfidence },
                  { label: 'Suggested Service Unit', value: aiResult.suggestedServiceUnit },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-textMuted font-medium mb-1">{item.label}</p>
                    <p className="font-semibold text-textMain text-sm">{item.value || '—'}</p>
                    {item.conf != null && (
                      <p className="text-xs text-primary font-medium mt-0.5">
                        Confidence: {Math.round(item.conf * 100)}%
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {aiResult.summary && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-textMuted font-medium mb-1">Executive Summary</p>
                  <p className="text-sm text-textMain">{aiResult.summary}</p>
                </div>
              )}

              {aiResult.suggestedResolution && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs text-emerald-800 font-semibold mb-1">Recommended Resolution Plan</p>
                  <p className="text-sm text-textMain whitespace-pre-line leading-relaxed">{aiResult.suggestedResolution}</p>
                </div>
              )}

              {aiResult.sentiment && (
                <div className="flex gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex-1">
                    <p className="text-xs text-textMuted font-medium">Sentiment Detected</p>
                    <p className="text-sm font-semibold text-textMain mt-0.5">{aiResult.sentiment}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex-1">
                    <p className="text-xs text-textMuted font-medium">Urgency Assessment</p>
                    <p className="text-sm font-semibold text-textMain mt-0.5">{aiResult.urgencyLevel}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={applyAiSuggestions}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} /> Apply Suggestions to Form
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || (aiResult?.duplicateFound && !ignoreDuplicate)}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Complaint</>}
          </button>
          <button type="button" onClick={() => navigate('/student/complaints')} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </DashboardLayout>
  )
}

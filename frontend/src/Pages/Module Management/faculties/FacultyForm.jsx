import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const EMPTY = { name: '', code: '', description: '' }

const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"

export default function FacultyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (!isEdit) return
    axios.get(`http://localhost:5000/api/faculties/${id}`)
      .then(({ data }) => {
        const f = data.data ?? data
        setForm({ name: f.name, code: f.code, description: f.description || '' })
      })
      .catch(() => toast.error('Failed to load faculty'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return toast.error('Name and Code are required')
    setSaving(true)
    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/faculties/${id}`, form)
        toast.success('Faculty updated')
        navigate(`/faculties/${id}`)
      } else {
        const { data } = await axios.post('http://localhost:5000/api/faculties', form)
        toast.success('Faculty created')
        navigate(`/faculties/${(data.data ?? data)._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-sm text-gray-400">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Loading...
    </div>
  )

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/faculties" className="hover:text-blue-600 transition-colors">Faculties</Link>
        <span>/</span>
        <span className="text-gray-700">{isEdit ? 'Edit Faculty' : 'New Faculty'}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit Faculty' : 'New Faculty'}</h1>
      <p className="text-sm text-gray-500 mb-6">{isEdit ? 'Update faculty details below' : 'Fill in the details to create a faculty'}</p>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Faculty Name *</label>
            <input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Faculty of Engineering" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Faculty Code *</label>
            <input
              className={inputCls}
              value={form.code}
              onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. ENG"
              maxLength={10}
            />
            <p className="text-xs text-gray-400 mt-1">Unique short code — auto-uppercased</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.description} onChange={set('description')} placeholder="Optional description..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Faculty'}
            </button>
            <Link to={isEdit ? `/faculties/${id}` : '/faculties'} className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

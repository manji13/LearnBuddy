import API_URL from '../../../api/config';
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import EmployeeNavbar from '../../../Components/NavBar/employeeNavbar';

const EMPTY = { name: '', code: '', description: '' }
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"

export default function FacultyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form,        setForm]        = useState(EMPTY)
  const [loading,     setLoading]     = useState(isEdit)
  const [saving,      setSaving]      = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ name: '', code: '' })
  const [faculties,   setFaculties]   = useState([])
  const [facLoading,  setFacLoading]  = useState(true)

  // Load faculties list for the left panel
  useEffect(() => {
    axios.get(`${API_URL}/faculties`)
      .then(({ data }) => {
        const list = data.data ?? data
        setFaculties(Array.isArray(list) ? list : [])
      })
      .catch(() => toast.error('Failed to load faculties list'))
      .finally(() => setFacLoading(false))
  }, [])

  // Load current faculty if editing
  useEffect(() => {
    if (!isEdit) return
    axios.get(`${API_URL}/faculties/${id}`)
      .then(({ data }) => {
        const f = data.data ?? data
        setForm({ name: f.name, code: f.code, description: f.description || '' })
      })
      .catch(() => toast.error('Failed to load faculty'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = k => e => {
    const value = e.target.value
    setForm(p => ({ ...p, [k]: value }))
    // Clear specific field error when user starts typing
    if (k === 'name') setFieldErrors(prev => ({ ...prev, name: '' }))
    if (k === 'code') setFieldErrors(prev => ({ ...prev, code: '' }))
  }

  // Validation helper – returns true if valid, false otherwise and shows toast popups
  const validateForm = () => {
    const nameTrimmed = form.name.trim()
    const codeTrimmed = form.code.trim()

    // 1. Name required
    if (!nameTrimmed) {
      toast.error('Faculty name is required')
      setFieldErrors(prev => ({ ...prev, name: 'Name is required' }))
      return false
    }

    // 2. Name cannot contain numbers
    if (/\d/.test(nameTrimmed)) {
      toast.error('Faculty name cannot contain numbers')
      setFieldErrors(prev => ({ ...prev, name: 'Faculty name cannot contain numbers' }))
      return false
    }

    // 3. Name only letters, spaces, apostrophes, hyphens (optional stricter rule)
    if (!/^[A-Za-z\s'-]+$/.test(nameTrimmed)) {
      toast.error('Faculty name can only contain letters, spaces, apostrophes, or hyphens')
      setFieldErrors(prev => ({ ...prev, name: 'Invalid characters in name' }))
      return false
    }

    // 4. Code required
    if (!codeTrimmed) {
      toast.error('Faculty code is required')
      setFieldErrors(prev => ({ ...prev, code: 'Code is required' }))
      return false
    }

    // 5. Code must be uppercase letters only (no spaces, no numbers)
    if (!/^[A-Z]+$/.test(codeTrimmed)) {
      toast.error('Faculty code must contain only uppercase letters (A-Z), no spaces or numbers')
      setFieldErrors(prev => ({ ...prev, code: 'Only uppercase letters allowed' }))
      return false
    }

    // 6. Code length between 2 and 10 characters
    if (codeTrimmed.length < 2 || codeTrimmed.length > 10) {
      toast.error('Faculty code must be between 2 and 10 characters')
      setFieldErrors(prev => ({ ...prev, code: 'Code must be 2–10 characters' }))
      return false
    }

    // 7. Optional: Description length limit (e.g., max 500 chars)
    if (form.description && form.description.length > 500) {
      toast.error('Description cannot exceed 500 characters')
      return false
    }

    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/faculties/${id}`, form)
        toast.success('Faculty updated successfully')
        navigate(`/faculties/${id}`)
      } else {
        const { data } = await axios.post(`${API_URL}/faculties`, form)
        toast.success('Faculty created successfully')
        navigate(`/faculties/${(data.data ?? data)._id}`)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong'
      toast.error(errorMsg)
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
    <div className="min-h-screen bg-slate-50 font-sans">
      <EmployeeNavbar />

      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT PANEL: Previously Created Faculties ── */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Existing Faculties</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {facLoading ? 'Loading…' : `${faculties.length} facult${faculties.length === 1 ? 'y' : 'ies'} found`}
                  </p>
                </div>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                  {facLoading ? '…' : faculties.length}
                </span>
              </div>

              {/* List */}
              <ul className="divide-y divide-gray-50 max-h-[calc(100vh-14rem)] overflow-y-auto">
                {facLoading ? (
                  <li className="px-5 py-8 flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-xs">Loading faculties…</span>
                  </li>
                ) : faculties.length === 0 ? (
                  <li className="px-5 py-10 text-center text-sm text-gray-400">
                    No faculties created yet.
                  </li>
                ) : (
                  faculties.map(fac => (
                    <li key={fac._id}>
                      <Link
                        to={`/faculties/${fac._id}`}
                        className={`flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group ${id === fac._id ? 'bg-blue-50' : ''}`}
                      >
                        {/* Code badge */}
                        <span className={`mt-0.5 inline-flex items-center justify-center min-w-[2.5rem] h-7 px-2 rounded-md text-[11px] font-bold tracking-wide flex-shrink-0
                          ${id === fac._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                          } transition-colors`}>
                          {fac.code}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${id === fac._id ? 'text-blue-700' : 'text-gray-800'}`}>
                            {fac.name}
                          </p>
                          {fac.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{fac.description}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>

              {/* Footer link */}
              <div className="px-5 py-3 border-t border-gray-100 bg-slate-50">
                <Link to="/faculties" className="text-xs text-blue-600 hover:underline font-medium">
                  View all faculties →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── RIGHT PANEL: Form ── */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isEdit ? 'Edit Faculty' : 'New Faculty'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {isEdit ? 'Update faculty details below' : 'Fill in the details to create a new faculty'}
            </p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Faculty Name *
                  </label>
                  <input
                    className={`${inputCls} ${fieldErrors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Faculty of Engineering"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Faculty Code *
                  </label>
                  <input
                    className={`${inputCls} ${fieldErrors.code ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                    value={form.code}
                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. ENG"
                    maxLength={10}
                  />
                  {fieldErrors.code && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.code}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Unique short code — only uppercase letters, 2–10 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Description
                  </label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Optional description (max 500 characters)…"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {form.description.length}/500
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Faculty'}
                  </button>
                  <Link
                    to={isEdit ? `/faculties/${id}` : '/faculties'}
                    className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}